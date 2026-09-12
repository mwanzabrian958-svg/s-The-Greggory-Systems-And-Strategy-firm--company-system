import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockIo, created } = vi.hoisted(() => ({
  mockIo: vi.fn(),
  created: [] as any[],
}));

vi.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => mockIo(...args),
}));

import {
  SUB,
  resolveSocketUrl,
  createSocket,
  getSocket,
  connectSocket,
  disconnectSocket,
  on,
  off,
} from '../services/socket';

function fakeSocket(url: string) {
  const s = {
    url,
    connected: false,
    auth: null as any,
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  };
  created.push(s);
  return s;
}

describe('socket service', () => {
  beforeEach(() => {
    disconnectSocket();
    created.length = 0;
    mockIo.mockReset();
    mockIo.mockImplementation((url: string) => fakeSocket(url));
  });

  afterEach(() => {
    disconnectSocket();
    vi.unstubAllEnvs();
    delete (window as any).APIConfig;
  });

  it('exposes the namespaced sub-event map', () => {
    expect(SUB.notification).toEqual(['new', 'read', 'delete']);
  });

  it('prefers an explicit URL and trims slashes', () => {
    expect(resolveSocketUrl('http://x:3000/')).toBe('http://x:3000');
  });

  it('uses the Electron-injected base URL when present', () => {
    (window as any).APIConfig = { baseURL: 'http://injected:4000/' };
    expect(resolveSocketUrl()).toBe('http://injected:4000');
  });

  it('strips the /api suffix from VITE_API_BASE_URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://env:5000/api/');
    expect(resolveSocketUrl()).toBe('http://env:5000');
  });

  it('falls back to the dev URL', () => {
    expect(resolveSocketUrl()).toBe('http://localhost:3000');
  });

  it('createSocket passes retry options and reuses a live socket', () => {
    const first = createSocket('http://a') as any;
    expect(mockIo).toHaveBeenCalledWith(
      'http://a',
      expect.objectContaining({ autoConnect: false }),
    );
    first.connected = true;
    const second = createSocket('http://b');
    expect(second).toBe(first);
    expect(mockIo).toHaveBeenCalledTimes(1);
  });

  it('connectSocket attaches the token and connects', () => {
    const sock = connectSocket(undefined, 'tok-9') as any;
    expect(sock.auth).toEqual({ token: 'tok-9' });
    expect(sock.connect).toHaveBeenCalled();
  });

  it('on() registers every sub-event, off() removes them', () => {
    const fn = vi.fn();
    on('notification', fn);
    const sock = created[0];
    expect(sock.on).toHaveBeenCalledWith('notification:new', fn);
    expect(sock.on).toHaveBeenCalledWith('notification:read', fn);
    expect(sock.on).toHaveBeenCalledWith('notification:delete', fn);
    off('notification');
    expect(sock.removeAllListeners).toHaveBeenCalledWith('notification');
  });

  it('getSocket memoizes and disconnectSocket resets', () => {
    const a = getSocket('http://memo');
    const b = getSocket('http://memo');
    expect(b).toBe(a);
    disconnectSocket();
    expect((a as any).disconnect).toHaveBeenCalled();
    const c = getSocket('http://memo');
    expect(c).not.toBe(a);
  });
});
