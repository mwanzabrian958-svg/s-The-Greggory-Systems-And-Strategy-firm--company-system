const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { createNotification } = require('../utils/notificationHelper');
const { validate, contactFormSchema } = require('../validators');
const { success, error } = require('../utils/responseHelper');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT *
      FROM contact_forms
      ORDER BY created_at DESC
    `);

    return success(res, { data: rows });
  } catch (error) {
    console.error('Error fetching contact forms:', error);
    return error(res, 'Failed to fetch contact forms');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.promise().query('SELECT * FROM contact_forms WHERE id = ?', [id]);

    if (rows.length === 0) {
      return error(res, 'Contact form not found', 404);
    }

    return success(res, { data: rows[0] });
  } catch (error) {
    console.error('Error fetching contact form:', error);
    return error(res, 'Failed to fetch contact form');
  }
});

router.post('/', validate(contactFormSchema), async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    const [result] = await db.promise().query(
      `INSERT INTO contact_forms (name, email, phone, company, subject, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, company || null, subject || null, message],
    );

    // REAL-LIFE NOTIF: Notify admins of a new contact inquiry
    // For now, we'll notify user with ID 1 (assumed main admin)
    await createNotification(
      1,
      'system',
      'New Inquiry Received',
      `New message from ${name} (${company || 'Individual'}).`,
      'high',
    );

    return success(
      res,
      { message: 'Contact form submitted successfully', id: result.insertId },
      201,
    );
  } catch (error) {
    console.error('Error creating contact form:', error);
    return error(res, 'Failed to submit contact form');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.promise().query('DELETE FROM contact_forms WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return error(res, 'Contact form not found', 404);
    }

    return success(res, { message: 'Contact form deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact form:', error);
    return error(res, 'Failed to delete contact form');
  }
});

module.exports = router;
