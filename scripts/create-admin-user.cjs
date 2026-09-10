const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

(async function () {
  console.log('\n============================================================');
  console.log('  Create Default Admin User');
  console.log('============================================================\n');

  // Check if .env exists
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('ERROR: .env file not found. Please create one first.');
    process.exit(1);
  }

  // Load .env
  require('dotenv').config({ path: envPath });

  const mysql = require('mysql2/promise');
  const bcryptjs = require('bcryptjs');

  async function createAdmin() {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@greggorysystems.com';
    const adminPassword = process.env.ADMIN_PASSWORD || require('crypto').randomBytes(16).toString('hex');

    try {
      // Check if admin user exists
      const [users] = await connection.query("SELECT * FROM admin_users WHERE email = ?", [adminEmail]);
      
      if (users.length > 0) {
        console.log('Admin user already exists!');
        console.log('\nAdmin Email:', adminEmail);
        return;
      }

      // Create admin user with correct table structure
      const passwordHash = await bcryptjs.hash(adminPassword, 12);
      
      await connection.query(
        "INSERT INTO admin_users (first_name, last_name, display_name, email, password_hash, admin_level, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())",
        ['System', 'Admin', 'System Admin', adminEmail, passwordHash, 'super_admin']
      );

      console.log('Default admin user created successfully!');
      console.log('\nAdmin Credentials:');
      console.log('  Email:', adminEmail);
      console.log('  Password:', adminPassword);
      console.log('\nIMPORTANT: Change this password after first login!');

    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      await connection.end();
    }
  }

  createAdmin();
})();
