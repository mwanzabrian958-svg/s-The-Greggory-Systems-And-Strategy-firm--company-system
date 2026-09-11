const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cache = require('../middleware/cache');
const { validate, contentSchema } = require('../validators');
const { success, error } = require('../utils/responseHelper');

// GET ALL CONTENT
/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Get all content items
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of content items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       author:
 *                         type: string
 *                       category:
 *                         type: string
 *                       tags:
 *                         type: string
 *                       featured_image_url:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
router.get('/', cache(60), async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT *
      FROM content
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);
    return success(res, { content: rows });
  } catch (error) {
    console.error('Error fetching content:', error);
    return error(res, 'Failed to fetch content');
  }
});

// GET SINGLE CONTENT
/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get a single content item by ID
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content item retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     body:
 *                       type: string
 *       404:
 *         description: Content not found
 */
router.get('/:id', cache(60), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db
      .promise()
      .query('SELECT * FROM content WHERE id = ? AND deleted_at IS NULL', [id]);

    if (rows.length === 0) {
      return error(res, 'Content not found', 404);
    }

    return success(res, { content: rows[0] });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content' });
  }
});

// CREATE CONTENT
/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create a new content item
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               body:
 *                 type: string
 *                 minLength: 1
 *               type:
 *                 type: string
 *                 enum: [page, post, article, faq]
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               featured_image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Content created successfully
 *       400:
 *         description: Validation failed
 */
router.post('/', validate(contentSchema), async (req, res) => {
  try {
    const { title, body, type, status, author, category, tags, featured_image_url } = req.body;

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
    return success(res, { message: 'Content created successfully', id: result.insertId }, 201);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ success: false, error: 'Failed to create content' });
  }
});

// UPDATE CONTENT
/**
 * @swagger
 * /api/content/{id}:
 *   put:
 *     summary: Update a content item
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               body:
 *                 type: string
 *                 minLength: 1
 *               type:
 *                 type: string
 *                 enum: [page, post, article, faq]
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               featured_image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Content not found
 */
router.put('/:id', validate(contentSchema), async (req, res) => {
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
      return error(res, 'Content not found', 404);
    }

    cache.invalidate('/api/content');
    return success(res, { message: 'Content updated successfully' });
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
    return success(res, { message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ success: false, error: 'Failed to delete content' });
  }
});

module.exports = router;
