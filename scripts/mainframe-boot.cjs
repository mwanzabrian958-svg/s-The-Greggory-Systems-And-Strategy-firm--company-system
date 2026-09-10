/**
 * GSS VIRTUAL MAINFRAME BOOT
 * ===========================
 * Boots the virtual mainframe network on this PC:
 *   1. XAMPP (Apache + MySQL local node)
 *   2. Backend API (server.js on :3001) — cloud + local DB nodes
 *   3. Frontend (Vite on :5173)
  *   4. Opens ALL frontend worker node pages + backend health + phpMyAdmin
 */

const { execSync } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const PORTS = {
  frontend: 5173,      // Landing/Dashboard/Home
  backend: 3001,       // API
  admin: 5174,         // Admin panel (/admin)
  departments: 5175,   // Departments section (/departments)
  employees: 5176       // Employee workstations (/admin/employees)
};
const ALL_FRONTEND_PORTS = [PORTS.frontend, PORTS.admin, PORTS.departments, PORTS.employees];

function log(tag, msg) { console.log('[' + tag + '] ' + msg); }

function portOpen(port) {
  return new Promise(function (resolve) {
    const s = net.connect(port, '127.0.0.1');
    s.on('connect', function () { s.destroy(); resolve(true); });
    s.on('error', function () { resolve(false); });
  });
}

function clearPort(port, name) {
  try {
    const out = execSync('netstat -ano | findstr ":PORT "' .replace('PORT', port), { encoding: 'utf8' });
    const pids = new Set();
    for (let i = 0; i < out.split('\n').length; i++) {
      const line = out.split('\n')[i];
      const p = line.trim().split(/\s+/);
      if (p.length >= 5 && p[1].endsWith(':' + port) && p[3] === 'LISTENING') pids.add(p[4]);
    }
    pids.forEach(pid => { try { execSync('taskkill /PID ' + pid + ' /F /T', { stdio: 'ignore' }); log('ports', 'cleared ' + name + ' pid ' + pid); } catch (e) {} });
  } catch (e) {}
}

