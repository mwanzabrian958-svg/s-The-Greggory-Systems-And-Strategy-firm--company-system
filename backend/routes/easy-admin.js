/**
 * EASY ADMIN ROUTES
 * =============================================================================
 * Simplified admin API endpoints for budget overview, search, team management,
 * CRM telemetry, ledger, and M-Pesa transactions.
 *
 * This module re-exports the admin-complete router to provide a clean
 * /api/easy-admin namespace for the simplified admin interface.
 *
 * Usage in backend/server.js:
 *   const easyAdminRoutes = require('./routes/easy-admin');
 *   app.use('/api/easy-admin', easyAdminRoutes);
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const adminCompleteRouter = require('./admin-complete');

// Mount admin-complete routes
router.use('/', adminCompleteRouter);

// GET ALL DEPARTMENTS (Public - no auth required)
router.get('/departments', async (req, res) => {
  try {
    const [departments] = await db
      .promise()
      .query(
        'SELECT id, name, slug, description, icon, color FROM departments WHERE is_active = TRUE ORDER BY name',
      );
    res.json({ success: true, departments });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.json({ success: true, departments: [] });
  }
});

// GET SINGLE DEPARTMENT BY SLUG
router.get('/departments/:slug', async (req, res) => {
  try {
    const [departments] = await db
      .promise()
      .query(
        'SELECT id, name, slug, description, icon, color FROM departments WHERE slug = ? AND is_active = TRUE',
        [req.params.slug],
      );
    if (departments.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json({ success: true, department: departments[0] });
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch department' });
  }
});

module.exports = router;
