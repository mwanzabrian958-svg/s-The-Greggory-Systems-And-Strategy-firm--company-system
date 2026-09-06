// Clears stale dev-server listeners on the project's fixed ports
// (5173 = Vite, 3001 = backend relay). Only processes actually LISTENING
// on exactly these ports are killed — nothing else is touched.
const { execSync } = require('child_process');

const PORTS = [5173, 3001];

function listenerPids(port) {
  try {
    const out = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      const parts = line.trim().split(/\s+/);
      // TCP  0.0.0.0:5173  0.0.0.0:0  LISTENING  1234
      if (parts.length >= 5 && parts[3] === 'LISTENING' && parts[1].endsWith(`:${port}`)) {
        pids.add(parts[4]);
      }
    }
    return [...pids];
  } catch {
    return [];
  }
}

let cleared = 0;
for (const port of PORTS) {
  for (const pid of listenerPids(port)) {
    try {
      execSync(`taskkill /PID ${pid} /F /T`, { stdio: 'ignore' });
      cleared++;
      console.log(`[ports:clear] killed stale listener pid=${pid} on port ${port}`);
    } catch {
      /* pid already exited */
    }
  }
}
console.log(
  cleared
    ? `[ports:clear] cleared ${cleared} stale process(es)`
    : '[ports:clear] ports 5173/3001 already free'
);