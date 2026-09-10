const { execSync } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const PORTS = { frontend: 5173, backend: 3001 };

function log(tag, msg) { console.log('[' + tag + '] ' + msg); }

function portOpen(port) {
  return new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1');
    s.on('connect', () => { s.destroy(); resolve(true); });
    s.on('error', () => resolve(false));
  });
}

function clearPort(port, name) {
  try {
    const out = execSync('netstat -ano | findstr ":' + port + ' "', { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      const p = line.trim().split(/\s+/);
      if (p.length >= 5 && p[1].endsWith(':' + port) && p[3] === 'LISTENING') pids.add(p[4]);
    }
    pids.forEach(pid => {
      try { execSync('taskkill /PID ' + pid + ' /F /T', { stdio: 'ignore' }); log('ports', 'cleared ' + name + ' pid ' + pid); } catch (e) {}
    });
  } catch (e) {}
}

(async function () {
  console.log('\n============================================================');
  console.log('  GSS Dev Launcher');
  console.log('============================================================\n');

  // Clear stale ports
  log('ports', 'Clearing stale listeners...');
  clearPort(PORTS.backend, 'backend');
  clearPort(PORTS.frontend, 'frontend');

  // Start XAMPP
  const xamppUp = await portOpen(80);
  if (!xamppUp) {
    log('xampp', 'Starting XAMPP...');
    const starter = 'C:\\xampp\\xampp_start.exe';
    if (fs.existsSync(starter)) {
      try { execSync('"' + starter + '"', { stdio: 'ignore' }); } catch (e) {}
    }
  } else {
    log('xampp', 'XAMPP already running');
  }

  // Start backend
  log('backend', 'Starting backend API (:3001)...');
  const backendCmd = 'start "GSS Backend" cmd /k "cd /d "' + ROOT + '" && node server.js"';
  try { execSync(backendCmd, { stdio: 'ignore' }); } catch (e) {}

  // Start frontend
  log('frontend', 'Starting frontend (:5173)...');
  const frontendCmd = 'start "GSS Frontend" cmd /k "cd /d "' + ROOT + '" && npm run vite"';
  try { execSync(frontendCmd, { stdio: 'ignore' }); } catch (e) {}

  // Wait for servers to start
  log('browser', 'Waiting 8s for servers to start...');
  setTimeout(() => {
    log('browser', 'Opening browser tabs...');
    const tabs = [
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3001/api/health',
      'http://127.0.0.1/phpmyadmin'
    ];
    tabs.forEach(u => {
      try { execSync('start "" "' + u + '"', { stdio: 'ignore' }); log('browser', 'Opened: ' + u); } catch (e) {}
    });
    console.log('\n============================================================');
    console.log('  All services started');
    console.log('============================================================');
    console.log('  Frontend:   http://127.0.0.1:5173');
    console.log('  Backend:    http://127.0.0.1:3001/api/health');
    console.log('  phpMyAdmin: http://127.0.0.1/phpmyadmin');
    console.log('============================================================\n');
  }, 8000);
})();
