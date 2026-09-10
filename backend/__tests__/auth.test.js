const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  describe('POST /api/users/login', () => {
    it('rejects request with missing email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ password: 'test123' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(res.status).toBe(400);
    });

    it('rejects request with missing password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@test.com' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(res.status).toBe(400);
    });

    it('rejects request with invalid email format', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'notanemail', password: 'test123' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/health', () => {
    it('returns server status', async () => {
      const res = await request(app).get('/api/health').expect('Content-Type', /json/).expect(200);

      expect(res.body.status).toBe('OK');
      expect(res.body.message).toBe('Server is running');
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
      expect(res.body).toHaveProperty('database');
    });
  });
});
