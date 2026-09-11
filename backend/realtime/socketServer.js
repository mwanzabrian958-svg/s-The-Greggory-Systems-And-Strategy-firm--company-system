// REALTIME SERVER — Socket.IO attached to the same HTTP server as the REST API.
// Auth accepts BOTH token families the app issues:
//   1. Admin/developer HMAC session tokens (utils/sessionToken)
//   2. Regular user JWTs (jsonwebtoken / JWT_SECRET, as used by /api/users/*)
// Event contract lives in backend/types/socket.d.ts (ServerToClientEvents /
// ClientToServerEvents) — keep both sides in sync.

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { verifySessionToken } = require('../utils/sessionToken');

let io = null;
// userId -> number of live sockets (multi-tab support)
const onlineCounts = new Map();

/**
 * Resolve a bearer/handshake token to an identity.
 * @returns {{ userId: number, role: string } | null}
 */
function resolveUserIdFromToken(token) {
  if (!token || typeof token !== 'string') return null;

  // 1) Admin/developer session tokens (signed HMAC payload `{ uid, exp }`)
  const session = verifySessionToken(token);
  if (session && session.uid) {
    return { userId: Number(session.uid), role: session.role || 'admin' };
  }

  // 2) Regular user JWTs (`{ userId | id | user.id }`)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded.user?.id;
    if (userId) return { userId: Number(userId), role: decoded.role || 'user' };
  } catch (_) {
    // Not a JWT — fall through to rejection
  }
  return null;
}

function initSocketServer(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin || true,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Handshake auth — the JWT/session token rides in `auth` (fallback: query).
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const identity = resolveUserIdFromToken(token);
    if (!identity) return next(new Error('Unauthorized'));
    socket.data.userId = identity.userId;
    socket.data.role = identity.role;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);

    // Presence — broadcast only on the first socket for this user.
    const connections = (onlineCounts.get(userId) || 0) + 1;
    onlineCounts.set(userId, connections);
    if (connections === 1) {
      io.emit('online-status:change', { userId: String(userId), isOnline: true });
    }

    socket.emit('connected', { userId: String(userId), rooms: [`user:${userId}`] });

    socket.on('auth:join', (_payload, ack) => {
      // Handshake auth already verified the token; re-joining is a no-op ack.
      if (typeof ack === 'function') ack({ success: true, userId: String(userId) });
    });

    socket.on('auth:leave', () => socket.disconnect(true));

    socket.on('notification:markRead', async (data, ack) => {
      try {
        // NOTE: single-quoted SQL literal — this database runs with ANSI_QUOTES,
        // where double quotes denote identifiers, not strings.
        const [result] = await db
          .promise()
          .query("UPDATE notifications SET status = 'read' WHERE id = ? AND user_id = ?", [
            data?.id,
            userId,
          ]);
        const updated = (result?.affectedRows || 0) > 0;
        if (updated) io.to(`user:${userId}`).emit('notification:read', { id: data.id });
        if (typeof ack === 'function') ack({ success: true, updated });
      } catch (error) {
        console.error('[SOCKET] notification:markRead failed:', error.message);
        if (typeof ack === 'function') ack({ success: false, error: error.message });
      }
    });

    socket.on('notification:delete', async (data, ack) => {
      try {
        const [result] = await db
          .promise()
          .query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [data?.id, userId]);
        const deleted = (result?.affectedRows || 0) > 0;
        if (deleted) io.to(`user:${userId}`).emit('notification:delete', { id: data.id });
        if (typeof ack === 'function') ack({ success: true, deleted });
      } catch (error) {
        console.error('[SOCKET] notification:delete failed:', error.message);
        if (typeof ack === 'function') ack({ success: false, error: error.message });
      }
    });

    socket.on('conversation:join', (data, ack) => {
      if (!data?.conversationId) {
        if (typeof ack === 'function') ack({ success: false, error: 'conversationId required' });
        return;
      }
      socket.join(`conversation:${data.conversationId}`);
      if (typeof ack === 'function') ack({ success: true });
    });

    socket.on('typing:start', (data) => {
      if (!data?.conversationId) return;
      const room = `conversation:${data.conversationId}`;
      socket.join(room);
      socket
        .to(room)
        .emit('typing:start', { userId: String(userId), conversationId: data.conversationId });
    });

    socket.on('typing:stop', (data) => {
      if (!data?.conversationId) return;
      const room = `conversation:${data.conversationId}`;
      socket
        .to(room)
        .emit('typing:stop', { userId: String(userId), conversationId: data.conversationId });
    });

    // Conversations are relayed in-memory (messages are not persisted yet —
    // there is no messages table). Persistence is a documented follow-up.
    socket.on('message:send', (data) => {
      if (!data?.conversationId || !data?.content) return;
      const room = `conversation:${data.conversationId}`;
      socket.join(room);
      io.to(room).emit('message:new', {
        id: `local-${Date.now()}`,
        conversationId: data.conversationId,
        senderId: String(userId),
        content: data.content,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('message:edit', (data) => {
      if (!data?.id || !data?.conversationId) return;
      const room = `conversation:${data.conversationId}`;
      socket.join(room);
      io.to(room).emit('message:updated', {
        id: data.id,
        content: data.content,
        updatedAt: new Date().toISOString(),
      });
    });

    socket.on('message:delete', (data) => {
      if (!data?.id || !data?.conversationId) return;
      const room = `conversation:${data.conversationId}`;
      socket.join(room);
      io.to(room).emit('message:deleted', { id: data.id });
    });

    socket.on('dashboard:requestStats', async () => {
      try {
        const [users] = await db
          .promise()
          .query('SELECT COUNT(*) AS c FROM users WHERE deleted_at IS NULL');
        const [projects] = await db
          .promise()
          .query('SELECT COUNT(*) AS c FROM user_projects WHERE deleted_at IS NULL');
        const [invoices] = await db
          .promise()
          .query('SELECT COUNT(*) AS c FROM invoices WHERE deleted_at IS NULL');
        socket.emit('dashboard:stats', {
          totalUsers: Number(users?.[0]?.c) || 0,
          totalProjects: Number(projects?.[0]?.c) || 0,
          totalInvoices: Number(invoices?.[0]?.c) || 0,
        });
      } catch (error) {
        console.error('[SOCKET] dashboard:requestStats failed:', error.message);
        socket.emit('dashboard:stats', { totalUsers: 0, totalProjects: 0, totalInvoices: 0 });
      }
    });

    socket.on('disconnect', () => {
      const remaining = (onlineCounts.get(userId) || 1) - 1;
      if (remaining <= 0) {
        onlineCounts.delete(userId);
        io.emit('online-status:change', { userId: String(userId), isOnline: false });
      } else {
        onlineCounts.set(userId, remaining);
      }
    });
  });

  return io;
}

function getIO() {
  return io;
}

/** Push any server event to every live socket of one user. No-op if realtime is down. */
function emitToUser(userId, event, payload) {
  if (!io || userId === null || userId === undefined) return;
  io.to(`user:${Number(userId)}`).emit(event, payload);
}

function isUserOnline(userId) {
  return (onlineCounts.get(Number(userId)) || 0) > 0;
}

module.exports = { initSocketServer, getIO, emitToUser, isUserOnline, resolveUserIdFromToken };
