const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

const TEST_TOKEN = jwt.sign({ userId: 1, id: 1 }, process.env.JWT_SECRET || 'test-secret');

describe('M-Pesa API validation', () => {
  describe('POST /api/mpesa/stkpush', () => {
    it('rejects request with missing phone number', async () => {
      const res = await request(app)
        .post('/api/mpesa/stkpush')
        .send({ amount: 100 })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects request with missing amount', async () => {
      const res = await request(app)
        .post('/api/mpesa/stkpush')
        .send({ phone_number: '254712345678' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid phone format', async () => {
      const res = await request(app)
        .post('/api/mpesa/stkpush')
        .send({ phone_number: '0712345678', amount: 100 })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects zero or negative amount', async () => {
      const res = await request(app)
        .post('/api/mpesa/stkpush')
        .send({ phone_number: '254712345678', amount: 0 })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('includes field-level error details', async () => {
      const res = await request(app)
        .post('/api/mpesa/stkpush')
        .send({})
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });
});
