const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let issues = 0;

function log(msg) { console.log(msg); }
function ok(msg) { log(`${GREEN}✓${RESET} ${msg}`); }
function err(msg) { log(`${RED}✗${RESET} ${msg}`); issues++; }
function warn(msg) { log(`${YELLOW}⚠${RESET} ${msg}`); }
function info(msg) { log(`  ${msg}`); }

function extractEndpoints(filePath, method) {
  const content = fs.readFileSync(filePath, 'utf8');
  const endpoints = [];
  const lines = content.split('\n');
  const prefix = `app.${method}('`;
  const prefix2 = `app.${method}("`;
  lines.forEach(line => {
    let idx = line.indexOf(prefix);
    if (idx === -1) idx = line.indexOf(prefix2);
    if (idx !== -1) {
      const start = idx + prefix.length;
      const end = line.indexOf("'", start);
      const end2 = line.indexOf('"', start);
      const finalEnd = end === -1 ? end2 : (end2 === -1 ? end : Math.min(end, end2));
      if (finalEnd !== -1) endpoints.push({ path: line.substring(start, finalEnd), method: method.toUpperCase() });
    }
  });
  return endpoints;
}

function extractApiCalls(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const endpoints = [];
  const regex = /apiCall\(['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!match[1].startsWith('http') && !match[1].includes('${')) endpoints.push(match[1]);
  }
  return [...new Set(endpoints)];
}

function matchesPattern(endpoint, pattern) {
  const regexStr = pattern.replace(/:[^/]+/g, '[^/]+').replace(/\*/g, '.*');
  return new RegExp(`^${regexStr}$`).test(endpoint);
}

function main() {
  const root = path.join(__dirname, '..');

  log(`\n${BOLD}═══════════════════════════════════════════════════════════════${RESET}`);
  log(`${BOLD}  ENDPOINT VERIFICATION${RESET}`);
  log(`${BOLD}═══════════════════════════════════════════════════════════════${RESET}\n`);

  // Extract backend endpoints
  const serverEndpoints = [
    ...extractEndpoints(path.join(root, 'server.js'), 'get'),
    ...extractEndpoints(path.join(root, 'server.js'), 'post'),
    ...extractEndpoints(path.join(root, 'server.js'), 'put'),
    ...extractEndpoints(path.join(root, 'server.js'), 'delete'),
  ];

  log(`${BOLD}1. BACKEND ENDPOINTS (${serverEndpoints.length} total)${RESET}`);
  log('─'.repeat(50));

  // Group by method
  const byMethod = {};
  serverEndpoints.forEach(e => { if (!byMethod[e.method]) byMethod[e.method] = []; byMethod[e.method].push(e.path); });
  Object.keys(byMethod).sort().forEach(method => {
    log(`\n  ${method}:`);
    byMethod[method].sort().forEach(p => info(p));
  });

  // Extract frontend API calls
  log(`\n\n${BOLD}2. FRONTEND API CALLS${RESET}`);
  log('─'.repeat(50));
  const apiCalls = extractApiCalls(path.join(root, 'src', 'services', 'api.js'));
  apiCalls.forEach(c => info(c));

  // Verify critical endpoints
  log(`\n\n${BOLD}3. CRITICAL ENDPOINT CHECKS${RESET}`);
  log('─'.repeat(50));

  const critical = [
    { method: 'GET', path: '/api/departments', desc: 'Departments (public)' },
    { method: 'GET', path: '/api/invoices', desc: 'Invoices' },
    { method: 'GET', path: '/api/users', desc: 'Users' },
    { method: 'GET', path: '/api/admin/ledger', desc: 'Ledger' },
    { method: 'POST', path: '/api/admin-verification/authenticate-enhanced', desc: 'Login' },
    { method: 'POST', path: '/api/invoices', desc: 'Create invoice' },
    { method: 'POST', path: '/api/accounting/entries', desc: 'Accounting entry' },
  ];

  critical.forEach(ce => {
    const found = serverEndpoints.some(e =>
      e.method === ce.method && (e.path === ce.path || e.path === ce.path.replace('/api', '') || matchesPattern(e.path, ce.path))
    );
    if (found) ok(`${ce.method} ${ce.path} - ${ce.desc}`);
    else err(`${ce.method} ${ce.path} - ${ce.desc} - NOT FOUND`);
  });

  // Summary
  log(`\n${BOLD}═══════════════════════════════════════════════════════════════${RESET}`);
  log(`${BOLD}  SUMMARY: ${issues === 0 ? GREEN + 'ALL OK' : RED + issues + ' ISSUE(S)'}${RESET}`);
  log(`${BOLD}═══════════════════════════════════════════════════════════════${RESET}\n`);
}

main();
