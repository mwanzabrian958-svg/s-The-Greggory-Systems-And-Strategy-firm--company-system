const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

const TEST_TOKEN = jwt.sign({ userId: 1, id: 1 }, process.env.JWT_SECRET || 'test-secret');

describe('SMS API validation', () => {
  describe('POST /api/sms/send', () => {
    it('rejects request with missing message', async () => {
      const res = await request(app)
        .post('/api/sms/send')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({})
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects empty message', async () => {
      const res = await request(app)
        .post('/api/sms/send')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ message: '' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects message exceeding max length', async () => {
      const res = await request(app)
        .post('/api/sms/send')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ message: 'a'.repeat(1601) })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('includes field-level error details', async () => {
      const res = await request(app)
        .post('/api/sms/send')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({})
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe('POST /api/sms/send-bulk', () => {
    it('rejects request with missing user_ids', async () => {
      const res = await request(app)
        .post('/api/sms/send-bulk')
        .send({ message: 'Hello' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects request with missing message', async () => {
      const res = await request(app)
        .post('/api/sms/send-bulk')
        .send({ user_ids: [1, 2] })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects empty user_ids array', async () => {
      const res = await request(app)
        .post('/api/sms/send-bulk')
        .send({ user_ids: [], message: 'Hello' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/sms/send-all', () => {
    it('rejects request with missing message', async () => {
      const res = await request(app)
        .post('/api/sms/send-all')
        .send({})
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
