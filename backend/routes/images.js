const express = require('express');
const router = express.Router();
const db = require('../config/database');
const requireAdmin = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');

// Helper: insert image from base64 string into images.data
const insertImageFromBase64 = (fileName, contentType, dataBase64, callback) => {
  if (!dataBase64) return callback(new Error('Missing image data'));

  let buffer;
  try {
    buffer = Buffer.from(dataBase64, 'base64');
  } catch (e) {
    return callback(new Error('Invalid base64 image data'));
  }

  const query = `
    INSERT INTO images (file_name, content_type, data, file_size, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [fileName || 'profile.jpg', contentType || 'image/jpeg', buffer, buffer.length],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.insertId);
    },
  );
};

// Upload profile image (used by signup / profile update)
// Expects JSON: { dataBase64, contentType, fileName }
router.post('/profile', (req, res) => {
  const { dataBase64, contentType, fileName } = req.body || {};

  if (!dataBase64) {
    return error(res, 'Missing image data', 400);
  }

  insertImageFromBase64(
    fileName || 'profile.jpg',
    contentType || 'image/jpeg',
    dataBase64,
    (err, imageId) => {
      if (err) {
        console.error('Error inserting profile image:', err);
        return error(res, 'Failed to save profile image', 500);
      }

      return success(res, { image_id: imageId }, 201);
    },
  );
});

// Delete image (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM images WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting image:', err);
      return error(res, 'Failed to delete image', 500);
    }

    if (result.affectedRows === 0) {
      return error(res, 'Image not found', 404);
    }

    return success(res, { message: 'Image deleted successfully' });
  });
});

// (Optional) Serve image as binary (e.g., for profile photos)
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT content_type, data FROM images WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching image:', err);
      return error(res, 'Failed to fetch image', 500);
    }

    if (!results || results.length === 0) {
      return error(res, 'Image not found', 404);
    }

    const image = results[0];
    res.setHeader('Content-Type', image.content_type || 'image/jpeg');
    res.send(image.data);
  });
});

module.exports = router;
