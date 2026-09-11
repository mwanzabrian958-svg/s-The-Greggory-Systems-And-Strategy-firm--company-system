// Admin User Management Routes
// Handles admin & regular user CRUD extracted from admin.js (Sprint 7 split).
// Mounted at /api/admin so ALL public URLs remain identical.

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { verifySessionToken } = require('../utils/sessionToken');

/**
 * Authenticate an admin session (same scheme as admin.js). Verifies the signed
 * session token issued by the login endpoints (see backend/utils/sessionToken.js).
 */
function requireAdminSession(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const payload = verifySessionToken(m[1].trim());
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
  }
  req.adminId = payload.uid;
  next();
}

// =============================================
// PROFILE LOOKUP (for Login Identity Scan)
// =============================================
router.get('/profile-lookup', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false });

    // Check admin_users table for this email and return photo if exists
    const [users] = await db.promise().query(
      `
      SELECT i.data as profile_photo_blob, i.content_type as profile_photo_type
      FROM admin_users au
      LEFT JOIN images i ON au.profile_image_id = i.id
      WHERE au.email = ? AND au.deleted_at IS NULL
      LIMIT 1
    `,
      [email],
    );

    if (users.length > 0 && users[0].profile_photo_blob) {
      const base64 = Buffer.from(users[0].profile_photo_blob).toString('base64');
      const mimeType = users[0].profile_photo_type || 'image/jpeg';
      return res.json({
        success: true,
        photoData: `data:${mimeType};base64,${base64}`,
      });
    }

    res.json({ success: false });
  } catch (error) {
    console.error('Lookup Error:', error);
    res.json({ success: false });
  }
});

