// @vitest-environment node
// Realtime (Socket.IO) integration tests — auth handshake, presence, acks.
// Runs against a real HTTP server on an ephemeral port with socket.io-client.
const http = require('http');
const { io: Client } = require('socket.io-client');
const jwt = require('jsonwebtoken');

const app = require('../server');
const { initSocketServer, resolveUserIdFromToken } = require('../realtime/socketServer');
const { signSessionToken } = require('../utils/sessionToken');

const ADMIN_TOKEN = signSessionToken(5151, 'admin');
const USER_JWT = jwt.sign({ userId: 4242 }, process.env.JWT_SECRET || 'test-secret');

let httpServer;
let io;
let url;
const clients = [];

function connect(token) {
  const client = Client(url, {
    auth: token ? { token } : {},
    transports: ['websocket'],
    reconnection: false,
    timeout: 5000,
  });
  clients.push(client);
  return client;
}

function waitFor(client, event, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for "${event}"`)), timeout);
    client.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
    client.once('connect_error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function emitAck(client, event, payload, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout waiting for ack of "${event}"`)),
      timeout,
    );
    client.emit(event, payload, (ack) => {
      clearTimeout(timer);
      resolve(ack);
    });
  });
}

beforeAll(async () => {
  httpServer = http.createServer(app);
  io = initSocketServer(httpServer);
  await new Promise((resolve) => httpServer.listen(0, resolve));
  url = `http://127.0.0.1:${httpServer.address().port}`;
});

afterAll(async () => {
  for (const c of clients.splice(0)) c.disconnect();
  if (io) await new Promise((resolve) => io.close(resolve));
  if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
});

describe('resolveUserIdFromToken', () => {
  it('accepts admin/developer session tokens', () => {
    const identity = resolveUserIdFromToken(ADMIN_TOKEN);
    expect(identity).toEqual({ userId: 5151, role: 'admin' });
  });

  it('accepts regular user JWTs', () => {
    const identity = resolveUserIdFromToken(USER_JWT);
    expect(identity.userId).toBe(4242);
  });

  it('rejects garbage, missing and malformed tokens', () => {
    expect(resolveUserIdFromToken(null)).toBeNull();
    expect(resolveUserIdFromToken(undefined)).toBeNull();
    expect(resolveUserIdFromToken('not-a-token')).toBeNull();
    expect(resolveUserIdFromToken('a.b')).toBeNull();
    expect(resolveUserIdFromToken(ADMIN_TOKEN.slice(0, -2) + 'xx')).toBeNull();
  });
});

describe('Socket.IO handshake auth', () => {
  it('rejects connections without a token', async () => {
    const client = connect(null);
    await expect(waitFor(client, 'connect')).rejects.toThrow('Unauthorized');
  });

  it('rejects connections with an invalid token', async () => {
    const client = connect('forged.token-value');
    await expect(waitFor(client, 'connect')).rejects.toThrow('Unauthorized');
  });

  it('authenticates admin session tokens and emits "connected"', async () => {
    const client = connect(ADMIN_TOKEN);
    const payload = await waitFor(client, 'connected');
    expect(payload.userId).toBe('5151');
    expect(payload.rooms).toContain('user:5151');
  });

  it('authenticates regular user JWTs', async () => {
    const client = connect(USER_JWT);
    const payload = await waitFor(client, 'connected');
    expect(payload.userId).toBe('4242');
  });
});

describe('Presence + realtime ops', () => {
  it('broadcasts online-status:change as users come and go', async () => {
    // Unique IDs — earlier tests leave their clients connected, and presence
    // only broadcasts on a user's FIRST live socket.
    const adminToken = signSessionToken(6161, 'admin');
    const userJwt = jwt.sign({ userId: 6262 }, process.env.JWT_SECRET || 'test-secret');

    const admin = connect(adminToken);
    await waitFor(admin, 'connected');

    const changePromise = waitFor(admin, 'online-status:change');
    const user = connect(userJwt);
    await waitFor(user, 'connected');
    const online = await changePromise;
    expect(online).toEqual({ userId: '6262', isOnline: true });

    const offlinePromise = waitFor(admin, 'online-status:change');
    user.disconnect();
    const offline = await offlinePromise;
    expect(offline).toEqual({ userId: '6262', isOnline: false });
  }, 15000);

  it('acks notification:markRead without owning rows', async () => {
    const client = connect(USER_JWT);
    await waitFor(client, 'connected');
    const ack = await emitAck(client, 'notification:markRead', { id: 999999 });
    expect(ack.success).toBe(true);
    expect(ack.updated).toBe(false);
  });

  it('acks notification:delete without owning rows', async () => {
    const client = connect(ADMIN_TOKEN);
    await waitFor(client, 'connected');
    const ack = await emitAck(client, 'notification:delete', { id: 999999 });
    expect(ack.success).toBe(true);
    expect(ack.deleted).toBe(false);
  });

  it('answers dashboard:requestStats with numeric stats', async () => {
    const client = connect(ADMIN_TOKEN);
    await waitFor(client, 'connected');
    const statsPromise = waitFor(client, 'dashboard:stats');
    client.emit('dashboard:requestStats');
    const stats = await statsPromise;
    expect(typeof stats.totalUsers).toBe('number');
    expect(typeof stats.totalProjects).toBe('number');
    expect(typeof stats.totalInvoices).toBe('number');
  });

  it('relays typing + messages inside a conversation room', async () => {
    const admin = connect(ADMIN_TOKEN);
    const user = connect(USER_JWT);
    await waitFor(admin, 'connected');
    await waitFor(user, 'connected');

    // Both sides must explicitly join the room before relays reach them.
    await emitAck(admin, 'conversation:join', { conversationId: 'test-conv' });
    await emitAck(user, 'conversation:join', { conversationId: 'test-conv' });

    const typingPromise = waitFor(admin, 'typing:start');
    user.emit('typing:start', { conversationId: 'test-conv' });
    const typing = await typingPromise;
    expect(typing.conversationId).toBe('test-conv');

    const messagePromise = waitFor(admin, 'message:new');
    user.emit('message:send', { conversationId: 'test-conv', content: 'hello realtime' });
    const message = await messagePromise;
    expect(message.content).toBe('hello realtime');
    expect(message.senderId).toBe('4242');
  }, 15000);
});
