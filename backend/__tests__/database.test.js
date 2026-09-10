const db = require('../config/database');

// These integration tests require a LIVE MySQL instance. They are only run
// when explicitly opted in — `RUN_DB_TESTS=1 npm test` — so the standard test
// run is deterministic in CI and on dev machines where MySQL may be down.
// (Previously they gated on "endpoints configured", but a configured-but-
// unreachable DB still caused 5s timeouts.)
const runDbTests = process.env.RUN_DB_TESTS === '1';
const describeDb = runDbTests ? describe : describe.skip;

describeDb('Database', () => {
  afterAll(async () => {
    await db.end();
  });

  it('connects successfully', async () => {
    const [rows] = await db.promise().query('SELECT 1 as val');
    expect(rows[0].val).toBe(1);
  }, 30000);

  it('health check query works', async () => {
    const [rows] = await db.promise().query('SELECT NOW() as now');
    expect(rows[0].now).toBeInstanceOf(Date);
  }, 30000);

  it('can query admin_users table', async () => {
    const [rows] = await db.promise().query('SELECT COUNT(*) as count FROM admin_users');
    expect(rows[0].count).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('can query users table', async () => {
    const [rows] = await db.promise().query('SELECT COUNT(*) as count FROM users');
    expect(rows[0].count).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('can query blog_articles table', async () => {
    const [rows] = await db.promise().query('SELECT COUNT(*) as count FROM blog_articles');
    expect(rows[0].count).toBeGreaterThanOrEqual(0);
  }, 30000);
});
