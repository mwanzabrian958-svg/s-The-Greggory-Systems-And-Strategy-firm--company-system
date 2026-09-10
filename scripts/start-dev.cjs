// Full-stack dev launcher for The Greggory Systems platform.
// Starts backend + frontend each in their OWN visible window (so errors are seen),
// ensures XAMPP is up, then opens all three in the browser.
const { execSync } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const XAMPP = 'C:\\xampp';
const PORTS = { frontend: 5173, backend: 3001 };

function log(tag, msg) { console.log('[' + tag + '] ' + msg); }

function portOpen(port) {
  return new Promise(function (resolve) {
    var s = net.connect(port, '127.0.0.1');
    s.on('connect', function () { s.destroy(); resolve(true); });
    s.on('error', function () { resolve(false); });
  });
}

(function () {
  console.log('\n========================================');
  log('boot', 'The Greggory Systems Platform - Dev Launcher');
  console.log('========================================\n');

  log('ports', 'clearing stale listeners...');
  for (var name in PORTS) {
    var port = PORTS[name];
    try {
      var out = execSync('netstat -ano | findstr ":' + port + ' "', { encoding: 'utf8' });
      var pids = new Set();
      for (var i = 0; i < out.split('\n').length; i++) {
        var line = out.split('\n')[i];
        var p = line.trim().split(/\s+/);
        if (p.length >= 5 && p[1].endsWith(':' + port) && p[3] === 'LISTENING') pids.add(p[4]);
      }
      pids.forEach(function (pid) {
        try { execSync('taskkill /PID ' + pid + ' /F /T', { stdio: 'ignore' }); log('ports', 'cleared ' + name + ' pid ' + pid); } catch (e) {}
      });
    } catch (e) {}
  }

  portOpen(80).then(function (up) {
    if (!up) {
      log('xampp', 'starting Apache + MySQL...');
      var starter = path.join(XAMPP, 'xampp_start.exe');
      if (fs.existsSync(starter)) {
        execSync('""' + starter + '""', { stdio: 'ignore' });
      }
    } else {
      log('xampp', 'Apache (:80) already running');
    }
  });

  log('backend', 'opening backend window (node server.js)...');
  execSync('start "GSS Backend API" cmd /k "cd /d \"' + ROOT + '\" && node server.js"', { stdio: 'ignore' });

  log('frontend', 'opening frontend window (npm run vite)...');
  execSync('start "GSS Frontend" cmd /k "cd /d \"' + ROOT + '\" && npm run vite"', { stdio: 'ignore' });

  log('browser', 'waiting 8s for servers to start...');
  setTimeout(function () {
    log('browser', 'opening tabs (mainframe stack)...');
    var tabs = [
      'http://127.0.0.1:' + PORTS.frontend,                            // Home / Landing
      'http://127.0.0.1:' + PORTS.frontend + '/dashboard',            // Home (Web Master + 13 dept tiles)
      'http://127.0.0.1:' + PORTS.backend + '/api/health',            // Health check node
      'http://127.0.0.1:' + PORTS.backend + '/api/network',           // Mainframe network status
      'http://127.0.0.1:' + PORTS.backend + '/api/employees',         // Employee workstation nodes
      'http://127.0.0.1:' + PORTS.backend + '/api/departments',       // Departments
      'http://127.0.0.1:' + PORTS.backend + '/api/roles',             // Roles
      'http://127.0.0.1/phpmyadmin',                                  // Local DB node
    ];
    tabs.forEach(function (u) {
      try { execSync('start "" "' + u + '"', { stdio: 'ignore' }); log('browser', u); } catch (e) {}
    });
    console.log('\n[done] Virtual mainframe stack opened (frontend, home, + all API nodes).');
    console.log('[done] Close the backend/frontend command windows to stop the servers.\n');
  }, 8000);
})();