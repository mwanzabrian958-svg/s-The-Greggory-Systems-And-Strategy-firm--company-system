import { io, Socket } from 'socket.io-client';

// Typed event definitions shared with the server contract in backend/types/socket.d.ts
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type AnyListener = (..._args: unknown[]) => void;

// The dynamic `e + ':' + subEvent` names can't be expressed as literal-typed
// event names, so listener registration goes through this minimal structural
// surface instead of the literal-union overloads.
type LooseEmitter = {
  on: (_event: string, _listener: AnyListener) => void;
  removeAllListeners: (_event: string) => void;
};

let socket: AppSocket | null = null;

const SUB: Record<string, string[]> = {
  notification: ['new', 'read', 'delete'],
  activity: ['update'],
  onlineStatus: ['change'],
  typing: ['start', 'stop'],
  message: ['new', 'updated', 'deleted'],
  auth: ['refresh'],
  dashboard: ['stats'],
};

export function createSocket(url: string) {
  if (socket && socket.connected) return socket;
  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false,
  });
  console.log('[socket] created:', url);
  return socket;
}

export function getSocket(u?: string) {
  if (!socket) {
    createSocket(u || window.APIConfig?.baseURL || 'http://localhost:3000');
  }
  return socket as AppSocket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function connectSocket(u?: string, t?: string) {
  const sock = getSocket(u);
  if (t) sock.auth = { token: t };
  sock.connect();
  console.log('[socket] connecting...');
  return sock;
}

export function on(e: string, fn: AnyListener) {
  const sock = getSocket();
  SUB[e]?.forEach((subEvent) => {
    (sock as unknown as LooseEmitter).on(e + ':' + subEvent, fn);
  });
}

export function off(e: string) {
  const sock = getSocket();
  (sock as unknown as LooseEmitter).removeAllListeners(e);
}

export { SUB };
