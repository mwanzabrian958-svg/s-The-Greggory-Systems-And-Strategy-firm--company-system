/**
 * Minimal SQL migration runner.
 *
 * Reads database/migrations/*.sql in filename order and applies each file that
 * has not been applied yet, tracking them in the `schema_migrations` table.
 *
 * Usage:
 *   node backend/migrate.js            # apply pending migrations
 *   node backend/migrate.js --status   # list applied/pending without applying
 */
const fs = require('fs');
const path = require('path');
const db = require('./config/database');

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'database', 'migrations');
const MIGRATION_TABLE = 'schema_migrations';

async function ensureTrackingTable() {
  await db.promise().query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function appliedSet() {
  const [rows] = await db.promise().query(`SELECT migration_name FROM ${MIGRATION_TABLE}`);
  return new Set(rows.map((row) => row.migration_name));
}

function migrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.toLowerCase().endsWith('.sql'))
    .sort();
}

const fileToName = (file) => file.replace(/\.sql$/i, '');

async function apply(file) {
  const name = fileToName(file);
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
  await db.promise().query(sql);
  await db.promise().query(`INSERT INTO ${MIGRATION_TABLE} (migration_name) VALUES (?)`, [name]);
  console.log(`[MIGRATE] applied: ${file}`);
}

async function main() {
  const statusOnly = process.argv.includes('--status');
  try {
    await ensureTrackingTable();
    const applied = await appliedSet();
    const files = migrationFiles();
    const pending = files.filter((file) => !applied.has(fileToName(file)));

    console.log(
      `[MIGRATE] ${applied.size} applied, ${pending.length} pending, ${files.length} total`,
    );
    if (pending.length === 0) return;

    if (statusOnly) {
      pending.forEach((file) => console.log(`  pending -> ${file}`));
      return;
    }

    for (const file of pending) {
      await apply(file);
    }
    console.log(`[MIGRATE] done: applied ${pending.length} migration(s)`);
  } catch (error) {
    console.error('[MIGRATE] FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await db.end();
    } catch (_) {
      /* ignore */
    }
  }
}

main();
