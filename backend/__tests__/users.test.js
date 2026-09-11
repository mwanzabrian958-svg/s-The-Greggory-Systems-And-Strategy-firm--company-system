const request = require('supertest');
const app = require('../server');

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
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'definitely-not-a-real-token-0123456789abcdef', password: 'newpassword123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired reset token');
  });
});
