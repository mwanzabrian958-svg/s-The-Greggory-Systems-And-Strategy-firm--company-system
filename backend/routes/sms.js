const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { sendSMS, sendBulkSMS, COMPANY_PHONE_NUMBER } = require('../services/smsService');
const db = require('../config/database');
const { validate, smsBulkSchema } = require('../validators');
const { z } = require('zod');
const { success, error } = require('../utils/responseHelper');

const authenticateUser = (req, res, next) => {
  const authHeader = req.header('authorization') || req.header('Authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (!token) {
    return error(res, 'Authentication required', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.authUser = decoded;
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (_) {
    return error(res, 'Invalid or expired authentication token', 401);
  }
};

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1600, 'Message too long'),
});

// Health check
/**
 * @swagger
 * /api/sms/test:
 *   get:
 *     summary: Health check — verify SMS router is loaded
 *     tags: [SMS]
 *     responses:
 *       200:
 *         description: SMS router is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 company_phone:
 *                   type: string
 */
router.get('/test', (req, res) => {
  success(res, { message: 'SMS router is working', company_phone: COMPANY_PHONE_NUMBER });
});

// Send SMS FROM user TO company phone number
/**
 * @swagger
 * /api/sms/send:
 *   post:
 *     summary: Send an SMS from the authenticated user to the company phone
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1600
 *                 description: Message content (max 1600 characters)
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found or no phone number registered
 *       500:
 *         description: Failed to send message
 */
router.post('/send', authenticateUser, validate(messageSchema), async (req, res) => {
  try {
    const userId = req.userId;
    const { message } = req.body;

    const [users] = await db
      .promise()
      .query(
        'SELECT phone_number, first_name, last_name FROM users WHERE id = ? AND is_active = true',
        [userId],
      );

    if (users.length === 0) {
      return error(res, 'User not found', 404);
    }

    const user = users[0];

    if (!user.phone_number) {
      return error(res, 'You do not have a phone number registered. Please update your profile.');
    }

    const smsResult = await sendSMS(user.phone_number, message);

    if (smsResult.success) {
      try {
        await db.promise().query(
          `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, affected_record_id, created_at)
           VALUES (?, 'SMS_SENT', ?, 'users', ?, NOW())`,
          [
            userId,
            `SMS sent FROM ${user.first_name} ${user.last_name} (${user.phone_number}) TO company (${COMPANY_PHONE_NUMBER})`,
            userId,
          ],
        );
      } catch (logError) {
        console.warn('[SMS SEND] Activity log insert failed:', logError.message);
      }

      const simulated = Boolean(smsResult?.data?.simulated);
      res.json({
        success: true,
        message: simulated
          ? 'Message queued for delivery to company'
          : 'Message sent successfully to company',
        from: user.phone_number,
        to: COMPANY_PHONE_NUMBER,
        simulated,
        relay: simulated ? 'queued' : 'sent',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: smsResult.error,
      });
    }
  } catch (error) {
    console.error('[SMS SEND] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
});

// Send SMS to multiple users (bulk)
/**
 * @swagger
 * /api/sms/send-bulk:
 *   post:
 *     summary: Send a bulk SMS to multiple users
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_ids, message]
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of user IDs to send SMS to
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1600
 *                 description: Message content
 *     responses:
 *       200:
 *         description: Bulk SMS sent successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: No valid users found with phone numbers
 */
router.post('/send-bulk', validate(smsBulkSchema), async (req, res) => {
  try {
    const { user_ids, message } = req.body;

    // Get all users' phone numbers
    const [users] = await db.promise().query(
      `SELECT id, phone_number, first_name, last_name 
       FROM users 
       WHERE id IN (?) AND is_active = true AND phone_number IS NOT NULL`,
      [user_ids],
    );

    if (users.length === 0) {
      return error(res, 'No valid users found with phone numbers', 404);
    }

    const phoneNumbers = users.map((user) => user.phone_number);

    // Send bulk SMS
    const smsResult = await sendBulkSMS(phoneNumbers, message);

    if (smsResult.success) {
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, created_at)
         VALUES (?, 'BULK_SMS_SENT', ?, 'users', NOW())`,
        [
          user_ids[0],
          `Bulk SMS sent to ${users.length} users: ${users.map((u) => u.phone_number).join(', ')}`,
        ],
      );

      return success(res, {
        message: 'Bulk SMS sent successfully',
        recipients_count: users.length,
        recipients: phoneNumbers,
      });
    }
    return error(res, 'Failed to send bulk SMS');
  } catch (err) {
    console.error('[SMS BULK SEND] Error:', err);
    return error(res, 'Error sending bulk SMS');
  }
});

// Send SMS to all active users with phone numbers
/**
 * @swagger
 * /api/sms/send-all:
 *   post:
 *     summary: Send an SMS to all active users with phone numbers
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1600
 *                 description: Message content
 *     responses:
 *       200:
 *         description: Bulk SMS sent to all active users successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: No active users found with phone numbers
 */
router.post('/send-all', validate(messageSchema), async (req, res) => {
  try {
    const { message } = req.body;

    // Get all active users with phone numbers
    const [users] = await db.promise().query(
      `SELECT id, phone_number, first_name, last_name 
       FROM users 
       WHERE is_active = true AND phone_number IS NOT NULL AND phone_number != ''`,
    );

    if (users.length === 0) {
      return error(res, 'No active users found with phone numbers', 404);
    }

    const phoneNumbers = users.map((user) => user.phone_number);

    // Send bulk SMS
    const smsResult = await sendBulkSMS(phoneNumbers, message);

    if (smsResult.success) {
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, created_at)
         VALUES (1, 'BULK_SMS_ALL', ?, 'users', NOW())`,
        [`Bulk SMS sent to all ${users.length} active users`],
      );

      return success(res, {
        message: 'Bulk SMS sent to all active users successfully',
        recipients_count: users.length,
      });
    }
    return error(res, 'Failed to send bulk SMS');
  } catch (err) {
    console.error('[SMS SEND ALL] Error:', err);
    return error(res, 'Error sending bulk SMS to all users');
  }
});

module.exports = router;