// =============================================
// GET LIVE USERS (Who's Online)
// =============================================
router.get('/live-users', requireAdminSession, async (req, res) => {
  try {
    // Define "Live" as activity within the last 5 minutes
    const LIVE_THRESHOLD = '5 MINUTE';

    const [liveUsers] = await db.promise().query(`
      (SELECT id, display_name, email, 'client' as role_type, last_active_at, profile_photo_blob IS NOT NULL as has_photo
       FROM users
       WHERE last_active_at > DATE_SUB(NOW(), INTERVAL ${LIVE_THRESHOLD}) AND deleted_at IS NULL)
      UNION ALL
      (SELECT id, display_name, email, admin_level as role_type, last_active_at, profile_photo_blob IS NOT NULL as has_photo
       FROM admin_users
       WHERE last_active_at > DATE_SUB(NOW(), INTERVAL ${LIVE_THRESHOLD}) AND deleted_at IS NULL)
      UNION ALL
      (SELECT id, display_name, email, developer_level as role_type, last_active_at, profile_photo_blob IS NOT NULL as has_photo
       FROM developer_users
       WHERE last_active_at > DATE_SUB(NOW(), INTERVAL ${LIVE_THRESHOLD}) AND deleted_at IS NULL)
      ORDER BY last_active_at DESC
    `);

    res.json({
      success: true,
      count: liveUsers.length,
      users: liveUsers.map((u) => ({
        ...u,
        online: true,
        last_active: u.last_active_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching live users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// GLOBAL SEARCH TELEMETRY
// =============================================
router.get('/search', async (req, res) => {
  try {
    const { q, deep } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, results: [] });

    const searchTerm = `%${q}%`;
    const isDeep = deep === 'true';
    const limit = isDeep ? 20 : 5;

    // 1. Search Personnel (Users, Admins) - PURGED DEVELOPERS
    const personnelQuery = isDeep
      ? `(SELECT 'user' as type, id, COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title, email, phone_number as phone, primary_role as role, is_active, created_at as metadata, CONCAT('/admin/users/detail/', id, '/client') as link FROM users WHERE (display_name LIKE ? OR email LIKE ? OR phone_number LIKE ?) AND deleted_at IS NULL)
         UNION ALL
         (SELECT 'user' as type, id, COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title, email, phone_number as phone, admin_level as role, is_active, created_at as metadata, CONCAT('/admin/users/detail/', id, '/admin') as link FROM admin_users WHERE (display_name LIKE ? OR email LIKE ? OR phone_number LIKE ?) AND deleted_at IS NULL)
         LIMIT ?`
      : `(SELECT 'user' as type, id, COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title, email as subtitle, CONCAT('/admin/users/detail/', id, '/client') as link FROM users WHERE (display_name LIKE ? OR email LIKE ?) AND deleted_at IS NULL)
         UNION ALL
         (SELECT 'user' as type, id, COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title, email as subtitle, CONCAT('/admin/users/detail/', id, '/admin') as link FROM admin_users WHERE (display_name LIKE ? OR email LIKE ?) AND deleted_at IS NULL)
         LIMIT ?`;

    const personnelParams = isDeep
      ? [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit]
      : [searchTerm, searchTerm, searchTerm, searchTerm, limit];

    const [users] = await db.promise().query(personnelQuery, personnelParams);

    // 2. Search Projects
    const projectQuery = isDeep
      ? "SELECT 'project' as type, id, project_name as title, client_name as subtitle, project_description as description, status, progress_percentage as metadata, '/admin/projects' as link FROM user_projects WHERE (project_name LIKE ? OR client_name LIKE ?) AND deleted_at IS NULL LIMIT ?"
      : "SELECT 'project' as type, id, project_name as title, client_name as subtitle, '/admin/projects' as link FROM user_projects WHERE (project_name LIKE ? OR client_name LIKE ?) AND deleted_at IS NULL LIMIT ?";

    const [projects] = await db.promise().query(projectQuery, [searchTerm, searchTerm, limit]);

    // 3. Search Ledger
    const [ledger] = await db
      .promise()
      .query(
        "SELECT 'ledger' as type, id, description as title, CONCAT('KSH ', FORMAT(amount, 2)) as subtitle, '/admin/billing' as link FROM accounting_entries WHERE (description LIKE ? OR transaction_reference LIKE ?) AND deleted_at IS NULL LIMIT ?",
        [searchTerm, searchTerm, limit],
      );

    // 4. Search Tasks
    const [tasks] = await db
      .promise()
      .query(
        "SELECT 'task' as type, id, task_name as title, task_description as description, status, priority as metadata, CONCAT('/admin/projects/', project_id, '/tasks') as link FROM project_tasks WHERE (task_name LIKE ? OR task_description LIKE ?) AND deleted_at IS NULL LIMIT ?",
        [searchTerm, searchTerm, limit],
      );

    res.json({
      success: true,
      results: [...users, ...projects, ...ledger, ...tasks],
    });
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// GET ALL ADMIN USERS
// =============================================
router.get('/admin-users', requireAdminSession, async (req, res) => {
  try {
    const [adminUsers] = await db.promise().query(`
      SELECT 
        au.id,
        au.email,
        au.first_name,
        au.last_name,
        au.display_name,
        au.phone_number,
        au.physical_address,
        au.id_number,
        au.alt_phone,
        au.expertise,
        au.private_notes,
        au.manual_projects,
        au.emergency_contact_name,
        au.emergency_contact_phone,
        au.admin_level,
        au.access_level,
        au.department,
        au.is_active,
        au.last_login_at,
        au.last_login_ip,
        au.last_active_at,
        au.whatsapp_verified,
        au.whatsapp_auth_key,
        au.created_at,
        au.updated_at
      FROM admin_users au
      WHERE au.deleted_at IS NULL
      ORDER BY au.created_at DESC
    `);

    res.json({
      success: true,
      users: adminUsers,
      count: adminUsers.length,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error: error.message,
    });
  }
});

// =============================================
// GET ALL REGULAR USERS
// =============================================
router.get('/users', requireAdminSession, async (req, res) => {
  try {
    const [regularUsers] = await db.promise().query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.display_name,
        u.phone_number,
        u.physical_address,
        u.id_number,
        u.alt_phone,
        u.expertise,
        u.private_notes,
        u.manual_projects,
        u.emergency_contact_name,
        u.emergency_contact_phone,
        u.primary_role,
        u.is_active,
        u.last_login_at,
        u.last_login_ip,
        u.last_active_at,
        u.whatsapp_verified,
        u.whatsapp_auth_key,
        u.created_at,
        u.updated_at,
        tm.name as job_title,
        tm.role as job_role
      FROM users u
      LEFT JOIN team_members tm ON u.job_id = tm.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      users: regularUsers,
      count: regularUsers.length,
    });
  } catch (error) {
    console.error('Error fetching regular users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regular users',
      error: error.message,
    });
  }
});

// =============================================
// CREATE ADMIN USER
// =============================================
router.post('/create-admin', requireAdminSession, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      admin_level = 'admin',
      access_level = 'full',
      department = 'General',
      admin_code,
    } = req.body;

    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate admin code if provided (must match ADMIN_CODE configured in .env).
    // Fail-closed: if ADMIN_CODE is not configured, no code can pass.
    if (admin_code) {
      const expected = process.env.ADMIN_CODE;
      if (!expected || admin_code !== expected) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin code for admin account creation',
        });
      }
    }

    // Check if user already exists in admin table
    const [existingAdmin] = await db
      .promise()
      .query('SELECT id FROM admin_users WHERE email = ?', [email]);

    if (existingAdmin.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin user with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [result] = await db.promise().query(
      `
      INSERT INTO admin_users (
        email, password_hash, first_name, last_name, admin_level, 
        access_level, department, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [email, hashedPassword, first_name, last_name, admin_level, access_level, department, 1],
    );

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      userId: result.insertId,
      admin_level: admin_level,
      access_level: access_level,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message,
    });
  }
});

// =============================================
// EXPORT USER PROFILE AS PDF
// =============================================
router.get('/users/:id/export-pdf', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.query;

    let query;
    if (role_type === 'admin') {
      query = 'SELECT * FROM admin_users WHERE id = ? AND deleted_at IS NULL';
    } else if (role_type === 'developer') {
      query = 'SELECT * FROM developer_users WHERE id = ? AND deleted_at IS NULL';
    } else {
      query = 'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL';
    }

    const [users] = await db.promise().query(query, [id]);
    if (users.length === 0) return res.status(404).send('User not found');

    const user = users[0];
    const name = user.display_name || `${user.first_name} ${user.last_name}`;

    // Simple Text-based PDF Relay (In production, use a library like PDFKit)
    const profileText = `
==================================================
GREGGORY SYSTEMS & STRATEGY FIRM
OFFICIAL PERSONNEL IDENTITY REPORT
==================================================
Generated: ${new Date().toLocaleString()}
Node ID: ${user.id}
Status: ${user.is_active ? 'ACTIVE' : 'INACTIVE'}
Role: ${user.admin_level || user.primary_role || 'Personnel'}

[ IDENTITY PHOTO ATTACHED IN DIGITAL PORTAL ]
--------------------------------------------------

PRIMARY IDENTIFICATION:
Full Name: ${name}
Primary Email: ${user.email}
Secure Line: ${user.phone_number || 'NOT RECORDED'}
Backup Phone: ${user.alt_phone || 'NOT RECORDED'}
ID/Passport: ${user.id_number || 'NOT RECORDED'}

PROFESSIONAL MATRIX:
Department: ${user.department || 'Operations'}
Expertise: ${user.expertise || 'General'}
Joined: ${new Date(user.created_at).toLocaleDateString()}

PHYSICAL ADDRESS:
${user.physical_address || 'NOT RECORDED'}

EMERGENCY CONTACT:
Name: ${user.emergency_contact_name || 'NOT RECORDED'}
Phone: ${user.emergency_contact_phone || 'NOT RECORDED'}

MISSION BRIEFING & DIRECTIVES:
${user.mission_briefing || 'No specific directive assigned.'}

INTERNAL COMPANY NOTES (RESTRICTED ACCESS):
${user.private_notes || 'None recorded.'}

--------------------------------------------------
END OF IDENTITY REPORT
© 2024 Greggory Systems & Strategy Firm
CONFIDENTIAL - INTERNAL USE ONLY
==================================================
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="PROFILE_${name.replace(/\s+/g, '_')}.pdf"`,
    );

    // For now, sending as a plain text buffer that opens in PDF viewers
    // In a real environment, we'd pipe through a PDF generator
    res.send(Buffer.from(profileText, 'utf-8'));
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).send('Export synchronization failed');
  }
});

// =============================================
// UPDATE USER DETAILS
// =============================================
router.put('/users/:id', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      role,
      admin_level,
      department,
      mission_briefing,
      is_active,
      phone_number,
      physical_address,
      id_number,
      alt_phone,
      expertise,
      private_notes,
      manual_projects,
      emergency_contact_name,
      emergency_contact_phone,
    } = req.body;

    const roleType =
      req.query.role_type ||
      (role === 'admin' ? 'admin' : role === 'developer' ? 'developer' : 'client');

    let tableName;
    let updates = [];
    let params = [];

    // Every identity table (users / admin_users / developer_users) carries the same
    // contact/notes columns PLUS department and mission_briefing — so all of them
    // live in the shared update list and actually persist (previously admin edits
    // silently dropped mission_briefing,and client edits dropped department).
    const commonUpdates = [
      'first_name = ?',
      'last_name = ?',
      'email = ?',
      'phone_number = ?',
      'physical_address = ?',
      'id_number = ?',
      'alt_phone = ?',
      'expertise = ?',
      'private_notes = ?',
      'manual_projects = ?',
      'emergency_contact_name = ?',
      'emergency_contact_phone = ?',
      'is_active = ?',
      'department = ?',
      'mission_briefing = ?',
    ];

    const commonParams = [
      first_name,
      last_name,
      email,
      phone_number || null,
      physical_address || null,
      id_number || null,
      alt_phone || null,
      expertise || null,
      private_notes || null,
      manual_projects || null,
      emergency_contact_name || null,
      emergency_contact_phone || null,
      is_active ? 1 : 0,
      department || null,
      mission_briefing || null,
    ];

    const tableMap = {
      admin: 'admin_users',
      admin_users: 'admin_users',
      'admin-user': 'admin_users',
      developer: 'developer_users',
      developer_users: 'developer_users',
      'developer-user': 'developer_users',
      client: 'users',
      user: 'users',
      users: 'users',
    };
    tableName = tableMap[String(roleType.toLowerCase())] || 'users';

    if (tableName === 'admin_users') {
      updates = [...commonUpdates, 'admin_level = ?'];
      params = [...commonParams, admin_level || role || 'admin'];
    } else if (tableName === 'developer_users') {
      updates = [...commonUpdates, 'developer_level = ?'];
      params = [...commonParams, (role === 'developer' ? 'mid' : null) || 'mid'];
    } else {
      updates = [...commonUpdates, 'primary_role = ?'];
      params = [...commonParams, role || 'user'];
    }

    params.push(id);
    const [result] = await db
      .promise()
      .query(
        `UPDATE ${tableName} SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
        params,
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User details synchronized successfully',
      table: tableName,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal update failure', error: error.message });
  }
});

// =============================================
// UPDATE USER STATUS
// =============================================
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role_type } = req.body;

    if (!status || !role_type) {
      return res.status(400).json({
        success: false,
        message: 'Status and role_type are required',
      });
    }

    let tableName;
    if (role_type === 'admin') {
      tableName = 'admin_users';
    } else if (role_type === 'developer' || role_type === 'developer_users') {
      tableName = 'developer_users';
    } else {
      tableName = 'users';
    }

    const [result] = await db
      .promise()
      .query(`UPDATE ${tableName} SET is_active = ?, updated_at = NOW() WHERE id = ?`, [
        status === 'active' ? 1 : 0,
        id,
      ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      userId: id,
      role_type: role_type,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
});

// =============================================
// DELETE USER
// =============================================
router.delete('/users/:id', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.query;

    if (!role_type) {
      return res.status(400).json({
        success: false,
        message: 'Role type parameter is required',
      });
    }

    // Map the role_type (as reported by the user-management UI: source_table)
    // to the correct identity table so the deletion lands in the right table.
    // Developer accounts are purged from this project — only `users` and
    // `admin_users` are active identity tables.
    const tableMap = {
      admin: 'admin_users',
      admin_users: 'admin_users',
      'admin-user': 'admin_users',
      client: 'users',
      user: 'users',
      users: 'users',
      developer: 'developer_users',
      developer_users: 'developer_users',
      'developer-user': 'developer_users',
    };
    const tableName = tableMap[String(role_type).toLowerCase()] || 'users';

    // Grab the target row first (for the audit trail + existence check), then
    // soft-delete it so the change is actually applied in the database.
    const [targets] = await db
      .promise()
      .query(
        `SELECT id, display_name, email FROM ${tableName} WHERE id = ? AND deleted_at IS NULL`,
        [id],
      );

    if (targets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found in the requested identity table',
      });
    }
    const target = targets[0];

    // Soft delete by setting deleted_at, disabling the account, and recording
    // who performed the termination.
    const [result] = await db
      .promise()
      .query(
        `UPDATE ${tableName} SET deleted_at = NOW(), is_active = 0, deleted_by = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
        [req.adminId || null, id],
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Best-effort audit trail (admin id must exist in `users` for the FK —
    // failures are swallowed so deletion is never blocked by logging).
    try {
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, affected_record_id, old_values, ip_address, created_at)
         VALUES (?, 'USER_DELETED', ?, ?, ?, ?, ?, NOW())`,
        [
          req.adminId || 0,
          `Soft-deleted ${tableName.slice(0, -6)} account "${target.display_name || target.email || target.id}" (id: ${id})`,
          tableName,
          id,
          JSON.stringify({ deleted_at: new Date().toISOString(), is_active: 0 }),
        ],
      );
    } catch (logError) {
      console.warn('[ADMIN] Could not write USER_DELETED activity log:', logError.message);
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      userId: id,
      role_type: role_type,
      table: tableName,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
});

