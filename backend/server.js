const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Fail fast in production if auth secrets are missing — prevents any chance of
// falling back to publicly-known signing keys.
['JWT_SECRET', 'ADMIN_SESSION_SECRET'].forEach((key) => {
  if (!process.env[key] && process.env.NODE_ENV === 'production') {
    console.error(`[FATAL] ${key} must be set when NODE_ENV=production. Refusing to start.`);
    process.exit(1);
  }
});

const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow any localhost origin
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        return callback(null, true);
      }

      // Allow local network IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      if (origin.startsWith('http://192.168.') || origin.startsWith('https://192.168.')) {
        return callback(null, true);
      }
      if (origin.startsWith('http://10.') || origin.startsWith('https://10.')) {
        return callback(null, true);
      }
      if (
        origin.startsWith('http://172.1') ||
        origin.startsWith('https://172.1') ||
        origin.startsWith('http://172.2') ||
        origin.startsWith('https://172.2') ||
        origin.startsWith('http://172.3') ||
        origin.startsWith('https://172.3')
      ) {
        return callback(null, true);
      }

      // Allow specific origins
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:4173',
        'http://192.168.43.197:5173',
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Rate limiting — general API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Rate limiting — auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/users/login', authLimiter);
app.use('/api/admin-verification/authenticate-enhanced', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight OPTIONS requests
// app.options('*', cors()); // Removed - cors is already applied via app.use(cors())

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
// Routes
// GET /api/health — liveness probe. Performs a fast, guarded DB connectivity
// check (skipped under vitest so tests stay fast and hermetic).
app.get('/api/health', async (req, res) => {
  const payload = {
    status: 'OK',
    message: 'Server is running',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  if (!process.env.VITEST) {
    try {
      await Promise.race([
        db.promise().query('SELECT 1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), 2500)),
      ]);
      payload.database = 'connected';
    } catch (error) {
      payload.database = 'unreachable';
    }
  } else {
    payload.database = 'skipped (test mode)';
  }

  res.json(payload);
});

// Import routes
const userRoutes = require('./routes/users');
const managementRoutes = require('./routes/management');
const contentRoutes = require('./routes/content');
const imageRoutes = require('./routes/images');
const contactFormRoutes = require('./routes/contact-forms');
const blogArticleRoutes = require('./routes/blog-articles');
const userProjectRoutes = require('./routes/user-projects');
const adminRoutes = require('./routes/admin');
const adminVerificationRoutes = require('./routes/admin-verification');
const developerVerificationRoutes = require('./routes/developer-verification');
const easyAdminRoutes = require('./routes/easy-admin');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/contact-forms', contactFormRoutes);
app.use('/api/blog-articles', blogArticleRoutes);
app.use('/api/user-projects', userProjectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-verification', adminVerificationRoutes);
app.use('/api/developer-verification', developerVerificationRoutes);
app.use('/api/easy-admin', easyAdminRoutes);

// API Documentation
if (process.env.NODE_ENV !== 'production') {
  try {
    const setupSwagger = require('./docs/swagger');
    setupSwagger(app);
  } catch (error) {
    // Docs are optional — requires swagger-jsdoc + swagger-ui-express.
    // Never let a missing docs dependency take down the API or the tests.
    console.warn(
      '[API DOCS] Swagger not mounted (install swagger-jsdoc + swagger-ui-express to enable): ' +
        error.message,
    );
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error occurred',
    error: err.message || 'Something went wrong!',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Only listen when run directly (`node backend/server.js`).
// When required by tests (supertest), just export the app without binding a port.
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (accessible from all network interfaces)`);
  });
}

module.exports = app;
