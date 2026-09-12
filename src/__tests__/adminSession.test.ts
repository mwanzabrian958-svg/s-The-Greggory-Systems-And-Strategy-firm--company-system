import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockApi } = vi.hoisted(() => ({ mockApi: vi.fn() }));

vi.mock('../services/api', () => ({
  apiCall: (...args: unknown[]) => mockApi(...args),
}));

import {
  getAdminToken,
  setAdminToken,
  clearAdminSession,
  hasAdminToken,
  verifyAdminSession,
  adminAuthenticate,
  developerAuthenticate,
} from '../utils/adminSession';

describe('adminSession token helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    mockApi.mockReset();
  });

  afterEach(() => localStorage.clear());

  it('set/get/has round-trip the token', () => {
    expect(hasAdminToken()).toBe(false);
    setAdminToken('tok-1');
    expect(getAdminToken()).toBe('tok-1');
    expect(hasAdminToken()).toBe(true);
  });

  it('clearAdminSession removes the token', () => {
    setAdminToken('tok-2');
    clearAdminSession();
    expect(hasAdminToken()).toBe(false);
    expect(getAdminToken()).toBeNull();
  });

  it('verifyAdminSession fails fast without a token', async () => {
    await expect(verifyAdminSession()).resolves.toEqual({ ok: false, user: null });
    expect(mockApi).not.toHaveBeenCalled();
  });

  it('verifyAdminSession returns the user on success', async () => {
    setAdminToken('tok-3');
    mockApi.mockResolvedValue({ success: true, user: { id: 1 } });
    await expect(verifyAdminSession()).resolves.toEqual({ ok: true, user: { id: 1 } });
  });

  it('verifyAdminSession clears the session when the server rejects', async () => {
    setAdminToken('tok-4');
    mockApi.mockResolvedValue({ success: false });
    await expect(verifyAdminSession()).resolves.toEqual({ ok: false, user: null });
    expect(hasAdminToken()).toBe(false);
  });

  it('adminAuthenticate maps success and failure', async () => {
    mockApi.mockResolvedValue({ success: true });
    await expect(adminAuthenticate({ email: 'a', password: 'b' })).resolves.toMatchObject({
      ok: true,
    });
    mockApi.mockRejectedValue(new Error('nope'));
    const res = await adminAuthenticate({ email: 'a', password: 'b' });
    expect(res.ok).toBe(false);
    expect(res.data.message).toBe('nope');
  });

  it('developerAuthenticate maps success and failure', async () => {
    mockApi.mockResolvedValue({ success: true });
    await expect(developerAuthenticate({ email: 'a', password: 'b' })).resolves.toMatchObject({
      ok: true,
    });
    mockApi.mockRejectedValue(new Error('down'));
    const res = await developerAuthenticate({ email: 'a', password: 'b' });
    expect(res.ok).toBe(false);
  });
});
