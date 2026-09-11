const express = require('express');
const router = express.Router();
const db = require('../config/database');

// CRM Contacts — CRUD for crm_contacts table
// Mounted at /api/admin/crm

router.get('/contacts', async (req, res) => {
  try {
    const [contacts] = await db
      .promise()
      .query('SELECT * FROM crm_contacts WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Error fetching CRM contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch CRM contacts' });
  }
});

router.post('/contacts', async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const [result] = await db
      .promise()
      .query(
        'INSERT INTO crm_contacts (name, email, phone, company, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email || null, phone || null, company || null, status || 'lead', notes || null],
      );
    res.status(201).json({ success: true, message: 'Contact created', id: result.insertId });
  } catch (error) {
    console.error('Error creating CRM contact:', error);
    res.status(500).json({ success: false, message: 'Failed to create contact' });
  }
});

router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status, notes } = req.body;
    const [result] = await db
      .promise()
      .query(
        'UPDATE crm_contacts SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), company = COALESCE(?, company), status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ? AND deleted_at IS NULL',
        [name, email, phone, company, status, notes, id],
      );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact updated' });
  } catch (error) {
    console.error('Error updating CRM contact:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db
      .promise()
      .query('UPDATE crm_contacts SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL', [
        id,
      ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('Error deleting CRM contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
});

module.exports = router;
