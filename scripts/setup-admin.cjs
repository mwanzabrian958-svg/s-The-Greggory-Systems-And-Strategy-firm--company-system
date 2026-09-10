const bcrypt = require('bcryptjs');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../backend/config/database');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function question(prompt) { return new Promise((resolve) => rl.question(prompt, resolve)); }

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = process.argv[i + 1];
      if (next && !next.startsWith('--')) { args[key] = next; i++; } else { args[key] = true; }
    }
  }
  return args;
}

async function listEmployees() {
  try {
    const [rows] = await db.promise().query(`SELECT e.id, e.employee_code, e.email, e.first_name, e.last_name, d.name as department, r.name as role_name, e.is_active FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN employee_roles r ON e.role_id = r.id WHERE e.deleted_at IS NULL ORDER BY e.id`);
    if (rows.length === 0) { console.log('\nNo employees found.\n'); return; }
    console.log('\nEmployees:');
    rows.forEach(e => console.log(`  ${e.employee_code} | ${e.first_name} ${e.last_name} | ${e.email} | ${e.role_name || '-'} | ${e.is_active ? 'Active' : 'Inactive'}`));
    console.log(`\nTotal: ${rows.length}\n`);
  } catch (err) { console.error('Error:', err.message); }
}

async function createEmployee({ email, password, first_name, last_name, role, department_id, employee_code }) {
  try {
    const [existing] = await db.promise().query('SELECT id FROM employees WHERE email = ? AND deleted_at IS NULL', [email]);
    if (existing.length > 0) { console.error(`Employee ${email} already exists.`); return null; }
    const password_hash = await bcrypt.hash(password, 12);
    let role_id = null;
    if (role) {
      const [roleRows] = await db.promise().query('SELECT id, department_id FROM employee_roles WHERE slug = ? AND is_active = TRUE', [role]);
      if (roleRows.length === 0) { console.error(`Role "${role}" not found.`); return null; }
      role_id = roleRows[0].id;
      if (!department_id) department_id = roleRows[0].department_id;
    }
    if (!employee_code) {
      const [count] = await db.promise().query('SELECT COUNT(*) as c FROM employees');
      employee_code = `EMP-${String(count[0].c + 1).padStart(3, '0')}`;
    }
    const [result] = await db.promise().query('INSERT INTO employees (employee_code, email, password_hash, first_name, last_name, display_name, department_id, role_id, primary_role, is_active, is_email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE)', [employee_code, email, password_hash, first_name, last_name, `${first_name} ${last_name}`, department_id, role_id, role && (role.includes('manager') || role.includes('admin')) ? 'manager' : 'employee']);
    console.log(`Created: ${employee_code} | ${email} | ID: ${result.insertId}`);
    return result.insertId;
  } catch (err) { console.error('Error:', err.message); return null; }
}

async function resetPassword({ email, password }) {
  try {
    const [existing] = await db.promise().query('SELECT id FROM employees WHERE email = ? AND deleted_at IS NULL', [email]);
    if (existing.length === 0) { console.error(`Employee ${email} not found.`); return false; }
    const password_hash = await bcrypt.hash(password, 12);
    await db.promise().query('UPDATE employees SET password_hash = ? WHERE id = ?', [password_hash, existing[0].id]);
    console.log(`Password reset for ${email}`);
    return true;
  } catch (err) { console.error('Error:', err.message); return false; }
}

async function interactiveMode() {
  console.log('\nEmployee Setup');
  console.log('1. Create  2. Reset Password  3. List  4. Exit');
  const action = await question('Choice: ');
  switch (action.trim()) {
    case '1': {
      const email = await question('Email: ');
      const password = await question('Password: ');
      const first_name = await question('First Name: ');
      const last_name = await question('Last Name: ');
      const [roles] = await db.promise().query('SELECT slug, name FROM employee_roles WHERE is_active = TRUE');
      roles.forEach(r => console.log(`  ${r.slug}: ${r.name}`));
      const role = await question('Role: ');
      await createEmployee({ email, password, first_name, last_name, role });
      break;
    }
    case '2': {
      const email = await question('Email: ');
      const password = await question('New Password: ');
      await resetPassword({ email, password });
      break;
    }
    case '3': await listEmployees(); break;
    case '4': default: break;
  }
}

async function main() {
  const args = parseArgs();
  try {
    if (args.list) await listEmployees();
    else if (args['reset-password'] && args.email && args.password) await resetPassword({ email: args.email, password: args.password });
    else if (args.email && args.password && args.first && args.last) await createEmployee({ email: args.email, password: args.password, first_name: args.first, last_name: args.last, role: args.role || null, department_id: args.department ? parseInt(args.department) : null, employee_code: args.code || null });
    else await interactiveMode();
  } catch (err) { console.error('Error:', err.message); }
  finally { rl.close(); process.exit(0); }
}

main();
