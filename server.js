import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { createBlogRouter } from './modules/blog.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- SECURITY SECRETS ---
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || JWT_SECRET;

if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET must be set in .env. Refusing to start.');
  process.exit(1);
}

// --- DATABASE FAILOVER CLUSTER (cloud-primary, local-standby) ---
// Links BOTH databases to this system: Aiven cloud (primary) + local XAMPP
// MariaDB (hot standby). If cloud goes down, auto-fails-over to local within
// ~8s and reclaims cloud when it recovers. DB_PREFER=cloud makes cloud primary.
const IS_LOCAL = (h) => ['localhost', '127.0.0.1', '::1'].includes((h || '').toLowerCase());

function cloudSslOptions() {
  if (process.env.DB_SSL !== 'true') return {};
  const caPath = path.join(process.cwd(), 'server', 'config', 'aiven-ca.pem');
  return {
    ssl: { ca: fs.readFileSync(caPath, 'utf8'), minVersion: 'TLSv1.2', rejectUnauthorized: false },
  };
}

function buildNode(opts) {
  return {
    ...opts,
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 8000,
  };
}

const dbCluster = mysql.createPoolCluster({
  canRetry: true,
  removeNodeErrorCount: 1,
  restoreNodeTimeout: 5000,
  defaultSelector: 'ORDER',
});

const prefer = (process.env.DB_PREFER || 'cloud').toLowerCase();
const nodes = [];

const cloudHost = process.env.DB_HOST || process.env.DB_CLOUD_HOST;
if (cloudHost) {
  nodes.push({
    name: IS_LOCAL(cloudHost) ? 'local' : 'claude',
    opts: buildNode({
      host: cloudHost,
      port: Number(process.env.DB_PORT || process.env.DB_CLOUD_PORT || 3306),
      user: process.env.DB_USER || process.env.DB_CLOUD_USER || 'avnadmin',
      password:
        process.env.DB_PASSWORD !== undefined
          ? process.env.DB_PASSWORD
          : process.env.DB_CLOUD_PASSWORD,
      ...cloudSslOptions(),
    }),
  });
}

const hasLocal = process.env.DB_HOST_2 || process.env.DB_PORT_2 || process.env.DB_USER_2;
if (hasLocal) {
  nodes.push({
    name: 'local',
    opts: buildNode({
      host: process.env.DB_HOST_2 || '127.0.0.1',
      port: Number(process.env.DB_PORT_2 || 3306),
      user: process.env.DB_USER_2 || 'root',
      password: process.env.DB_PASSWORD_2 !== undefined ? process.env.DB_PASSWORD_2 : '',
      ssl: process.env.DB_SSL_2 === 'true',
    }),
  });
}

if (prefer === 'cloud') {
  nodes.sort((a, b) => (a.name === 'claude' ? -1 : b.name === 'claude' ? 1 : 0));
}

nodes.forEach((n, i) => dbCluster.add(`db-${n.name}-${i}`, n.opts));

dbCluster.on('offline', (id) =>
  console.error(`[DB CLUSTER] ${id} offline — failing over to the other database`),
);
dbCluster.on('remove', (id) => console.error(`[DB CLUSTER] ${id} removed from rotation`));
dbCluster.on('warn', (err) => console.warn(`[DB CLUSTER] warn: ${err.code || err.message}`));

const mainDb = dbCluster.of('*', 'ORDER');

// --- LOCAL STANDBY POOL (dual-write target) ---
// User-registration writes go to BOTH the cluster (cloud primary) AND this local
// pool simultaneously, so both databases always have the same user records.
const localPool = mysql.createPool({
  host: process.env.DB_HOST_2 || '127.0.0.1',
  port: Number(process.env.DB_PORT_2 || 3306),
  user: process.env.DB_USER_2 || 'root',
  password: process.env.DB_PASSWORD_2 !== undefined ? process.env.DB_PASSWORD_2 : '',
  database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main',
  waitForConnections: true,
  connectionLimit: 10,
});

// Execute a write query on BOTH databases simultaneously.
// Cloud (via cluster) is primary; local is kept in sync. If local is unreachable,
// the write still succeeds on cloud (local sync can be re-run via sync script).
async function dualWrite(sql, values) {
  const cloudResult = await mainDb.query(sql, values);
  try {
    await localPool.query(sql, values);
  } catch (localErr) {
    console.warn(
      '[DUAL-WRITE] local standby write failed (cloud OK):',
      localErr.code || localErr.message,
    );
  }
  return cloudResult;
}

// --- AUTH HELPERS ---
function signAdminSessionToken(userId) {
  const payload = { uid: Number(userId), exp: Date.now() + 24 * 60 * 60 * 1000 };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(body)
    .digest('base64url');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.uid || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ success: false, message: 'Handshake Required' });
  const payload = verifyAdminSessionToken(m[1].trim());
  if (!payload) return res.status(401).json({ success: false, message: 'Token Expired' });
  req.adminId = payload.uid;
  next();
};