(async function () {
  console.log('\n' + '='.repeat(60));
  console.log('  GSS VIRTUAL MAINFRAME — BOOT SEQUENCE');
  console.log('='.repeat(60) + '\n');

  log('boot', 'Virtual mainframe network initializing...');
  log('nodes', '1. Database nodes (Cloud Aiven + Local XAMPP)');
  log('nodes', '2. Backend API node (:3001)');
  log('nodes', '3. Frontend app node (:5173)');
  log('nodes', '4. Employee workstation nodes (N per role)');
  console.log('');
  // Clear stale ports
  log('ports', 'Clearing stale listeners...');
  clearPort(PORTS.backend, 'backend');
  ALL_FRONTEND_PORTS.forEach(port => clearPort(port, 'frontend-' + port));

  // Start XAMPP local DB node
  const xampp = 'C:\\xampp';
  await portOpen(80).then(up => {
    if (!up) {
      log('xampp', 'Starting local MySQL/Apache node...');
      const starter = path.join(xampp, 'xampp_start.exe');
      if (fs.existsSync(starter)) { try { execSync('""' + starter + '""', { stdio: 'ignore' }); } catch (e) {} }
    } else {
      log('xampp', 'Local node already running');
    }
  });

  // Start backend API node (cloud + local DB failover)
  log('backend', 'Starting backend API node (multi-DB failover)...');
  try { execSync('start "GSS Backend Node" cmd /k "cd /d \\"' + ROOT + '\\" && node server.js"', { stdio: 'ignore' }); } catch (e) {}

  // Start frontend main node (:5173 - Landing/Dashboard)
  log('frontend', 'Starting frontend MAIN node (:5173 - Landing/Dashboard)...');
  try { execSync('start "GSS Frontend MAIN" cmd /k "cd /d \\"' + ROOT + '\\" && set PORT=5173 && npm run vite"', { stdio: 'ignore' }); } catch (e) {}

  // Start frontend admin node (:5174 - Admin panel)
  log('frontend', 'Starting frontend ADMIN node (:5174 - Admin panel)...');
  try { execSync('start "GSS Frontend ADMIN" cmd /k "cd /d \\"' + ROOT + '\\" && set PORT=5174 && npm run vite"', { stdio: 'ignore' }); } catch (e) {}

  // Start frontend departments node (:5175 - Department views)
  log('frontend', 'Starting frontend DEPARTMENTS node (:5175 - Public views)...');
  try { execSync('start "GSS Frontend DEPT" cmd /k "cd /d \\"' + ROOT + '\\" && set PORT=5175 && npm run vite"', { stdio: 'ignore' }); } catch (e) {}

  // Start frontend employees node (:5176 - Employee workstations)
  log('frontend', 'Starting frontend EMPLOYEES node (:5176 - Workstations)...');
  try { execSync('start "GSS Frontend EMPLOYEE" cmd /k "cd /d \\"' + ROOT + '\\" && set PORT=5176 && npm run vite"', { stdio: 'ignore' }); } catch (e) {}

  // Open ALL frontend worker node pages + backend health + phpMyAdmin 
  log('browser', 'Waiting for nodes to come online...');
  setTimeout(function () {
    const tabs = [
      'http://127.0.0.1:' + PORTS.frontend,                            // Landing Page (:5173)
      'http://127.0.0.1:' + PORTS.frontend + '/dashboard',            // Home Dashboard (:5173)
      'http://127.0.0.1:' + PORTS.admin,                              // Admin Panel (:5174)
      'http://127.0.0.1:' + PORTS.departments,                        // Departments Hub (:5175)
      'http://127.0.0.1:' + PORTS.employees,                          // Employee Workstations (:5176)
      'http://127.0.0.1:' + PORTS.backend + '/api/health',            // Backend health node
      'http://127.0.0.1:' + PORTS.backend + '/api/network',           // Mainframe network status
      'http://127.0.0.1:' + PORTS.backend + '/api/employees',         // Employee workstation nodes
      'http://127.0.0.1:' + PORTS.backend + '/api/departments',       // Departments
      'http://127.0.0.1:' + PORTS.backend + '/api/roles',             // Roles
    ];

    // Add frontend worker node pages for each department (on departments port :5175)
    const fallbackDepts = [
      'finance-legal', 'human-resources', 'information-technology',
      'marketing', 'operations', 'strategic-planning',
      'business-development', 'quality-assurance', 'legal-affairs',
      'compliance', 'corporate-communications', 'executive-office',
      'special-projects'
    ];
    fallbackDepts.forEach(slug => tabs.push('http://127.0.0.1:' + PORTS.departments + '/admin/departments/' + slug));

    // Add phpMyAdmin local DB node
    tabs.push('http://127.0.0.1/phpmyadmin');
    tabs.forEach(u => { try { execSync('start "" "' + u + '"', { stdio: 'ignore' }); log('open', u); } catch (e) {} });
    console.log('\n' + '='.repeat(60));
    console.log('  VIRTUAL MAINFRAME ONLINE');
    console.log('='.repeat(60));
    console.log('  Browser Tabs Opened:');
    console.log('    1. Landing Page (:5173)');
    console.log('    2. Dashboard (Web Master + 13 Departments)');
    console.log('    3. Admin Panel (:5174)');
    console.log('    4. Departments Hub (:5175)');
    console.log('    5. Employee Workstations (:5176)');
    console.log('    6. 13 Department Worker Node Pages (:5175)');
    console.log('    7. Backend Health Node (API :3001)');
    console.log('    8. Network Status Node (API)');
    console.log('    9. Employee Workstation Nodes (API)');
    console.log('    10. Roles API');
    console.log('    11. phpMyAdmin Local DB Node');
    console.log('  Close the command windows to shut down.\n');
  }, 9000);
})();