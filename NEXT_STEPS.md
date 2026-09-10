# Next Steps — After Sprint 2

> Run these commands in order. Each one builds on the previous.

---

## Step 1: Install Dependencies (2 min)

```powershell
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom supertest eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier
```

---

## Step 2: Verify Tests Work (1 min)

```powershell
npm test
```

Expected: Tests run (some may fail until backend is running — that's OK for now).

---

## Step 3: Run Linter (1 min)

```powershell
npm run lint
```

Fix any errors that appear. Start with the easiest ones first.

---

## Step 4: Auto-format Code (1 min)

```powershell
npm run format
```

This will fix indentation, trailing commas, quotes, etc. automatically.

---

## Step 5: Apply Validators to Routes (30 min)

**File:** `backend/routes/users.js`

Add this to the top:
```javascript
const { validate, loginSchema } = require('../validators');
```

Then change the login route from:
```javascript
router.post('/login', async (req, res) => { ... })
```
To:
```javascript
router.post('/login', validate(loginSchema), async (req, res) => { ... })
```

Repeat for other routes (register, blog create/update, projects).

---

## Step 6: Create Swagger API Docs (1 hour)

**File:** `backend/docs/swagger.js` (create new)

```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Greggory Systems API',
      version: '1.0.0',
      description: 'API documentation for The Greggory Systems platform',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
```

Then in `server.js`, add:
```javascript
const setupSwagger = require('./docs/swagger');
setupSwagger(app);
```

Visit `http://localhost:5000/api-docs` to see docs.

---

## Step 7: Add GitHub Actions CI (30 min)

**File:** `.github/workflows/ci.yml` (create new)

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

---

## Step 8: Add Pre-commit Hooks (15 min)

```powershell
npm install -D husky lint-staged
npx husky install
```

**File:** `.husky/pre-commit`
```bash
npx lint-staged
```

**In package.json, add:**
```json
"lint-staged": {
  "*.{ts,tsx,js}": ["eslint --fix", "prettier --write"]
}
```

---

## Step 9: Write Protected Route Tests (1 hour)

**File:** `backend/__tests__/protected.test.js`

```javascript
const request = require('supertest');
const BASE = 'http://localhost:5000';

describe('Protected Routes', () => {
  it('rejects /api/admin/live-users without token', async () => {
    const res = await request(BASE).get('/api/admin/live-users');
    expect(res.status).toBe(401);
  });

  it('rejects /api/users/profile without token', async () => {
    const res = await request(BASE).get('/api/users/profile');
    expect(res.status).toBe(401);
  });
});
```

---

## Step 10: Add Error Boundary Integration (20 min)

**File:** `src/main.tsx`

```tsx
import ErrorBoundary from './components/ErrorBoundary';

// Wrap <App> with:
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Step 11: Add Loading Skeletons (1 hour)

Create `src/components/ui/skeleton.tsx`:

```tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}
```

Use in admin pages where data loads async.

---

## Step 12: Add DB Query Tests (1 hour)

**File:** `backend/__tests__/database.test.js`

```javascript
const db = require('../config/database');

describe('Database', () => {
  afterAll(async () => {
    await db.end();
  });

  it('connects successfully', async () => {
    const [rows] = await db.promise().query('SELECT 1 as val');
    expect(rows[0].val).toBe(1);
  });

  it('health endpoint returns OK', async () => {
    // Test health check query
  });
});
```

---

## Step 13: Activity Log Dashboard Widget (30 min)

**File:** `src/admin/pages/AdvancedDashboard.jsx`

Add a section showing recent `activity_logs` entries with:
- User name
- Action type
- Timestamp
- Filter dropdown

---

## Step 14: Electron Auto-updater (30 min)

```powershell
npm install electron-updater
```

**In main.js:**
```javascript
const { autoUpdater } = require('electron-updater');
autoUpdater.checkForUpdatesAndNotify();
```

---

## Quick Reference — Commands You'll Use

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests on every file save |
| `npm run test:coverage` | Tests + coverage report |
| `npm run lint` | Check for code issues |
| `npm run format` | Auto-fix formatting |
| `npm run start` | Launch full app |
| `npm run build` | Build for production |

---

## Priority Order (copy this)

```
1. npm install
2. npm test
3. npm run lint
4. npm run format
5. Apply validators to routes
6. Swagger docs
7. GitHub Actions CI
8. Husky pre-commit hooks
9. Protected route tests
10. Error boundary
11. Skeleton loaders
12. DB query tests
13. Activity log widget
14. Electron auto-updater
```
