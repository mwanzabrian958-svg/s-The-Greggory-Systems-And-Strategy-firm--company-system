const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  sendWhatsAppMessage,
  sendBulkWhatsApp,
  COMPANY_WHATSAPP_NUMBER,
} = require('../services/whatsappService');

// Two-MySQL failover pool (local:3306 + claude:28067) — same as the rest of
// the API, via the shared cluster in backend/config/database.js.
const db = require('../config/database');
const { validate, whatsappBulkSchema } = require('../validators');
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
  } catch (error) {
    return error(res, 'Invalid or expired authentication token', 401);
  }
};

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4096, 'Message too long'),
});

// Health check
router.get('/test', (req, res) => {
  success(res, { message: 'WhatsApp router is working', company_phone: COMPANY_WHATSAPP_NUMBER });
});

// Send WhatsApp message FROM user TO company WhatsApp number
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

    const whatsappResult = await sendWhatsAppMessage(user.phone_number, message);

    if (whatsappResult.success) {
      try {
        await db.promise().query(
          `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, affected_record_id, created_at)
           VALUES (?, 'WHATSAPP_SENT', ?, 'users', ?, NOW())`,
          [
            userId,
            `WhatsApp sent FROM ${user.first_name} ${user.last_name} (${user.phone_number}) TO company (${COMPANY_WHATSAPP_NUMBER})`,
            userId,
          ],
        );
      } catch (logError) {
        console.warn('[WHATSAPP SEND] Activity log insert failed:', logError.message);
      }

      const simulated = Boolean(whatsappResult?.data?.simulated);
      return success(res, {
        message: simulated
          ? 'WhatsApp message queued for delivery to company'
          : 'WhatsApp message sent successfully to company',
        from: user.phone_number,
        to: COMPANY_WHATSAPP_NUMBER,
        simulated,
        relay: simulated ? 'queued' : 'sent',
      });
    }
    return error(res, 'Failed to send WhatsApp message');
  } catch (err) {
    console.error('[WHATSAPP SEND] Error:', err);
    return error(res, 'Error sending WhatsApp message');
  }
});

// Send WhatsApp message to multiple users (bulk - admin function)
router.post('/send-bulk', validate(whatsappBulkSchema), async (req, res) => {
  try {
    const { userIds, message } = req.body;

    const [users] = await db.promise().query(
      `SELECT id, phone_number, first_name, last_name 
       FROM users 
       WHERE id IN (?) AND is_active = true AND phone_number IS NOT NULL`,
      [userIds],
    );

    if (users.length === 0) {
      return error(res, 'No valid users found with phone numbers', 404);
    }

    const phoneNumbers = users.map((user) => user.phone_number);

    const whatsappResult = await sendBulkWhatsApp(phoneNumbers, message);

    if (whatsappResult.success) {
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, created_at)
         VALUES (?, 'BULK_WHATSAPP_SENT', ?, 'users', NOW())`,
        [
          userIds[0],
          `Bulk WhatsApp sent to ${users.length} users: ${users.map((u) => u.phone_number).join(', ')}`,
        ],
      );

      return success(res, {
        message: 'Bulk WhatsApp sent successfully',
        recipients_count: users.length,
        recipients: phoneNumbers,
      });
    }
    return error(res, 'Failed to send bulk WhatsApp');
  } catch (err) {
    console.error('[WHATSAPP BULK SEND] Error:', err);
    return error(res, 'Error sending bulk WhatsApp');
  }
});

module.exports = router;
