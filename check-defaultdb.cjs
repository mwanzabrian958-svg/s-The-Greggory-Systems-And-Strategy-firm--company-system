require('dotenv').config();
const m = require('mysql2/promise');

// Secrets come from env only — never hard-code credentials here.
const CLOUD = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 28067,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
};
(async () => {
  if (!process.env.DB_PASSWORD) { console.error('Set DB_PASSWORD in .env'); process.exit(1); }
  const db = await m.createConnection(CLOUD);
  const r = await db.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='defaultdb' AND TABLE_NAME='admin_settings'");
  console.log("defaultdb admin_settings exists:", r[0].length > 0);
  if (r[0].length > 0) {
    const c = await db.query("SELECT COUNT(*) c FROM admin_settings");
    console.log("rows:", c[0][0].c);
    const ddl = await db.query("SHOW CREATE TABLE admin_settings");
    console.log("DDL:", ddl[0][0]["Create Table"]);
  }
  await db.end();
})();