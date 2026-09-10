const request = require('supertest');
const app = require('../server');

describe('Protected Routes', () => {
  describe('Admin Routes', () => {
    it('rejects GET /api/admin/live-users without token', async () => {
      const res = await request(app).get('/api/admin/live-users');
      expect([401, 403]).toContain(res.status);
    });

    it('rejects GET /api/admin/admin-users without token', async () => {
      const res = await request(app).get('/api/admin/admin-users');
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('User Routes', () => {
    it('rejects GET /api/users/client-dashboard without token', async () => {
      const res = await request(app).get('/api/users/client-dashboard');
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Invalid Token', () => {
    it('rejects request with malformed token', async () => {
      const res = await request(app)
        .get('/api/admin/live-users')
        .set('Authorization', 'Bearer invalid-token-here');
      expect([401, 403]).toContain(res.status);
    });

    it('rejects request with expired token', async () => {
      const res = await request(app)
        .get('/api/admin/live-users')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDA5fQ.signature',
        );
      expect([401, 403]).toContain(res.status);
    });
  });
});
