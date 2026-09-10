/**
 * VERIFY BOTH DATABASES
 * =====================
 * Checks that both databases (local + cloud) have all required tables
 * and shows how they're linked.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_NAME = process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main';

const REQUIRED_TABLES = [
  'images', 'departments', 'employee_roles', 'employees',
  'employee_sessions', 'employee_activity_log', 'employee_permissions',
  'employee_tasks', 'password_resets'
];

async function checkDatabase(label, config) {
  console.log(`\n📡 Checking ${label}...`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${DB_NAME}`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: DB_NAME,
      connectTimeout: 5000,
    });

    // Check tables
    const [tables] = await connection.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = ?
      ORDER BY table_name
    `, [DB_NAME]);

    const existingTables = tables.map(t => t.table_name);
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));
    const extraTables = existingTables.filter(t => !REQUIRED_TABLES.includes(t));

    console.log(`   ✅ Connected successfully`);
    console.log(`   📊 Tables found: ${existingTables.length}`);
    console.log(`   ✅ Required tables present: ${REQUIRED_TABLES.length - missingTables.length}/${REQUIRED_TABLES.length}`);

    if (missingTables.length > 0) {
      console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
    }
    if (extraTables.length > 0) {
      console.log(`   📋 Extra tables: ${extraTables.slice(0, 5).join(', ')}${extraTables.length > 5 ? '...' : ''}`);
    }

    // Check departments data
    if (existingTables.includes('departments')) {
      const [depts] = await connection.query('SELECT COUNT(*) as count FROM departments');
      console.log(`   🏢 Departments: ${depts[0].count} records`);
    }

    // Check employee_roles data
    if (existingTables.includes('employee_roles')) {
      const [roles] = await connection.query('SELECT COUNT(*) as count FROM employee_roles');
      console.log(`   👥 Employee roles: ${roles[0].count} records`);
    }

    // Check employees data
    if (existingTables.includes('employees')) {
      const [emps] = await connection.query('SELECT COUNT(*) as count FROM employees WHERE deleted_at IS NULL');
      console.log(`   👤 Employees: ${emps[0].count} records`);
    }

    // Check images table structure
    if (existingTables.includes('images')) {
      const [cols] = await connection.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position', [DB_NAME, 'images']);
      const hasBlob = cols.some(c => c.data_type === 'longblob');
      console.log(`   🖼️  Images table: ${cols.length} columns, BLOB support: ${hasBlob ? '✅' : '❌'}`);
    }

    return { connected: true, missingTables, existingTables };
  } catch (err) {
    console.log(`   ❌ Connection failed: ${err.message}`);
    return { connected: false, missingTables: REQUIRED_TABLES, existingTables: [] };
  } finally {
    if (connection) await connection.end();
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('DATABASE VERIFICATION');
  console.log('='.repeat(60));
  console.log(`Database Name: ${DB_NAME}`);

  // Local database (XAMPP)
  const localResult = await checkDatabase('LOCAL (XAMPP)', {
    host: process.env.DB_HOST_2 || '127.0.0.1',
    port: parseInt(process.env.DB_PORT_2 || '3306'),
    user: process.env.DB_USER_2 || 'root',
    password: process.env.DB_PASSWORD_2 || '',
  });

  // Cloud database (Aiven)
  const cloudResult = await checkDatabase('CLOUD (Aiven)', {
    host: process.env.DB_HOST || process.env.DB_CLOUD_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.DB_CLOUD_PORT || '3306'),
    user: process.env.DB_USER || process.env.DB_CLOUD_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_CLOUD_PASSWORD || '',
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Local DB: ${localResult.connected ? '✅ Connected' : '❌ Failed'} | Tables: ${localResult.existingTables.length}`);
  console.log(`Cloud DB: ${cloudResult.connected ? '✅ Connected' : '❌ Failed'} | Tables: ${cloudResult.existingTables.length}`);

  if (localResult.connected && cloudResult.connected) {
    const allLocal = localResult.missingTables.length === 0;
    const allCloud = cloudResult.missingTables.length === 0;
    if (allLocal && allCloud) {
      console.log('\n✅ Both databases are ready!');
    } else {
      console.log('\n⚠️  Some tables are missing. Run: mysql -u root -p < schema-personnel-auth.sql');
    }
  }

  console.log('\n📌 Database Linkage:');
  console.log('   - Both DBs share the same database name: ' + DB_NAME);
  console.log('   - mysql2 createPoolCluster connects to both');
  console.log('   - Failover: if one DB is down, the other takes over');
  console.log('   - Both must have identical table schemas');
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
