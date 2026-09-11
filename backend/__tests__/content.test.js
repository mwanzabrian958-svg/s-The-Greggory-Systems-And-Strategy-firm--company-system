const request = require('supertest');
const app = require('../server');

describe('Content API validation', () => {
  describe('POST /api/content', () => {
    it('rejects content without title', async () => {
      const res = await request(app)
        .post('/api/content')
        .send({ body: 'Some content' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects content without body', async () => {
      const res = await request(app)
        .post('/api/content')
        .send({ title: 'Some title' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid type', async () => {
      const res = await request(app)
        .post('/api/content')
        .send({ title: 'Title', body: 'Body', type: 'invalid_type' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('accepts valid content types', async () => {
      const types = ['page', 'post', 'article', 'faq'];
      for (const type of types) {
        const res = await request(app)
          .post('/api/content')
          .send({ title: 'Title', body: 'Body', type })
          .set('Accept', 'application/json');
        // Should pass validation (may fail on DB, but not validation)
        expect(res.status).not.toBe(400);
      }
    });

    it('includes field-level error details', async () => {
      const res = await request(app)
        .post('/api/content')
        .send({})
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe('PUT /api/content/:id', () => {
    it('rejects update without title', async () => {
      const res = await request(app)
        .put('/api/content/1')
        .send({ body: 'Some content' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
