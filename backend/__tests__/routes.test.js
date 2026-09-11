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
  // Clean up user_projects created during tests.
  for (const id of createdProjectIds) {
    try {
      await db.promise().query('DELETE FROM user_projects WHERE id = ?', [id]);
    } catch (_) {}
  }
  // Clean up blog_articles created during tests.
  for (const id of createdArticleIds) {
    try {
      await db.promise().query('DELETE FROM blog_articles WHERE id = ?', [id]);
    } catch (_) {}
  }
  // Clean up content created during tests.
  for (const id of createdContentIds) {
    try {
      await db.promise().query('DELETE FROM content WHERE id = ?', [id]);
    } catch (_) {}
  }
  // Clean up images created during tests.
  for (const id of createdImageIds) {
    try {
      await db.promise().query('DELETE FROM images WHERE id = ?', [id]);
    } catch (_) {}
  }
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
