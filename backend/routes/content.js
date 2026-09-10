const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cache = require('../middleware/cache');

// GET ALL CONTENT
router.get('/', cache(60), async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT *
      FROM content
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);
    res.json({ success: true, content: rows });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content' });
  }
});

// GET SINGLE CONTENT
router.get('/:id', cache(60), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db
      .promise()
      .query('SELECT * FROM content WHERE id = ? AND deleted_at IS NULL', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    res.json({ success: true, content: rows[0] });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content' });
  }
});

// CREATE CONTENT
router.post('/', async (req, res) => {
  try {
    const { title, body, type, status, author, category, tags, featured_image_url } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const [result] = await db.promise().query(
      `INSERT INTO content (title, body, type, status, author, category, tags, featured_image_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        body || null,
        type || 'article',
        status || 'draft',
        author || null,
        category || null,
        tags || null,
        featured_image_url || null,
      ],
    );

    cache.invalidate('/api/content');
    res
      .status(201)
      .json({ success: true, message: 'Content created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ success: false, error: 'Failed to create content' });
  }
});

// UPDATE CONTENT
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, type, status, author, category, tags, featured_image_url } = req.body;

    const [result] = await db.promise().query(
      `UPDATE content
       SET title = ?, body = ?, type = ?, status = ?, author = ?, category = ?, tags = ?, featured_image_url = ?, updated_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [
        title,
        body || null,
        type || 'article',
        status || 'draft',
        author || null,
        category || null,
        tags || null,
        featured_image_url || null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    cache.invalidate('/api/content');
    res.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, error: 'Failed to update content' });
  }
});

// DELETE CONTENT (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db
      .promise()
      .query('UPDATE content SET deleted_at = NOW() WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    cache.invalidate('/api/content');
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ success: false, error: 'Failed to delete content' });
  }
});

module.exports = router;
