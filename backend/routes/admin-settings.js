const express = require('express');
const router = express.Router();
const db = require('../config/database');

// =============================================
// ADMIN SETTINGS
// =============================================

router.get('/settings', async (req, res) => {
  try {
    const [settings] = await db
      .promise()
      .query('SELECT * FROM admin_settings ORDER BY setting_group, setting_key');
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.setting_key] = s.setting_value;
    });
    res.json({ success: true, settings: settingsMap, raw: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings data' });
    }
    const keys = Object.keys(updates);
    for (const key of keys) {
      await db
        .promise()
        .query(
          'INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          [key, updates[key], updates[key]],
        );
    }
    res.json({ success: true, message: 'Settings updated', updated: keys });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// =============================================
// NODE SETTINGS (for Settings.jsx)
// =============================================

router.get('/node-settings', async (req, res) => {
  try {
    const [settings] = await db.promise().query('SELECT * FROM admin_settings');
    const m = {};
    settings.forEach((s) => {
      m[s.setting_key] = s.setting_value;
    });
    res.json({ success: true, settings: m, system: { status: 'operational', uptime: '99.9%' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

module.exports = router;
