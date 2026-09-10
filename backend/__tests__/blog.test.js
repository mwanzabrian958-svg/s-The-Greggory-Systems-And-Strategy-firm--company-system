const request = require('supertest');
const app = require('../server');

// DB-backed tests require a LIVE MySQL (local XAMPP or cloud Aiven). They are
// only run when explicitly opted in — `RUN_DB_TESTS=1 npm test` — so the
// standard test run is deterministic in CI and on dev machines where the
// database may be down. Validation-only tests always run (no DB needed).
const runDbTests = process.env.RUN_DB_TESTS === '1';
const describeDb = runDbTests ? describe : describe.skip;

describe('Blog API validation', () => {
  describe('POST /api/blog-articles', () => {
    it('rejects article without title', async () => {
      const res = await request(app)
        .post('/api/blog-articles')
        .send({ content: 'Some content' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
    });

    it('rejects article without content', async () => {
      const res = await request(app)
        .post('/api/blog-articles')
        .send({ title: 'Some title' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
    });
  });
});

describeDb('Blog API (DB-backed)', () => {
  it('returns a list of blog articles', async () => {
    const res = await request(app).get('/api/blog-articles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 30000);

  it('returns 404 for non-existent article', async () => {
    const res = await request(app).get('/api/blog-articles/999999');
    expect(res.status).toBe(404);
  }, 30000);
});
