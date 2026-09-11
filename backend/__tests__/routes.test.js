const request = require('supertest');
const db = require('../config/database');

// These integration tests require LIVE MySQL instances (local:3306 + cloud:28067).
// Opt in with `RUN_DB_TESTS=1 npm test` -- standard runs stay deterministic.
// Uses REAL data: seeds rows into real tables, asserts on real DB state, cleans up.
const runDbTests = process.env.RUN_DB_TESTS === '1';
const describeDb = runDbTests ? describe : describe.skip;

const ADMIN_KEY = 'test-admin-key-2025';

// Unique test data to avoid collisions with existing rows.
const TEST_COMPANY_ID = 990001;
const TEST_EMAIL = `route-test-${Date.now()}@greggory.test`;
const TEST_CONTACT_EMAIL = `cf-test-${Date.now()}@greggory.test`;

process.env.ADMIN_KEY = ADMIN_KEY;

afterAll(async () => {
  try {
    await db.promise().query('DELETE FROM management_info WHERE company_id = ?', [TEST_COMPANY_ID]);
  } catch (_) {}
  try {
    await db.promise().query('DELETE FROM contact_forms WHERE email = ?', [TEST_CONTACT_EMAIL]);
  } catch (_) {}
  try {
    await db.promise().query('DELETE FROM users WHERE email = ?', [TEST_EMAIL]);
  } catch (_) {}
  await db.end();
});

const app = require('../server');

beforeAll(async () => {
  // Seed a real row into management_info for the GET tests.
  await db.promise().query(
    `INSERT INTO management_info (company_id, station_manager, service_area, base_location, updated_by)
     VALUES (?, 'Seed Manager', 'Nairobi CBD', 'Uhuru Gardens', 1)
     ON DUPLICATE KEY UPDATE
       station_manager = VALUES(station_manager),
       service_area = VALUES(service_area),
       base_location = VALUES(base_location),
       updated_by = VALUES(updated_by),
       updated_at = NOW()`,
    [TEST_COMPANY_ID],
  );
});

describeDb('Route coverage (real DB)', () => {
  describe('GET /api/management/:companyId', () => {
    it('returns seeded management info for a known company', async () => {
      const res = await request(app).get(`/api/management/${TEST_COMPANY_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.station_manager).toBe('Seed Manager');
      expect(res.body.service_area).toBe('Nairobi CBD');
    });

    it('returns default values for an unknown company', async () => {
      const res = await request(app).get('/api/management/99999999');
      expect(res.status).toBe(200);
      expect(res.body.station_manager).toBe('Not specified');
      expect(res.body.service_area).toBe('Not specified');
      expect(res.body.base_location).toBe('Not specified');
    });
  });

  describe('PUT /api/management/:companyId (admin)', () => {
    it('updates management info with a valid admin key', async () => {
      const res = await request(app)
        .put(`/api/management/${TEST_COMPANY_ID}`)
        .set('x-admin-key', ADMIN_KEY)
        .send({
          station_manager: 'Updated Manager',
          service_area: 'Westlands',
          base_location: 'Waiyaki Way',
          updated_by: 1,
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Management info updated successfully');

      // Verify the row was actually updated in the DB.
      const [rows] = await db
        .promise()
        .query(
          'SELECT station_manager, service_area, base_location FROM management_info WHERE company_id = ?',
          [TEST_COMPANY_ID],
        );
      expect(rows.length).toBe(1);
      expect(rows[0].station_manager).toBe('Updated Manager');
      expect(rows[0].service_area).toBe('Westlands');
      expect(rows[0].base_location).toBe('Waiyaki Way');
    });

    it('rejects update without admin key', async () => {
      const res = await request(app)
        .put(`/api/management/${TEST_COMPANY_ID}`)
        .send({ station_manager: 'Hacker' });
      expect(res.status).toBe(403);
    });

    it('rejects update with an invalid admin key', async () => {
      const res = await request(app)
        .put(`/api/management/${TEST_COMPANY_ID}`)
        .set('x-admin-key', 'wrong-key')
        .send({ station_manager: 'Hacker' });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/contact-forms', () => {
    it('creates a contact form submission', async () => {
      const res = await request(app).post('/api/contact-forms').send({
        name: 'Route Test User',
        email: TEST_CONTACT_EMAIL,
        phone: '254712345678',
        company: 'Test Company Ltd',
        subject: 'Coverage Test Inquiry',
        message: 'This is a real DB test submission for coverage.',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Contact form submitted successfully');
      expect(res.body.id).toBeDefined();

      // Verify the row exists in the DB.
      const [rows] = await db
        .promise()
        .query('SELECT name, email, subject, message FROM contact_forms WHERE email = ?', [
          TEST_CONTACT_EMAIL,
        ]);
      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('Route Test User');
      expect(rows[0].subject).toBe('Coverage Test Inquiry');
    });

    it('rejects a submission with missing required fields', async () => {
      const res = await request(app).post('/api/contact-forms').send({ name: 'No Email' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/users/register', () => {
    it('registers a new user', async () => {
      const res = await request(app).post('/api/users/register').send({
        email: TEST_EMAIL,
        password: 'password123',
        first_name: 'Coverage',
        last_name: 'Tester',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');

      // Verify the user row exists in the DB (password should be hashed).
      const [rows] = await db
        .promise()
        .query('SELECT email, first_name, last_name, password_hash FROM users WHERE email = ?', [
          TEST_EMAIL,
        ]);
      expect(rows.length).toBe(1);
      expect(rows[0].email).toBe(TEST_EMAIL);
      expect(rows[0].first_name).toBe('Coverage');
      expect(rows[0].password_hash).toBeDefined();
      expect(rows[0].password_hash.length).toBeGreaterThan(0);
    });

    it('rejects duplicate email registration', async () => {
      const res = await request(app).post('/api/users/register').send({
        email: TEST_EMAIL,
        password: 'password123',
        first_name: 'Duplicate',
        last_name: 'User',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects registration with invalid email', async () => {
      const res = await request(app).post('/api/users/register').send({
        email: 'not-an-email',
        password: 'password123',
        first_name: 'Bad',
        last_name: 'Email',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });
  });
});
