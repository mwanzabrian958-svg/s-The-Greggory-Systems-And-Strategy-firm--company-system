const db = require('../config/database');

// Live push bridge — when the realtime server is up, every created notification
// is also emitted as `notification:new` to the recipient's socket room.
// Best-effort and fully guarded: a realtime outage must never break
// notification persistence.
let emitToUser = null;
try {
  ({ emitToUser } = require('../realtime/socketServer'));
} catch (_) {
  // Realtime server not available in this context — skip live pushes.
}

/**
 * Creates a real notification in the database for a specific user.
 * @param {number} userId - The recipient user ID
 * @param {string} type - notification_type (e.g., 'project_update', 'task_assigned', 'system')
 * @param {string} title - The notification title
 * @param {string} message - The main notification body
 * @param {string} priority - 'low', 'normal', 'high', 'urgent'
 */
const createNotification = async (userId, type, title, message, priority = 'normal') => {
  try {
    if (!userId) return;

    const [result] = await db
      .promise()
      .query(
        "INSERT INTO notifications (user_id, notification_type, title, message, priority, status, created_at) VALUES (?, ?, ?, ?, ?, 'unread', NOW())",
        [userId, type, title, message, priority],
      );

    if (emitToUser && result?.insertId) {
      try {
        emitToUser(userId, 'notification:new', {
          id: String(result.insertId),
          type,
          title,
          message,
          createdAt: new Date().toISOString(),
        });
      } catch (emitError) {
        console.warn('[REAL-LIFE NOTIF] Live push failed (persisted anyway):', emitError.message);
      }
    }

    console.log(`[REAL-LIFE NOTIF] Created for User ${userId}: ${title}`);
  } catch (error) {
    console.error('[REAL-LIFE NOTIF ERROR] Failed to create notification:', error);
  }
};

module.exports = { createNotification };