// =============================================
// GET USER BY ID
// =============================================
router.get('/users/:id', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.query;

    if (!role_type) {
      return res.status(400).json({
        success: false,
        message: 'Role type parameter is required',
      });
    }

    const tableMap = {
      admin: 'admin_users',
      admin_users: 'admin_users',
      'admin-user': 'admin_users',
      client: 'users',
      user: 'users',
      users: 'users',
    };
    const tableName = tableMap[String(role_type).toLowerCase()] || 'users';

    let query;
    if (tableName === 'admin_users') {
      query = `
        SELECT 
          au.id, au.email, au.first_name, au.last_name, au.display_name,
          au.phone_number, au.physical_address, au.id_number, au.alt_phone,
          au.expertise, au.private_notes, au.manual_projects,
          au.emergency_contact_name, au.emergency_contact_phone,
          au.admin_level, au.access_level, au.department, au.mission_briefing,
          au.is_active, au.last_login_at, au.last_login_ip,
          au.created_at, au.updated_at, au.deleted_at
        FROM admin_users au
        WHERE au.id = ? AND au.deleted_at IS NULL
      `;
    } else if (tableName === 'developer_users') {
      query = `
        SELECT 
          du.id, du.email, du.first_name, du.last_name, du.display_name,
          du.phone_number, du.physical_address, du.id_number, du.alt_phone,
          du.expertise, du.private_notes, du.manual_projects,
          du.emergency_contact_name, du.emergency_contact_phone,
          du.developer_level, du.tech_stack, du.department, du.mission_briefing,
          du.is_active, du.last_login_at, du.last_login_ip,
          du.created_at, du.updated_at, du.deleted_at
        FROM developer_users du
        WHERE du.id = ? AND du.deleted_at IS NULL
      `;
    } else {
      query = `
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.display_name,
          u.phone_number, u.physical_address, u.id_number, u.alt_phone,
          u.expertise, u.private_notes, u.manual_projects,
          u.emergency_contact_name, u.emergency_contact_phone,
          u.primary_role, u.department, u.mission_briefing, u.is_active, u.last_login_at,
          u.last_login_ip, u.created_at, u.updated_at, u.deleted_at,
          tm.name as job_title, tm.role as job_role
        FROM users u
        LEFT JOIN team_members tm ON u.job_id = tm.id
        WHERE u.id = ? AND u.deleted_at IS NULL
      `;
    }

    const [users] = await db.promise().query(query, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: users[0],
      role_type: role_type,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
});

module.exports = router;
