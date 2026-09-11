const request = require('supertest');
const app = require('../server');

/**
 * Sprint 7 — admin route contract tests.
 *
 * These tests pin the PUBLIC URL + status-code contract of the admin surface
 * BEFORE/AFTER the admin.js → admin-users.js split. They intentionally avoid
 * database-dependent happy paths (the 401 middleware runs before any query),
 * so they pass against both the monolith and the split routers.
 */

describe('Admin route contract (auth-rejection parity)', () => {
  const protectedGetEndpoints = [
    '/api/admin/live-users',
    '/api/admin/admin-users',
    '/api/admin/users',
    '/api/admin/users/1',
    '/api/admin/users/1/export-pdf',
  ];

  protectedGetEndpoints.forEach((endpoint) => {
    it(`GET ${endpoint} → 401 without token`, async () => {
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  it('POST /api/admin/create-admin → 401 without token', async () => {
    const res = await request(app)
      .post('/api/admin/create-admin')
      .send({ email: 'x@y.com', password: 'password123', first_name: 'A', last_name: 'B' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/admin/users/1 → 401 without token', async () => {
    const res = await request(app).delete('/api/admin/users/1');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/admin/users/1 → 401 without token', async () => {
    const res = await request(app).put('/api/admin/users/1').send({ first_name: 'X' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Admin public endpoints (shape contract)', () => {
  it('GET /api/admin/search without q → 200 with empty results (no DB hit)', async () => {
    const res = await request(app).get('/api/admin/search');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toEqual([]);
  });

  it('GET /api/admin/search with short q → 200 with empty results', async () => {
    const res = await request(app).get('/api/admin/search?q=a');
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });

  it('GET /api/admin/profile-lookup without email → 400', async () => {
    const res = await request(app).get('/api/admin/profile-lookup');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Response Helper', () => {
  describe('GET /api/health', () => {
    it('returns standardized success format', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });
});

describe('Validation Middleware', () => {
  describe('POST /api/users/register', () => {
    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ password: 'password123', first_name: 'Test', last_name: 'User' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects short password', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@test.com', password: '123', first_name: 'Test', last_name: 'User' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects missing names', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@test.com', password: 'password123', first_name: '', last_name: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('includes field-level error details', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ email: 'not-an-email', password: '123', first_name: '', last_name: '' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe('POST /api/blog-articles', () => {
    it('rejects missing title', async () => {
      const res = await request(app).post('/api/blog-articles').send({ content: 'Some content' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects missing content', async () => {
      const res = await request(app).post('/api/blog-articles').send({ title: 'Some title' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('POST /api/users/reset-password', () => {
  it('rejects missing token', async () => {
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ password: 'newpassword123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
  });

  it('rejects missing password', async () => {
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'some-token-value' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'some-token-value', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('includes field-level error details', async () => {
    const res = await request(app).post('/api/users/reset-password').send({ password: '123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('rejects invalid or expired token', async () => {
    // Non-hex token fails fast before any DB access (see users.js guard), so
    // this test is DB-independent — matching the no-DB convention of this file.
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'not-a-real-reset-token', password: 'newpassword123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired reset token');
  });
});