// --- MIDDLEWARE ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // Multi-port frontends
  'http://localhost:5174',
  'http://127.0.0.1:5174', // Admin panel
  'http://localhost:5175',
  'http://127.0.0.1:5175', // Departments
  'http://localhost:5176',
  'http://127.0.0.1:5176', // Employees
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Health Check
app.get('/api/health', (req, res) => res.json({ success: true, status: 'GSS-NODE-ONLINE' }));

// Profile Photo Retrieval Helper
const getProfilePhotoData = (user) => {
  if (!user.profile_photo_blob) return null;
  const base64 = Buffer.from(user.profile_photo_blob).toString('base64');
  const mimeType = user.profile_photo_type || 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
};

// Profile Photo stream by role + id (used by AdminLayout navbar, UserDetail, Settings)
// Returns the raw image bytes with correct Content-Type so <img src=...> works directly
app.get('/api/admin/profile-photo/:role/:id', async (req, res) => {
  const { role, id } = req.params;
  try {
    let table = 'admin_users';
    if (role === 'developer') table = 'developer_users';
    else if (role === 'user' || role === 'client') table = 'users';

    const [rows] = await mainDb.query(
      `SELECT profile_photo_blob, profile_photo_mime_type FROM ${table} WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
      [id],
    );
    if (rows.length > 0 && rows[0].profile_photo_blob) {
      const mime = rows[0].profile_photo_mime_type || 'image/jpeg';
      res.set('Content-Type', mime);
      res.set('Cache-Control', 'no-cache');
      return res.send(Buffer.from(rows[0].profile_photo_blob));
    }
    res.status(404).json({ success: false, message: 'No photo' });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Upload profile photo (Settings page) — writes to cloud + local simultaneously
app.post('/api/admin/profile-photo', authenticateAdmin, async (req, res) => {
  const { userId, role, imageBase64, fileName, contentType } = req.body;
  if (!userId || !imageBase64)
    return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const mime = contentType || 'image/jpeg';
    let table = 'admin_users';
    if (role === 'developer') table = 'developer_users';
    else if (role === 'user' || role === 'client') table = 'users';

    await dualWrite(
      `UPDATE ${table} SET profile_photo_blob = ?, profile_photo_mime_type = ?, profile_photo_file_name = ?, updated_at = NOW() WHERE id = ?`,
      [buffer, mime, fileName || 'profile.jpg', userId],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Delete profile photo (Settings page)
app.delete('/api/admin/profile-photo', authenticateAdmin, async (req, res) => {
  const { userId, role } = req.body;
  if (!userId) return res.status(400).json({ success: false });
  try {
    let table = 'admin_users';
    if (role === 'developer') table = 'developer_users';
    else if (role === 'user' || role === 'client') table = 'users';

    await dualWrite(
      `UPDATE ${table} SET profile_photo_blob = NULL, profile_photo_mime_type = NULL, profile_photo_file_name = NULL, updated_at = NOW() WHERE id = ?`,
      [userId],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// --- AUTH & IDENTITY ---

// Lookup photo by email
app.get('/api/admin/profile-lookup', async (req, res) => {
  const { email } = req.query;
  try {
    const [users] = await mainDb.query(
      `
            SELECT i.data as profile_photo_blob, i.content_type as profile_photo_type
            FROM admin_users au
            LEFT JOIN images i ON au.profile_image_id = i.id
            WHERE au.email = ? AND au.deleted_at IS NULL LIMIT 1
        `,
      [email],
    );
    if (users.length > 0 && users[0].profile_photo_blob) {
      return res.json({ success: true, photoData: getProfilePhotoData(users[0]) });
    }
    res.json({ success: false });
  } catch (err) {
    res.json({ success: false });
  }
});

// Photo Upload
app.post('/api/images/profile', async (req, res) => {
  const { dataBase64, contentType, fileName } = req.body;
  if (!dataBase64) return res.status(400).json({ success: false });
  try {
    const buffer = Buffer.from(dataBase64, 'base64');
    const [result] = await mainDb.query(
      'INSERT INTO images (file_name, content_type, data, file_size, created_at) VALUES (?, ?, ?, ?, NOW())',
      [fileName || 'profile.jpg', contentType || 'image/jpeg', buffer, buffer.length],
    );
    res.json({ success: true, image_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// LOGIN
app.post('/api/admin-verification/authenticate-enhanced', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await mainDb.query(
      `
            SELECT au.*, i.data as profile_photo_blob, i.content_type as profile_photo_type
            FROM admin_users au
            LEFT JOIN images i ON au.profile_image_id = i.id
            WHERE au.email = ? AND au.deleted_at IS NULL LIMIT 1
        `,
      [email],
    );

    if (users.length > 0) {
      const user = users[0];
      if (await bcryptjs.compare(password, user.password_hash)) {
        const token = signAdminSessionToken(user.id);
        await mainDb.query(
          'UPDATE admin_users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
          [req.ip || 'unknown', user.id],
        );
        return res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.display_name || `${user.first_name} ${user.last_name}`,
            role: 'admin',
            admin_level: user.admin_level || 'admin',
            photoData: getProfilePhotoData(user),
          },
        });
      }
    }
    res.status(401).json({ success: false, message: 'Identity Rejected' });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// REGISTER
app.post('/api/admin-verification/register', async (req, res) => {
  const { first_name, last_name, email, password, profile_image_id } = req.body;
  try {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const displayName = `${first_name} ${last_name}`;
    const [result] = await dualWrite(
      `INSERT INTO admin_users (first_name, last_name, display_name, email, password_hash, admin_level, profile_image_id, is_active, created_at)
             VALUES (?, ?, ?, ?, ?, 'admin', ?, 1, NOW())`,
      [first_name, last_name, displayName, email, hashedPassword, profile_image_id || null],
    );
    res.json({ success: true, userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Identity Conflict' });
    res.status(500).json({ success: false, message: 'Protocol Error' });
  }
});

// SESSION
app.get('/api/admin/session', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    const payload = m ? verifyAdminSessionToken(m[1].trim()) : null;
    if (!payload) return res.status(401).json({ success: false });

    const [users] = await mainDb.query(
      `
        SELECT au.*, i.data as profile_photo_blob, i.content_type as profile_photo_type
        FROM admin_users au LEFT JOIN images i ON au.profile_image_id = i.id
        WHERE au.id = ? AND au.deleted_at IS NULL LIMIT 1
    `,
      [payload.uid],
    );

    if (users.length > 0) {
      const user = users[0];
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.display_name || `${user.first_name} ${user.last_name}`,
          role: 'admin',
          admin_level: user.admin_level || 'admin',
          photoData: getProfilePhotoData(user),
        },
      });
    }
    res.status(404).json({ success: false });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// --- CORE SYSTEM RELAYS ---

// Projects Relay
app.get('/api/user-projects', async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      'SELECT * FROM user_projects WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    res.json(rows); // Frontend expects array
  } catch (err) {
    res.status(500).json([]);
  }
});

// Invoices Relay
app.get('/api/invoices', async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      'SELECT * FROM invoices WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    res.json({ success: true, invoices: rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Ledger Relay
app.get('/api/admin/ledger', async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      'SELECT * FROM accounting_entries WHERE deleted_at IS NULL ORDER BY transaction_date DESC',
    );
    res.json({ success: true, entries: rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Users Management
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await mainDb.query(
      "SELECT id, display_name, email, primary_role as role, is_active, 'client' as source_table FROM users WHERE deleted_at IS NULL",
    );
    const [admins] = await mainDb.query(
      "SELECT id, display_name, email, admin_level as role, is_active, 'admin' as source_table FROM admin_users WHERE deleted_at IS NULL",
    );
    res.json({ success: true, users: [...users, ...admins] });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// --- IDENTITY MANAGEMENT (Identity Hub) ---
const CLIENT_IDENTITY_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone_number',
  'alt_phone',
  'physical_address',
  'id_number',
  'expertise',
  'private_notes',
  'emergency_contact_name',
  'emergency_contact_phone',
  'manual_projects',
  'mission_briefing',
  'department',
  'is_active',
];
const ADMIN_IDENTITY_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone_number',
  'alt_phone',
  'physical_address',
  'id_number',
  'expertise',
  'private_notes',
  'emergency_contact_name',
  'emergency_contact_phone',
  'manual_projects',
  'mission_briefing',
  'department',
  'is_active',
];

function pickIdentityFields(body, allowed) {
  const out = {};
  for (const k of allowed) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  if (out.first_name || out.last_name) {
    out.display_name = `${body.first_name || ''} ${body.last_name || ''}`.trim();
  }
  return out;
}

// Read one identity (client or admin) — powers Identity detail + edit views
app.get('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const roleType = (req.query.role_type || 'client').toLowerCase();
  try {
    if (roleType === 'admin') {
      const [rows] = await mainDb.query(
        'SELECT id, first_name, last_name, display_name, email, phone_number, alt_phone, physical_address, id_number, expertise, private_notes, emergency_contact_name, emergency_contact_phone, manual_projects, mission_briefing, department, admin_level, is_active, last_login_at, created_at FROM admin_users WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [req.params.id],
      );
      if (!rows.length)
        return res.status(404).json({ success: false, message: 'Identity not found' });
      return res.json({ success: true, user: { ...rows[0], source_table: 'admin' } });
    }
    const [rows] = await mainDb.query(
      'SELECT id, first_name, last_name, display_name, email, phone_number, alt_phone, physical_address, id_number, expertise, private_notes, emergency_contact_name, emergency_contact_phone, manual_projects, mission_briefing, department, primary_role, is_active, last_login_at, created_at FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1',
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Identity not found' });
    res.json({ success: true, user: { ...rows[0], source_table: 'client' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Protocol Error' });
  }
});

// Update identity (Recalibrate Identity form)
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const roleType = (req.query.role_type || 'client').toLowerCase();
  try {
    const body = { ...req.body };
    delete body.password_hash;
    const fields = pickIdentityFields(
      body,
      roleType === 'admin' ? ADMIN_IDENTITY_FIELDS : CLIENT_IDENTITY_FIELDS,
    );
    if (body.password) {
      fields.password_hash = await bcryptjs.hash(String(body.password), 10);
    }
    if (roleType === 'admin') {
      fields.admin_level = body.admin_level || body.role || 'admin';
    } else if (body.role) {
      fields.primary_role = body.role;
    }
    if (fields.is_active !== undefined) fields.is_active = fields.is_active ? 1 : 0;
    if (!Object.keys(fields).length) return res.json({ success: true });
    fields.updated_at = new Date();
    fields.updated_by = req.adminId;
    const table = roleType === 'admin' ? 'admin_users' : 'users';
    await mainDb.query(`UPDATE ${table} SET ? WHERE id = ? AND deleted_at IS NULL`, [
      fields,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY')
      return res
        .status(409)
        .json({ success: false, message: 'Email already registered to another identity' });
    res.status(500).json({ success: false, message: 'Protocol Error' });
  }
});

// Terminate identity (soft delete — records kept for audit)
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const roleType = (req.query.role_type || 'client').toLowerCase();
  try {
    if (roleType === 'admin' && Number(req.params.id) === Number(req.adminId)) {
      return res
        .status(400)
        .json({ success: false, message: 'You cannot terminate your own admin node.' });
    }
    const table = roleType === 'admin' ? 'admin_users' : 'users';
    const [result] = await mainDb.query(
      `UPDATE ${table} SET deleted_at = NOW(), is_active = 0, deleted_by = ? WHERE id = ? AND deleted_at IS NULL`,
      [req.adminId, req.params.id],
    );
    if (!result.affectedRows)
      return res
        .status(404)
        .json({ success: false, message: 'Identity not found or already terminated' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Protocol Error' });
  }
});

// Identity password reset — generates a temp password the admin relays securely
app.post('/api/admin/users/:id/whatsapp-password-reset', authenticateAdmin, async (req, res) => {
  const roleType = (req.query.role_type || 'client').toLowerCase();
  try {
    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
    const hash = await bcryptjs.hash(tempPassword, 10);
    const table = roleType === 'admin' ? 'admin_users' : 'users';
    const [result] = await mainDb.query(
      `UPDATE ${table} SET password_hash = ?, password_reset_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE id = ? AND deleted_at IS NULL`,
      [hash, req.params.id],
    );
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Identity not found' });
    res.json({
      success: true,
      tempPassword,
      message:
        'Temp password generated — relay it to the identity via WhatsApp or a secure channel.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Protocol Error' });
  }
});

// Create identity (Personnel Entry form) — client profile or admin/developer node
app.post('/api/users/admin-create', authenticateAdmin, async (req, res) => {
  const body = req.body || {};
  const { first_name, last_name, email, password } = body;
  if (!first_name || !last_name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'First name, last name, email and password are required' });
  }
  try {
    const hash = await bcryptjs.hash(String(password), 10);
    const displayName = `${first_name} ${last_name}`.trim();
    const shared = [
      body.department || null,
      body.mission_briefing || null,
      body.phone_number || null,
      body.alt_phone || null,
      body.physical_address || null,
      body.id_number || null,
      body.expertise || null,
      body.private_notes || null,
      body.emergency_contact_name || null,
      body.emergency_contact_phone || null,
      body.manual_projects || null,
      req.adminId,
    ];
    if (body.role === 'admin' || body.role === 'developer') {
      const [result] = await dualWrite(
        'INSERT INTO admin_users (first_name, last_name, display_name, email, password_hash, admin_level, department, mission_briefing, phone_number, alt_phone, physical_address, id_number, expertise, private_notes, emergency_contact_name, emergency_contact_phone, manual_projects, is_active, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?)',
        [first_name, last_name, displayName, email, hash, body.role, ...shared],
      );
      return res.json({ success: true, userId: result.insertId });
    }
    const [result] = await dualWrite(
      "INSERT INTO users (first_name, last_name, display_name, email, password_hash, primary_role, department, mission_briefing, phone_number, alt_phone, physical_address, id_number, expertise, private_notes, emergency_contact_name, emergency_contact_phone, manual_projects, is_active, created_at, created_by) VALUES (?, ?, ?, ?, ?, 'user', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?)",
      [first_name, last_name, displayName, email, hash, ...shared],
    );
    res.json({ success: true, userId: result.insertId });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY')
      return res
        .status(409)
        .json({ success: false, message: 'Identity Conflict — email already registered' });
    res.status(500).json({ success: false, message: 'Protocol Error' });
  }
});

// Mission Control Dashboard
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const [[adminCount]] = await mainDb.query(
      'SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1 AND deleted_at IS NULL',
    );
    const [[userCount]] = await mainDb.query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND deleted_at IS NULL',
    );
    const [[activeProjects]] = await mainDb.query(
      "SELECT COUNT(*) as count FROM user_projects WHERE status IN ('in-progress', 'active') AND deleted_at IS NULL",
    );
    const [[pendingApprovals]] = await mainDb.query(
      "SELECT COUNT(*) as count FROM user_projects WHERE status IN ('planning', 'pending') AND deleted_at IS NULL",
    );
    let recentActivity = [];
    try {
      const [logs] = await mainDb.query(
        'SELECT action_description as action, timestamp FROM activity_logs ORDER BY timestamp DESC LIMIT 8',
      );
      recentActivity = logs;
    } catch (logErr) {
      recentActivity = [];
    }
    res.json({
      success: true,
      dashboard: {
        userCounts: {
          total: adminCount.count + userCount.count,
          verified: 0,
          live: 0,
          total_active_projects: activeProjects.count,
        },
        pending_count: pendingApprovals.count,
        recentActivity,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Financial Telemetry
app.get('/api/admin/budget-overview', async (req, res) => {
  try {
    const [fn] = await mainDb.query(
      "SELECT COALESCE(SUM(CASE WHEN entry_type IN ('income','invoice_payment') THEN amount ELSE 0 END),0) as revenue, COALESCE(SUM(CASE WHEN entry_type='expense' THEN amount ELSE 0 END),0) as expenses FROM accounting_entries WHERE deleted_at IS NULL AND payment_status='completed'",
    );
    const r = fn[0]?.revenue || 0,
      e = fn[0]?.expenses || 0;
    res.json({
      success: true,
      data: { revenue: r, expenses: e, net_income: r - e, spent: e, remaining: r - e },
    });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// Pending Approvals Relay (projects awaiting audit)
app.get('/api/admin/pending-approvals', async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      "SELECT id, project_name as name, client_name, status, created_at FROM user_projects WHERE status IN ('planning', 'pending') AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 10",
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

// Team Relay
app.get('/api/admin/team', async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      'SELECT id, name, role, department, is_active FROM team_members ORDER BY name ASC',
    );
    res.json({ success: true, team: rows });
  } catch (err) {
    res.json({ success: true, team: [] });
  }
});

// Node Settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    const [settings] = await mainDb.query('SELECT * FROM admin_settings');
    const m = {};
    settings.forEach((s) => {
      m[s.setting_key] = s.setting_value;
    });
    res.json({ success: true, settings: m });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ======================== BLOG MANAGEMENT ========================
// Dedicated module in ./modules/blog.js — shares the same databases as the
// website backend (both use the DB_* vars from .env). Creates/edits here are
// visible on the website and vice-versa.
app.use('/api/blog-articles', createBlogRouter(mainDb));

// Search Relay
app.get('/api/admin/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, results: [] });
  const term = `%${q}%`;
  try {
    const [projects] = await mainDb.query(
      "SELECT id, project_name as title, 'project' as type, '/admin/projects' as link FROM user_projects WHERE project_name LIKE ? LIMIT 5",
      [term],
    );
    const [users] = await mainDb.query(
      "SELECT id, display_name as title, 'user' as type, CONCAT('/admin/users/detail/', id, '/client') as link FROM users WHERE display_name LIKE ? LIMIT 5",
      [term],
    );
    res.json({ success: true, results: [...projects, ...users] });
  } catch (err) {
    res.json({ success: true, results: [] });
  }
});

// ======================== INVOICING SYSTEM ========================

// CREATE INVOICE
app.post('/api/invoices', async (req, res) => {
  const {
    project_id,
    title,
    invoice_type,
    tax_type,
    tax_rate,
    issue_date,
    due_date,
    client_name,
    client_email,
    client_phone,
    notes,
    subtotal,
    items,
    currency,
    created_by,
  } = req.body;
  try {
    const validTypes = ['project_fee', 'milestone', 'expense', 'retainer', 'custom'];
    const type = validTypes.includes(invoice_type) ? invoice_type : 'project_fee';
    const taxRate = Math.min(Math.max(parseFloat(tax_rate) || 0, 0), 9.9999);
    const today = new Date();
    const due =
      due_date || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase();
    // Get a valid user id for created_by (check users table first for FK constraints)
    let userId = created_by || null;
    if (!userId) {
      const [users] = await mainDb.query('SELECT id FROM users LIMIT 1');
      if (users.length > 0) {
        userId = users[0].id;
      } else {
        const [admins] = await mainDb.query('SELECT id FROM admin_users LIMIT 1');
        userId = admins.length > 0 ? admins[0].id : 1;
      }
    }
    const [result] = await mainDb.query(
      `INSERT INTO invoices (project_id, invoice_type, invoice_number, title, subtotal, tax_rate, currency, status, issue_date, due_date, client_name, client_email, client_phone, notes, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        project_id || null,
        type,
        invoiceNumber,
        title || 'Invoice',
        subtotal || 0,
        taxRate,
        currency || 'KES',
        issue_date || today.toISOString().split('T')[0],
        due,
        client_name || 'Client',
        client_email || '',
        client_phone || '',
        notes || '',
        userId,
      ],
    );
    res.json({ success: true, id: result.insertId, invoice_number: invoiceNumber });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE INVOICE
app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await mainDb.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SEND INVOICE
app.post('/api/invoices/:id/send', async (req, res) => {
  try {
    await mainDb.query(
      "UPDATE invoices SET status = 'sent', email_sent = 1, email_sent_at = NOW() WHERE id = ?",
      [req.params.id],
    );
    res.json({ success: true, message: 'Invoice sent to client.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================== ACCOUNTING SYSTEM ========================

// CREATE ACCOUNTING ENTRY
app.post('/api/accounting/entries', async (req, res) => {
  const {
    entry_type,
    amount,
    description,
    category,
    project_id,
    reference,
    transaction_date,
    created_by,
  } = req.body;
  try {
    // Get a valid user id for created_by (check users table first for FK constraints)
    let userId = created_by || null;
    if (!userId) {
      const [users] = await mainDb.query('SELECT id FROM users LIMIT 1');
      if (users.length > 0) {
        userId = users[0].id;
      } else {
        const [admins] = await mainDb.query('SELECT id FROM admin_users LIMIT 1');
        userId = admins.length > 0 ? admins[0].id : null;
      }
    }
    if (!userId) {
      return res.status(500).json({ success: false, error: 'No valid user found' });
    }
    // Get a valid project_id if not provided (must reference user_projects table)
    let pid = project_id || null;
    if (!pid) {
      const [projects] = await mainDb.query('SELECT id FROM user_projects LIMIT 1');
      if (projects.length > 0) {
        pid = projects[0].id;
      } else {
        // Create a default user project if none exists
        const [result] = await mainDb.query(
          "INSERT INTO user_projects (user_id, project_name, status, created_at) VALUES (?, 'General', 'in_progress', NOW())",
          [userId],
        );
        pid = result.insertId;
      }
    }
    const today = new Date().toISOString().split('T')[0];
    const desc = description ? String(description) : 'No description provided';
    const [result] = await mainDb.query(
      `INSERT INTO accounting_entries (entry_type, amount, description, category, project_id, transaction_reference, transaction_date, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        entry_type || 'expense',
        amount || 0,
        desc,
        category || 'General',
        pid,
        reference || '',
        transaction_date || today,
        userId,
      ],
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE ACCOUNTING ENTRY
app.delete('/api/accounting/entries/:id', async (req, res) => {
  try {
    await mainDb.query('DELETE FROM accounting_entries WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ACCOUNTING OVERVIEW
app.get('/api/accounting/overview', async (req, res) => {
  try {
    const [incomeRows] = await mainDb.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM accounting_entries WHERE entry_type = 'income'",
    );
    const [expenseRows] = await mainDb.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM accounting_entries WHERE entry_type = 'expense'",
    );
    const income = parseFloat(incomeRows[0].total) || 0;
    const expenses = parseFloat(expenseRows[0].total) || 0;
    res.json({ success: true, income, expenses, net_income: income - expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================== MESSAGING SYSTEM ========================

// GET CONTACT FORMS (Messages)
app.get('/api/contact-forms', async (req, res) => {
  try {
    const [messages] = await mainDb.query(
      'SELECT * FROM contact_forms ORDER BY created_at DESC LIMIT 50',
    );
    res.json({ success: true, contacts: messages });
  } catch (err) {
    res.json({ success: true, contacts: [] });
  }
});

// M-PESA TRANSACTIONS
app.get('/api/mpesa/transactions', async (req, res) => {
  try {
    const [transactions] = await mainDb.query(
      'SELECT * FROM mpesa_transactions ORDER BY created_at DESC LIMIT 50',
    );
    res.json({ success: true, transactions });
  } catch (err) {
    res.json({ success: true, transactions: [] });
  }
});

// INITIATE M-PESA PAYMENT
app.post('/api/mpesa/stkpush', async (req, res) => {
  const { phone, amount, invoice_id, account_reference } = req.body;
  const transaction_id = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5);
  try {
    const [result] = await mainDb.query(
      `INSERT INTO mpesa_transactions (phone_number, amount, invoice_id, transaction_id, account_reference, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [phone || '', amount || 0, invoice_id || null, transaction_id, account_reference || ''],
    );
    res.json({
      success: true,
      id: result.insertId,
      message: 'STK push initiated. Enter PIN on your phone.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================== M-PESA SEND MONEY RECORDING ========================

// RECORD M-PESA SEND MONEY PAYMENT (Manual recording of received payments)
app.post('/api/mpesa/send-money/record', async (req, res) => {
  const {
    mpesa_receipt,
    transaction_id,
    phone_number,
    amount,
    client_id,
    client_name,
    client_email,
    project_id,
    invoice_id,
    company_id,
    account_reference,
    notes,
    created_by,
  } = req.body;

  try {
    // Validate required fields
    if (!mpesa_receipt || !phone_number || !amount) {
      return res
        .status(400)
        .json({ success: false, error: 'M-Pesa receipt, phone number, and amount are required' });
    }

    // Get valid user id
    let userId = created_by || 1;

    // Insert M-Pesa transaction record
    const [mpesaResult] = await mainDb.query(
      `INSERT INTO mpesa_transactions (
        mpesa_receipt, transaction_id, phone_number, amount, amount_kes, currency,
        client_id, client_name, client_email, project_id, invoice_id, company_id,
        account_reference, status, reconciled, created_by, transaction_date, completion_time, created_at
      ) VALUES (?, ?, ?, ?, ?, 'KES', ?, ?, ?, ?, ?, ?, ?, 'completed', 1, ?, NOW(), NOW(), NOW())`,
      [
        mpesa_receipt,
        transaction_id || 'TXN' + Date.now(),
        phone_number,
        amount,
        amount,
        client_id || null,
        client_name || '',
        client_email || '',
        project_id || null,
        invoice_id || null,
        company_id || null,
        account_reference || '',
        userId,
      ],
    );

    const mpesaTransactionId = mpesaResult.insertId;

    // If invoice_id provided, update invoice status
    if (invoice_id) {
      await mainDb.query(
        "UPDATE invoices SET status = 'paid', payment_status = 'paid', paid_date = NOW(), payment_method = 'mpesa', payment_phone = ?, payment_reference = ? WHERE id = ?",
        [phone_number, mpesa_receipt, invoice_id],
      );
    }

    res.json({
      success: true,
      id: mpesaTransactionId,
      message: `M-Pesa payment of KES ${parseFloat(amount).toLocaleString()} recorded successfully. Receipt: ${mpesa_receipt}`,
      mpesa_receipt,
      amount: parseFloat(amount),
      phone_number,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET M-PESA SEND MONEY PAYMENTS (with full details)
app.get('/api/mpesa/send-money', async (req, res) => {
  try {
    const { client_id, project_id, invoice_id, company_id, status } = req.query;
    let query = `
      SELECT mt.*, 
        i.invoice_number, i.title as invoice_title,
        up.project_name,
        c.name as company_name,
        u.display_name as client_display_name
      FROM mpesa_transactions mt
      LEFT JOIN invoices i ON mt.invoice_id = i.id
      LEFT JOIN user_projects up ON mt.project_id = up.id
      LEFT JOIN companies c ON mt.company_id = c.id
      LEFT JOIN users u ON mt.client_id = u.id
      WHERE mt.deleted_at IS NULL
    `;
    const params = [];

    if (client_id) {
      query += ' AND mt.client_id = ?';
      params.push(client_id);
    }
    if (project_id) {
      query += ' AND mt.project_id = ?';
      params.push(project_id);
    }
    if (invoice_id) {
      query += ' AND mt.invoice_id = ?';
      params.push(invoice_id);
    }
    if (company_id) {
      query += ' AND mt.company_id = ?';
      params.push(company_id);
    }
    if (status) {
      query += ' AND mt.status = ?';
      params.push(status);
    }

    query += ' ORDER BY mt.created_at DESC LIMIT 100';

    const [payments] = await mainDb.query(query, params);
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================== COMPANIES ========================

// GET EMPLOYEE ROLES (Public - for login role selection)
app.get('/api/roles', async (req, res) => {
  try {
    const [roles] = await mainDb.query(
      'SELECT id, name, slug, description, access_level FROM employee_roles WHERE is_active = TRUE ORDER BY name',
    );
    res.json({ success: true, roles });
  } catch (err) {
    console.error('[API] Error fetching roles:', err.message);
    res.json({ success: true, roles: [] });
  }
});

// GET EMPLOYEES (All registered staff - mainframe nodes)
app.get('/api/employees', async (req, res) => {
  try {
    const [employees] = await mainDb.query(`
      SELECT e.id, e.employee_code, e.email, e.first_name, e.last_name,
             e.display_name, e.is_active, e.last_login_at, e.primary_role,
             d.name as department, d.slug as department_slug,
             r.name as role_name, r.slug as role_slug, r.access_level
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_roles r ON e.role_id = r.id
      WHERE e.deleted_at IS NULL
      ORDER BY e.id
    `);
    res.json({ success: true, employees });
  } catch (err) {
    console.error('[API] Error fetching employees:', err.message);
    res.json({ success: true, employees: [] });
  }
});

// GET MAINFRAME NETWORK STATUS (Virtual network nodes overview)
app.get('/api/network', async (req, res) => {
  try {
    const [[empCount]] = await mainDb.query(
      'SELECT COUNT(*) as count FROM employees WHERE deleted_at IS NULL',
    );
    const [[roleCount]] = await mainDb.query(
      'SELECT COUNT(*) as count FROM employee_roles WHERE is_active = TRUE',
    );
    const [[deptCount]] = await mainDb.query(
      'SELECT COUNT(*) as count FROM departments WHERE is_active = TRUE',
    );
    const [[activeSessions]] = await mainDb.query(
      'SELECT COUNT(*) as count FROM employee_sessions WHERE is_active = TRUE',
    );
    const [[sessions24h]] = await mainDb.query(
      'SELECT COUNT(*) as count FROM employee_activity_log WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)',
    );

    res.json({
      success: true,
      network: {
        mainframe: this_pc_host(),
        total_employees: empCount.count,
        total_roles: roleCount.count,
        total_departments: deptCount.count,
        active_sessions: activeSessions.count,
        activity_24h: sessions24h.count,
        database_nodes: 2,
        status: 'operational',
      },
    });
  } catch (err) {
    console.error('[API] Error fetching network:', err.message);
    res.json({ success: false, network: null });
  }
});

// Helper - identify this PC as mainframe host
function this_pc_host() {
  return {
    hostname: 'GSS-MAINFRAME-01',
    platform: process.platform,
    pid: process.pid,
    host: 'virtual-mainframe',
    ip: '127.0.0.1',
  };
}

// GET DEPARTMENTS (Public - no auth required)
app.get('/api/departments', async (req, res) => {
  try {
    const [departments] = await mainDb.query(
      'SELECT id, name, slug, description, icon, color FROM departments WHERE is_active = TRUE ORDER BY name',
    );
    res.json({ success: true, departments });
  } catch (err) {
    console.error('[API] Error fetching departments:', err.message);
    res.json({ success: true, departments: [] });
  }
});

// GET SINGLE DEPARTMENT BY SLUG
app.get('/api/departments/:slug', async (req, res) => {
  try {
    const [departments] = await mainDb.query(
      'SELECT id, name, slug, description, icon, color FROM departments WHERE slug = ? AND is_active = TRUE',
      [req.params.slug],
    );
    if (departments.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json({ success: true, department: departments[0] });
  } catch (err) {
    console.error('[API] Error fetching department:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch department' });
  }
});

// GET COMPANIES
app.get('/api/companies', async (req, res) => {
  try {
    const [companies] = await mainDb.query(
      'SELECT id, name, slug, contact_email, contact_phone FROM companies WHERE deleted_at IS NULL ORDER BY name LIMIT 50',
    );
    res.json({ success: true, companies });
  } catch (err) {
    res.json({ success: true, companies: [] });
  }
});

// ======================== PDF GENERATION ========================

// GENERATE COMPLETION PDF
app.get('/api/pdf/completion/:recordType/:id', async (req, res) => {
  try {
    const { recordType, id } = req.params;
    let data = null;
    if (recordType === 'invoice')
      [data] = await mainDb.query('SELECT * FROM invoices WHERE id = ?', [id]);
    else if (recordType === 'project')
      [data] = await mainDb.query('SELECT * FROM projects WHERE id = ?', [id]);
    else if (recordType === 'quote')
      [data] = await mainDb.query('SELECT * FROM quotes WHERE id = ?', [id]);
    if (!data || data.length === 0)
      return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({
      success: true,
      data: data[0],
      message: 'PDF generation endpoint (PDF library integration required)',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Strategic Relay
app.listen(PORT, '0.0.0.0', () =>
  console.log(`[GSS MASTER RELAY] Node Online on Port ${PORT} | Primary Identity: admin_users`),
);
