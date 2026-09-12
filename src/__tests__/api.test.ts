import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { API_BASE_URL, apiCall, getApiUrl } from '../services/api';

describe('getApiUrl', () => {
  it('prefixes relative paths with the API base', () => {
    expect(getApiUrl('/users')).toBe(`${API_BASE_URL}/users`);
    expect(getApiUrl('users')).toBe(`${API_BASE_URL}/users`);
  });

  it('never doubles the /api prefix', () => {
    expect(getApiUrl('/api/users')).toBe(`${API_BASE_URL}/users`);
  });

  it('passes absolute URLs through untouched', () => {
    expect(getApiUrl('https://example.com/x')).toBe('https://example.com/x');
  });
});

describe('apiCall', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => '{"success":true}' });
    await expect(apiCall('/users')).resolves.toEqual({ success: true });
    expect(String(mockFetch.mock.calls[0][0])).toContain('/users');
  });

  it('injects the client session token as a Bearer header', async () => {
    localStorage.setItem('tgf_user', JSON.stringify({ token: 'abc123' }));
    mockFetch.mockResolvedValue({ ok: true, text: async () => '{}' });
    await apiCall('/users');
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc123');
  });

  it('returns an empty marker for empty successful bodies', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => '' });
    await expect(apiCall('/users')).resolves.toEqual({ success: true, empty: true });
  });

  it('throws the server message on HTTP errors', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400, text: async () => '{"message":"boom"}' });
    await expect(apiCall('/users')).rejects.toThrow('boom');
  });

  it('wraps non-JSON error pages', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, text: async () => '<html>oops' });
    await expect(apiCall('/users')).rejects.toThrow('Server Error (500)');
  });

  it('rethrows network failures', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));
    await expect(apiCall('/users')).rejects.toThrow('Failed to fetch');
  });
});
