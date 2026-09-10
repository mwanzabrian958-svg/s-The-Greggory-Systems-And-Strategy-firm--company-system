const request = require('supertest');
const app = require('../server');

describe('Users API', () => {
  describe('GET /api/users/test', () => {
    it('confirms router is loaded', async () => {
      const res = await request(app).get('/api/users/test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Users router is working');
    });
  });

  describe('POST /api/users/register', () => {
    it('rejects registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
        })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
    });

    it('rejects registration with short password', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: '123',
          first_name: 'Test',
          last_name: 'User',
        })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
    });

    it('rejects registration with missing name', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          first_name: '',
          last_name: '',
        })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/users/login', () => {
    it('rejects login with invalid email format', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'notanemail', password: 'test123' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
    });

    it('rejects login with missing password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@test.com', password: '' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
    });
  });
});
