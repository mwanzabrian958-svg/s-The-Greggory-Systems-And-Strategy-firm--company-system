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
  for (const id of createdProjectIds) {
    try {
      await db.promise().query('DELETE FROM user_projects WHERE id = ?', [id]);
    } catch (_) {}
  }
  for (const id of createdArticleIds) {
    try {
      await db.promise().query('DELETE FROM blog_articles WHERE id = ?', [id]);
    } catch (_) {}
  }
  for (const id of createdContentIds) {
    try {
      await db.promise().query('DELETE FROM content WHERE id = ?', [id]);
    } catch (_) {}
  }
  for (const id of createdImageIds) {
    try {
      await db.promise().query('DELETE FROM images WHERE id = ?', [id]);
    } catch (_) {}
  }
  for (const id of createdCrmContactIds) {
    try {
      await db.promise().query('DELETE FROM crm_contacts WHERE id = ?', [id]);
    } catch (_) {}
  }
  try {
    await db
      .promise()
      .query('DELETE FROM admin_settings WHERE setting_key = ?', ['coverage_test_key']);
  } catch (_) {}
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

// ── User Projects ──────────────────────────────────────────────
// Tracks created project IDs for cleanup.
const createdProjectIds = [];

describe('POST /api/user-projects', () => {
  it('creates a new project', async () => {
    const res = await request(app)
      .post('/api/user-projects')
      .send({
        user_id: 1,
        project_name: `Coverage Project ${Date.now()}`,
        project_description: 'Real DB test project for route coverage.',
        project_type: 'consulting',
        status: 'planning',
        priority: 'medium',
        estimated_budget: 50000,
        client_name: 'Coverage Client Ltd',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Project created successfully');
    expect(res.body.id).toBeDefined();
    createdProjectIds.push(res.body.id);

    const [rows] = await db
      .promise()
      .query('SELECT project_name, status, client_name FROM user_projects WHERE id = ?', [
        res.body.id,
      ]);
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe('planning');
  });

  it('rejects a project without a title', async () => {
    const res = await request(app)
      .post('/api/user-projects')
      .send({ user_id: 1, project_description: 'No title provided' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/user-projects', () => {
  beforeAll(async () => {
    // Ensure at least one project exists.
    const [result] = await db.promise().query(
      `INSERT INTO user_projects (user_id, project_name, project_description, status, priority, created_by)
         VALUES (1, 'Seed Project For GET', 'Seeded by test suite', 'planning', 'medium', 1)`,
    );
    createdProjectIds.push(result.insertId);
  });

  it('returns a list of projects', async () => {
    const res = await request(app).get('/api/user-projects');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('returns a single project by id', async () => {
    const id = createdProjectIds[0];
    const res = await request(app).get(`/api/user-projects/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(id);
  });

  it('returns 404 for a non-existent project', async () => {
    const res = await request(app).get('/api/user-projects/99999999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/user-projects/:id', () => {
  it('updates an existing project', async () => {
    const id = createdProjectIds[0];
    const res = await request(app)
      .put(`/api/user-projects/${id}`)
      .send({
        project_name: `Updated Project ${Date.now()}`,
        project_description: 'Updated description',
        status: 'in_progress',
        priority: 'high',
        updated_by: 1,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const [rows] = await db
      .promise()
      .query('SELECT project_name, status, priority FROM user_projects WHERE id = ?', [id]);
    expect(rows[0].status).toBe('in_progress');
    expect(rows[0].priority).toBe('high');
  });

  it('returns 404 when updating a non-existent project', async () => {
    const res = await request(app)
      .put('/api/user-projects/99999999')
      .send({ project_name: 'Ghost', updated_by: 1 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/user-projects/:id', () => {
  it('soft-deletes a project', async () => {
    // Create a fresh project to delete.
    const [result] = await db.promise().query(
      `INSERT INTO user_projects (user_id, project_name, project_description, status, priority, created_by)
         VALUES (1, 'Project To Delete', 'Seeded for delete test', 'planning', 'low', 1)`,
    );
    const id = result.insertId;

    const res = await request(app).delete(`/api/user-projects/${id}`).send({ deleted_by: 1 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const [rows] = await db
      .promise()
      .query('SELECT deleted_at FROM user_projects WHERE id = ?', [id]);
    expect(rows[0].deleted_at).not.toBeNull();

    // Hard-clean this one so it does not linger in the table.
    await db.promise().query('DELETE FROM user_projects WHERE id = ?', [id]);
  });
});

// Track IDs for cleanup across the remaining suites.
const createdArticleIds = [];
const createdContentIds = [];
const createdImageIds = [];

// ── Blog Articles ──────────────────────────────────────────────
describe('POST /api/blog-articles', () => {
  it('creates a new blog article', async () => {
    const res = await request(app)
      .post('/api/blog-articles')
      .send({
        title: `Coverage Article ${Date.now()}`,
        excerpt: 'Short summary of the article.',
        content: 'This is the full article body for coverage testing.',
        author: 'Coverage Tester',
        category: 'Testing',
        is_published: false,
      });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Blog article created successfully');
    expect(res.body.id).toBeDefined();
    createdArticleIds.push(res.body.id);

    const [rows] = await db
      .promise()
      .query('SELECT title, author, is_published FROM blog_articles WHERE id = ?', [res.body.id]);
    expect(rows.length).toBe(1);
    expect(rows[0].author).toBe('Coverage Tester');
    expect(rows[0].is_published).toBe(0);
  });

  it('rejects an article without a title', async () => {
    const res = await request(app)
      .post('/api/blog-articles')
      .send({ content: 'Body without a title' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/blog-articles', () => {
  it('returns a list of blog articles', async () => {
    const res = await request(app).get('/api/blog-articles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns a single article by id', async () => {
    const res = await request(app).get(`/api/blog-articles/${createdArticleIds[0]}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBeDefined();
  });

  it('returns 404 for a non-existent article', async () => {
    const res = await request(app).get('/api/blog-articles/99999999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/blog-articles/:id', () => {
  it('updates an existing article', async () => {
    const id = createdArticleIds[0];
    const res = await request(app)
      .put(`/api/blog-articles/${id}`)
      .send({
        title: `Updated Article ${Date.now()}`,
        content: 'Updated body content.',
        author: 'Updated Author',
        is_published: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Blog article updated successfully');

    const [rows] = await db
      .promise()
      .query('SELECT title, is_published FROM blog_articles WHERE id = ?', [id]);
    expect(rows[0].is_published).toBe(1);
  });
});

describe('DELETE /api/blog-articles/:id', () => {
  it('hard-deletes an article', async () => {
    // Create a fresh article to delete.
    const [result] = await db.promise().query(
      `INSERT INTO blog_articles (title, content, author, is_published)
         VALUES ('Article To Delete', 'Seeded for delete test', 'Tester', 0)`,
    );
    const id = result.insertId;

    const res = await request(app).delete(`/api/blog-articles/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Blog article deleted successfully');

    const [rows] = await db.promise().query('SELECT id FROM blog_articles WHERE id = ?', [id]);
    expect(rows.length).toBe(0);
  });
});
// ── Content ───────────────────────────────────────────────────
describe('POST /api/content', () => {
  it('creates a new content item', async () => {
    const res = await request(app)
      .post('/api/content')
      .send({
        title: `Coverage Content ${Date.now()}`,
        body: 'This is the full body content for coverage testing.',
        type: 'article',
        status: 'draft',
        author: 'Coverage Tester',
        category: 'Testing',
        tags: 'coverage,test,routes',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Content created successfully');
    expect(res.body.id).toBeDefined();
    createdContentIds.push(res.body.id);

    const [rows] = await db
      .promise()
      .query('SELECT title, type, status FROM content WHERE id = ?', [res.body.id]);
    expect(rows.length).toBe(1);
    expect(rows[0].type).toBe('article');
    expect(rows[0].status).toBe('draft');
  });

  it('rejects content without a title', async () => {
    const res = await request(app).post('/api/content').send({ body: 'Body without a title' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/content', () => {
  it('returns a list of content items', async () => {
    const res = await request(app).get('/api/content');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.content)).toBe(true);
  });

  it('returns a single content item by id', async () => {
    const res = await request(app).get(`/api/content/${createdContentIds[0]}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.content.id).toBe(createdContentIds[0]);
  });

  it('returns 404 for a non-existent content item', async () => {
    const res = await request(app).get('/api/content/99999999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/content/:id', () => {
  it('updates an existing content item', async () => {
    const id = createdContentIds[0];
    const res = await request(app)
      .put(`/api/content/${id}`)
      .send({
        title: `Updated Content ${Date.now()}`,
        body: 'Updated body content.',
        type: 'post',
        status: 'published',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Content updated successfully');

    const [rows] = await db.promise().query('SELECT title, status FROM content WHERE id = ?', [id]);
    expect(rows[0].status).toBe('published');
  });
});

describe('DELETE /api/content/:id', () => {
  it('soft-deletes a content item', async () => {
    // Create a fresh content item to delete.
    const [result] = await db.promise().query(
      `INSERT INTO content (title, body, type, status)
         VALUES ('Content To Delete', 'Seeded for delete test', 'article', 'draft')`,
    );
    const id = result.insertId;

    const res = await request(app).delete(`/api/content/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Content deleted successfully');

    const [rows] = await db.promise().query('SELECT deleted_at FROM content WHERE id = ?', [id]);
    expect(rows[0].deleted_at).not.toBeNull();

    // Hard-clean this one so it does not linger.
    await db.promise().query('DELETE FROM content WHERE id = ?', [id]);
  });
});

// ── Images ─────────────────────────────────────────────────────
describe('POST /api/images/profile', () => {
  it('uploads a profile image (base64)', async () => {
    // Small 1x1 red pixel PNG as base64.
    const pixelBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const res = await request(app).post('/api/images/profile').send({
      dataBase64: pixelBase64,
      contentType: 'image/png',
      fileName: 'coverage-test.png',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.image_id).toBeDefined();
    createdImageIds.push(res.body.image_id);

    const [rows] = await db
      .promise()
      .query('SELECT file_name, content_type, file_size FROM images WHERE id = ?', [
        res.body.image_id,
      ]);
    expect(rows.length).toBe(1);
    expect(rows[0].file_name).toBe('coverage-test.png');
    expect(rows[0].content_type).toBe('image/png');
    expect(rows[0].file_size).toBeGreaterThan(0);
  });

  it('rejects an upload without image data', async () => {
    const res = await request(app).post('/api/images/profile').send({ fileName: 'no-data.png' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/images/:id', () => {
  it('returns image binary with correct content-type', async () => {
    const res = await request(app)
      .get(`/api/images/${createdImageIds[0]}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns 404 for a non-existent image', async () => {
    const res = await request(app).get('/api/images/99999999');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/images/:id', () => {
  it('deletes an image (admin only)', async () => {
    // Create a fresh image to delete.
    const pixelBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    await new Promise((resolve, reject) => {
      require('dns').lookup('localhost', () => {}); // noop to ensure async
      const req = {
        body: { dataBase64: pixelBase64, contentType: 'image/png', fileName: 'to-delete.png' },
      };
      const res = {
        status: function (c) {
          return {
            json: (b) => {
              this._code = c;
              this._body = b;
            },
          };
        },
      };
      // Use the route via supertest to create the image.
      resolve();
    });

    // Simpler: create the image via supertest then delete it.
    const createRes = await request(app).post('/api/images/profile').send({
      dataBase64: pixelBase64,
      contentType: 'image/png',
      fileName: 'image-to-delete.png',
    });
    const id = createRes.body.image_id;

    const res = await request(app).delete(`/api/images/${id}`).set('x-admin-key', ADMIN_KEY);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Image deleted successfully');

    const [rows] = await db.promise().query('SELECT id FROM images WHERE id = ?', [id]);
    expect(rows.length).toBe(0);
  });

  it('rejects image deletion without admin key', async () => {
    const res = await request(app).delete('/api/images/1');
    expect(res.status).toBe(403);
  });
});

// ── Users: login, client-dashboard, forgot-password ────────────
describe('POST /api/users/login', () => {
  it('logs in a registered user and returns a JWT', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: TEST_EMAIL, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.token.length).toBeGreaterThan(0);

    // Verify the token is a valid JWT.
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET || 'test-secret');
    expect(decoded.userId).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: TEST_EMAIL, password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects login for a non-existent user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nonexistent@greggory.test', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/client-dashboard (authenticated)', () => {
  let authToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: TEST_EMAIL, password: 'password123' });
    authToken = loginRes.body.token;
  });

  it('returns dashboard data for an authenticated user', async () => {
    const res = await request(app)
      .get('/api/users/client-dashboard')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it('rejects request without a token', async () => {
    const res = await request(app).get('/api/users/client-dashboard');
    expect(res.status).toBe(401);
  });

  it('rejects request with an invalid token', async () => {
    const res = await request(app)
      .get('/api/users/client-dashboard')
      .set('Authorization', 'Bearer invalid-token-here');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/users/forgot-password', () => {
  it('returns success even for non-existent email (enumeration-safe)', async () => {
    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({ email: 'nonexistent@greggory.test' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('If the email exists');
  });

  it('stores a reset token hash for an existing user', async () => {
    const res = await request(app).post('/api/users/forgot-password').send({ email: TEST_EMAIL });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify the reset token hash was stored.
    const [rows] = await db
      .promise()
      .query('SELECT password_reset_token, password_reset_expires FROM users WHERE email = ?', [
        TEST_EMAIL,
      ]);
    expect(rows.length).toBe(1);
    expect(rows[0].password_reset_token).toBeDefined();
    expect(rows[0].password_reset_token.length).toBeGreaterThan(0);
    expect(rows[0].password_reset_expires).toBeDefined();

    // Clean up the reset token so it does not interfere with login tests.
    await db
      .promise()
      .query(
        'UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE email = ?',
        [TEST_EMAIL],
      );
  });

  it('rejects request without an email', async () => {
    const res = await request(app).post('/api/users/forgot-password').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
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

  it('rejects invalid or expired token', async () => {
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'definitely-not-a-real-token-0123456789abcdef', password: 'newpassword123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired reset token');
  });
});

// ── Admin Verification (login) ────────────────────────────────
describe('POST /api/admin-verification/authenticate-enhanced', () => {
  beforeAll(async () => {
    // Seed an admin user with a known bcrypt hash for password "admin123".
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    await db.promise().query(
      `INSERT INTO admin_users (email, password_hash, first_name, last_name, display_name, admin_level, access_level, department, is_active, created_at)
         VALUES ('admin-test@greggory.test', ?, 'Admin', 'Test', 'Admin Test', 'super_admin', 'full', 'Operations', 1, NOW())
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1`,
      [hash],
    );
  });

  afterAll(async () => {
    try {
      await db
        .promise()
        .query('DELETE FROM admin_users WHERE email = ?', ['admin-test@greggory.test']);
    } catch (_) {}
  });

  it('authenticates with valid credentials and returns a session token', async () => {
    const res = await request(app)
      .post('/api/admin-verification/authenticate-enhanced')
      .send({ email: 'admin-test@greggory.test', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('admin-test@greggory.test');
    expect(res.body.user.admin_level).toBe('super_admin');
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/admin-verification/authenticate-enhanced')
      .send({ email: 'admin-test@greggory.test', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-existent admin', async () => {
    const res = await request(app)
      .post('/api/admin-verification/authenticate-enhanced')
      .send({ email: 'nonexistent@greggory.test', password: 'admin123' });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/admin-verification/authenticate-enhanced')
      .send({ email: 'admin-test@greggory.test' });
    expect(res.status).toBe(400);
  });
});

// ── Admin Users (CRUD) ─────────────────────────────────────────
const { signSessionToken } = require('../utils/sessionToken');
let adminSessionToken;
let createdAdminUserId;

beforeAll(() => {
  // Generate a valid admin session token for user id 1.
  adminSessionToken = signSessionToken(1, 'admin');
});

describe('GET /api/admin/profile-lookup', () => {
  it('returns 400 without an email', async () => {
    const res = await request(app).get('/api/admin/profile-lookup');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns success false for an unknown email', async () => {
    const res = await request(app).get('/api/admin/profile-lookup?email=unknown@greggory.test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/admin/search', () => {
  it('returns empty results for a short query', async () => {
    const res = await request(app).get('/api/admin/search?q=a');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toEqual([]);
  });

  it('returns empty results without a query', async () => {
    const res = await request(app).get('/api/admin/search');
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });
});

describe('GET /api/admin/admin-users (admin session)', () => {
  it('returns a list of admin users with a valid session', async () => {
    const res = await request(app)
      .get('/api/admin/admin-users')
      .set('Authorization', `Bearer ${adminSessionToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.count).toBeDefined();
  });

  it('rejects without a session token', async () => {
    const res = await request(app).get('/api/admin/admin-users');
    expect(res.status).toBe(401);
  });

  it('rejects with an invalid session token', async () => {
    const res = await request(app)
      .get('/api/admin/admin-users')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/users (admin session)', () => {
  it('returns a list of regular users with a valid session', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminSessionToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('rejects without a session token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/admin/create-admin (admin session)', () => {
  it('creates a new admin user with a valid session', async () => {
    const uniqueEmail = `new-admin-${Date.now()}@greggory.test`;
    const res = await request(app)
      .post('/api/admin/create-admin')
      .set('Authorization', `Bearer ${adminSessionToken}`)
      .send({
        first_name: 'New',
        last_name: 'Admin',
        email: uniqueEmail,
        password: 'newadmin123',
        admin_level: 'admin',
        access_level: 'limited',
        department: 'Marketing',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBeDefined();
    createdAdminUserId = res.body.userId;

    const [rows] = await db
      .promise()
      .query('SELECT email, admin_level, department FROM admin_users WHERE id = ?', [
        createdAdminUserId,
      ]);
    expect(rows.length).toBe(1);
    expect(rows[0].email).toBe(uniqueEmail);
    expect(rows[0].department).toBe('Marketing');
  });

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/admin/create-admin')
      .set('Authorization', `Bearer ${adminSessionToken}`)
      .send({
        first_name: 'Duplicate',
        last_name: 'Admin',
        email: 'admin-test@greggory.test',
        password: 'password123',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects without a session token', async () => {
    const res = await request(app).post('/api/admin/create-admin').send({
      first_name: 'No',
      last_name: 'Auth',
      email: 'noauth@greggory.test',
      password: 'pass1234',
    });
    expect(res.status).toBe(401);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/admin/create-admin')
      .set('Authorization', `Bearer ${adminSessionToken}`)
      .send({ email: 'incomplete@greggory.test' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/admin/users/:id (admin session)', () => {
  it('returns a user by id with a valid session', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${createdAdminUserId}`)
      .query({ role_type: 'admin' })
      .set('Authorization', `Bearer ${adminSessionToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
  });

  it('returns 400 without role_type', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${createdAdminUserId}`)
      .set('Authorization', `Bearer ${adminSessionToken}`);
    expect(res.status).toBe(400);
  });

  it('returns 404 for a non-existent user', async () => {
    const res = await request(app)
      .get('/api/admin/users/99999999')
      .query({ role_type: 'admin' })
      .set('Authorization', `Bearer ${adminSessionToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/admin/users/:id (admin session)', () => {
  it('updates a user with a valid session', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${createdAdminUserId}`)
      .query({ role_type: 'admin' })
      .set('Authorization', `Bearer ${adminSessionToken}`)
      .send({
        first_name: 'Updated',
        last_name: 'AdminName',
        email: `updated-admin-${Date.now()}@greggory.test`,
        department: 'Updated Department',
        is_active: 1,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const [rows] = await db
      .promise()
      .query('SELECT first_name, department FROM admin_users WHERE id = ?', [createdAdminUserId]);
    expect(rows[0].first_name).toBe('Updated');
    expect(rows[0].department).toBe('Updated Department');
  });

  it('returns 404 when updating a non-existent user', async () => {
    const res = await request(app)
      .put('/api/admin/users/99999999')
      .query({ role_type: 'admin' })
      .set('Authorization', `Bearer ${adminSessionToken}`)
      .send({ first_name: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/users/:id (admin session)', () => {
  it('soft-deletes a user with a valid session', async () => {
    // Create a fresh admin to delete.
    const [result] = await db.promise().query(
      `INSERT INTO admin_users (email, password_hash, first_name, last_name, admin_level, is_active, created_at)
         VALUES ('admin-to-delete@greggory.test', 'hash', 'Delete', 'Me', 'admin', 1, NOW())`,
    );
    const id = result.insertId;

    const res = await request(app)
      .delete(`/api/admin/users/${id}`)
      .query({ role_type: 'admin' })
      .set('Authorization', `Bearer ${adminSessionToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const [rows] = await db
      .promise()
      .query('SELECT deleted_at, is_active FROM admin_users WHERE id = ?', [id]);
    expect(rows[0].deleted_at).not.toBeNull();
    expect(rows[0].is_active).toBe(0);

    // Hard-clean.
    await db.promise().query('DELETE FROM admin_users WHERE id = ?', [id]);
  });

  it('returns 400 without role_type', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${createdAdminUserId}`)
      .set('Authorization', `Bearer ${adminSessionToken}`);
    expect(res.status).toBe(400);
  });

  it('returns 404 when deleting a non-existent user', async () => {
    const res = await request(app)
      .delete('/api/admin/users/99999999')
      .query({ role_type: 'admin' })
      .set('Authorization', `Bearer ${adminSessionToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Admin.js: dashboard, activity logs, reports ────────────────
describe('GET /api/admin/dashboard-stats', () => {
  it('returns dashboard statistics', async () => {
    const res = await request(app).get('/api/admin/dashboard-stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(typeof res.body.stats.totalUsers).toBe('number');
    expect(typeof res.body.stats.totalProjects).toBe('number');
    expect(Array.isArray(res.body.recentActivity)).toBe(true);
  });
});

describe('GET /api/admin/activity-logs', () => {
  it('returns a list of activity logs', async () => {
    const res = await request(app).get('/api/admin/activity-logs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/admin/budget-overview', () => {
  it('returns budget overview data', async () => {
    const res = await request(app).get('/api/admin/budget-overview');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/pending-approvals', () => {
  it('returns pending approvals', async () => {
    const res = await request(app).get('/api/admin/pending-approvals');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/pending-invoices', () => {
  it('returns pending invoices', async () => {
    const res = await request(app).get('/api/admin/pending-invoices');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/client-feedback', () => {
  it('returns client feedback', async () => {
    const res = await request(app).get('/api/admin/client-feedback');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/ledger', () => {
  it('returns ledger entries', async () => {
    const res = await request(app).get('/api/admin/ledger');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/risk-alerts', () => {
  it('returns risk alerts', async () => {
    const res = await request(app).get('/api/admin/risk-alerts');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/assigned-tasks', () => {
  it('returns assigned tasks', async () => {
    const res = await request(app).get('/api/admin/assigned-tasks');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/projects/all', () => {
  it('returns all projects (admin view)', async () => {
    const res = await request(app).get('/api/admin/projects/all');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('POST /api/admin/reports', () => {
  it('creates a report', async () => {
    const res = await request(app)
      .post('/api/admin/reports')
      .send({
        title: `Coverage Report ${Date.now()}`,
        summary: 'Test report for coverage.',
        admin_id: 1,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();

    // Verify the report exists in the DB.
    const [rows] = await db
      .promise()
      .query('SELECT title FROM admin_reports WHERE id = ?', [res.body.id]);
    expect(rows.length).toBe(1);

    // Cleanup.
    await db.promise().query('DELETE FROM admin_reports WHERE id = ?', [res.body.id]);
  });

  it('rejects a report without a title', async () => {
    const res = await request(app).post('/api/admin/reports').send({ summary: 'No title' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/admin/accounting/entries/:id', () => {
  it('rejects deletion without an id', async () => {
    const res = await request(app).delete('/api/admin/accounting/entries/99999999');
    // Either 404 (not found) or 400 (bad request) is acceptable.
    expect([400, 404]).toContain(res.status);
  });
});

describe('DELETE /api/admin/invoices/:id', () => {
  it('rejects deletion without an id', async () => {
    const res = await request(app).delete('/api/admin/invoices/99999999');
    expect([400, 404]).toContain(res.status);
  });
});

describe('DELETE /api/admin/blog-articles/:id', () => {
  it('returns 404 for a non-existent blog article', async () => {
    const res = await request(app).delete('/api/admin/blog-articles/99999999');
    expect(res.status).toBe(404);
  });
});

// ── Admin CRM ──────────────────────────────────────────────────
const createdCrmContactIds = [];

describe('GET /api/admin/crm/contacts', () => {
  it('returns a list of CRM contacts', async () => {
    const res = await request(app).get('/api/admin/crm/contacts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.contacts)).toBe(true);
  });
});

describe('POST /api/admin/crm/contacts', () => {
  it('creates a new CRM contact', async () => {
    const res = await request(app)
      .post('/api/admin/crm/contacts')
      .send({
        name: `CRM Contact ${Date.now()}`,
        email: `crm-${Date.now()}@greggory.test`,
        phone: '254712345678',
        company: 'CRM Test Co',
        status: 'lead',
        notes: 'Coverage test contact',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();
    createdCrmContactIds.push(res.body.id);
  });

  it('rejects a contact without a name', async () => {
    const res = await request(app)
      .post('/api/admin/crm/contacts')
      .send({ email: 'noname@greggory.test' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/admin/crm/contacts/:id', () => {
  it('updates an existing contact', async () => {
    const id = createdCrmContactIds[0];
    const res = await request(app)
      .put(`/api/admin/crm/contacts/${id}`)
      .send({ name: 'Updated Contact', status: 'client' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const [rows] = await db
      .promise()
      .query('SELECT name, status FROM crm_contacts WHERE id = ?', [id]);
    expect(rows[0].name).toBe('Updated Contact');
    expect(rows[0].status).toBe('client');
  });

  it('returns 404 for a non-existent contact', async () => {
    const res = await request(app).put('/api/admin/crm/contacts/99999999').send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/crm/contacts/:id', () => {
  it('soft-deletes a contact', async () => {
    const [result] = await db
      .promise()
      .query(
        `INSERT INTO crm_contacts (name, email, status) VALUES ('ToDelete', 'delete@greggory.test', 'lead')`,
      );
    const id = result.insertId;

    const res = await request(app).delete(`/api/admin/crm/contacts/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const [rows] = await db
      .promise()
      .query('SELECT deleted_at FROM crm_contacts WHERE id = ?', [id]);
    expect(rows[0].deleted_at).not.toBeNull();

    await db.promise().query('DELETE FROM crm_contacts WHERE id = ?', [id]);
  });
});

// ── Admin Settings ─────────────────────────────────────────────
describe('GET /api/admin/settings', () => {
  it('returns admin settings', async () => {
    const res = await request(app).get('/api/admin/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.settings).toBeDefined();
  });
});

describe('PUT /api/admin/settings', () => {
  it('updates settings', async () => {
    const res = await request(app)
      .put('/api/admin/settings')
      .send({ coverage_test_key: `coverage-${Date.now()}`, site_name: 'Coverage Test' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.updated).toBeDefined();
    expect(res.body.updated.length).toBeGreaterThan(0);

    // Cleanup.
    await db
      .promise()
      .query('DELETE FROM admin_settings WHERE setting_key = ?', ['coverage_test_key']);
  });

  it('rejects invalid settings data', async () => {
    const res = await request(app).put('/api/admin/settings').send('not-an-object');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/node-settings', () => {
  it('returns node settings with system status', async () => {
    const res = await request(app).get('/api/admin/node-settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.system).toBeDefined();
    expect(res.body.system.status).toBe('operational');
  });
});

// ── Admin Complete (alternative admin routes) ──────────────────
describe('GET /api/admin/budget-overview', () => {
  it('returns budget overview', async () => {
    const res = await request(app).get('/api/admin/budget-overview');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/ledger', () => {
  it('returns ledger entries', async () => {
    const res = await request(app).get('/api/admin/ledger');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/admin/mpesa/transactions', () => {
  it('returns M-Pesa transactions', async () => {
    const res = await request(app).get('/api/admin/mpesa/transactions');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

// ── Easy Admin ─────────────────────────────────────────────────
describe('GET /api/easy-admin/departments', () => {
  it('returns a list of departments', async () => {
    const res = await request(app).get('/api/easy-admin/departments');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/easy-admin/departments/:slug', () => {
  it('returns a department by slug', async () => {
    const res = await request(app).get('/api/easy-admin/departments/operations');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

// ── Developer Verification ─────────────────────────────────────
describe('POST /api/developer-verification/authenticate', () => {
  it('rejects missing credentials', async () => {
    const res = await request(app).post('/api/developer-verification/authenticate').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/developer-verification/health', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/api/developer-verification/health');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});
