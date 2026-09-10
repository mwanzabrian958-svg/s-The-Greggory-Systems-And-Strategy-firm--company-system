# The Greggory Systems — Development TODO List

> Priority: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 🔴 CRITICAL — Do These First

### 1. Harden Electron Security
**File:** `main.js`
**Est. Time:** 30 minutes

- [ ] 1.1 Change `contextIsolation: false` → `contextIsolation: true`
- [ ] 1.2 Change `nodeIntegration: true` → `nodeIntegration: false`
- [ ] 1.3 Add `contextBridge` to expose only needed APIs to renderer
- [ ] 1.4 Remove `webSecurity: false` — find another way to handle local dev (use a preload script)
- [ ] 1.5 Test that the app still loads correctly after changes

---

### 2. Add Input Validation to Backend
**Files:** All files in `backend/routes/`
**Est. Time:** 2 hours

- [ ] 2.1 Install Zod: `npm install zod`
- [ ] 2.2 Create `backend/validators/` folder
- [ ] 2.3 Create validation schemas for login (email format, password min length)
- [ ] 2.4 Create validation schemas for user creation (all required fields, email uniqueness)
- [ ] 2.5 Create validation schemas for blog articles (title max length, content required)
- [ ] 2.6 Create validation schemas for project creation
- [ ] 2.7 Add Zod middleware to validate all POST/PUT routes
- [ ] 2.8 Return clear 400 errors with field-level messages on validation failure

---

### 3. Write First Tests (Auth Flow)
**Files:** New test files
**Est. Time:** 3 hours

- [ ] 3.1 Install Vitest: `npm install -D vitest @testing-library/react`
- [ ] 3.2 Create `vitest.config.ts` with React plugin
- [ ] 3.3 Create `src/__tests__/login.test.tsx` — test login form renders
- [ ] 3.4 Create `src/__tests__/login.test.tsx` — test login with empty fields shows error
- [ ] 3.5 Create `src/__tests__/login.test.tsx` — test successful login stores token
- [ ] 3.6 Install Supertest: `npm install -D supertest`
- [ ] 3.7 Create `backend/__tests__/auth.test.js` — test POST /api/users/login with valid creds
- [ ] 3.8 Create `backend/__tests__/auth.test.js` — test POST /api/users/login with invalid creds returns 401
- [ ] 3.9 Create `backend/__tests__/auth.test.js` — test protected route returns 401 without token
- [ ] 3.10 Add test script to package.json: `"test": "vitest"` and `"test:backend": "vitest --config vitest.backend.config.ts"`

---

### 4. Fix Rate Limiting
**File:** `backend/server.js`
**Est. Time:** 10 minutes

- [ ] 4.1 Change `max: 100` → `max: 50` in rate limit config
- [ ] 4.2 Add separate stricter limit for auth routes (10 req/15min)
- [ ] 4.3 Add `standardHeaders: true` to rate limit config
- [ ] 4.4 Test by making 51 requests quickly — verify 429 response

---

### 5. Remove Old DB Backups from Repo
**Files:** `scripts/.backup/*.sql`
**Est. Time:** 15 minutes

- [ ] 5.1 Keep only the most recent backup: `local-backup-2026-09-06T12-51-14-703Z.sql`
- [ ] 5.2 Move old backups outside the repo or delete them
- [ ] 5.3 Add to `.gitignore`: `scripts/.backup/*.sql`
- [ ] 5.4 Commit the `.gitignore` change

---
---

## 🟠 HIGH — Do These Next

### 6. Consolidate Database Schema
**Files:** `scripts/.backup/*.sql`, `backend/init-db.js`
**Est. Time:** 2 hours

- [ ] 6.1 Compare all backup SQL files — identify differences in table structures
- [ ] 6.2 Create `database/schema.sql` — single canonical schema file
- [ ] 6.3 Ensure all tables have `created_at`, `updated_at`, `deleted_at` (soft delete)
- [ ] 6.4 Remove duplicate or redundant tables found across backups
- [ ] 6.5 Add `backend/init-db.js` script that runs `schema.sql` to set up fresh DB
- [ ] 6.6 Test: drop database, run init script, verify all tables created correctly

---

### 7. Add Environment Variable Documentation
**Files:** `.env.example`, `README.md`
**Est. Time:** 30 minutes

- [ ] 7.1 Create `.env.example` with all required variables:
  - [ ] `JWT_SECRET` — description + example
  - [ ] `ADMIN_SESSION_SECRET` — description + example
  - [ ] `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — cloud DB
  - [ ] `DB_HOST_2`, `DB_PORT_2`, `DB_USER_2`, `DB_PASSWORD_2` — local DB
  - [ ] `DB_PREFER` — "cloud" or "local"
  - [ ] `DB_SSL` — "true" for cloud
  - [ ] `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`
  - [ ] `MPESA_CALLBACK_URL`
  - [ ] `VITE_API_BASE_URL` — leave empty for same-origin
  - [ ] `ADMIN_KEY` — for admin middleware
- [ ] 7.2 Add `.env.example` to git tracking: `git add -f .env.example`
- [ ] 7.3 Ensure `.env` is in `.gitignore`

---


### 8. Write a Proper README
**File:** `README.md`
**Est. Time:** 1 hour

- [ ] 8.1 Add project title and description
- [ ] 8.2 Add tech stack section (Electron, React, Express, MySQL)
- [ ] 8.3 Add prerequisites (Node.js 18+, XAMPP for local DB, npm)
- [ ] 8.4 Add setup instructions:
  - [ ] Clone repo
  - [ ] `npm install`
  - [ ] Copy `.env.example` to `.env` and fill in values
  - [ ] Start XAMPP (Apache + MySQL)
  - [ ] Run `node backend/init-db.js` to create tables
  - [ ] `npm run start` to launch full app
- [ ] 8.5 Add available scripts section (dev, build, test, etc.)
- [ ] 8.6 Add project structure overview (main folders)
- [ ] 8.7 Add contribution guidelines (branch naming, commit format)

---


### 9. Add API Documentation
**Files:** New `docs/` folder
**Est. Time:** 2 hours

- [ ] 9.1 Install Swagger: `npm install swagger-jsdoc swagger-ui-express`
- [ ] 9.2 Create `backend/docs/swagger.js` with OpenAPI config
- [ ] 9.3 Add JSDoc comments to auth routes (login, register, logout)
- [ ] 9.4 Add JSDoc comments to user routes (CRUD)
- [ ] 9.5 Add JSDoc comments to blog routes (CRUD)
- [ ] 9.6 Mount Swagger UI at `/api-docs`
- [ ] 9.7 Test: visit `http://localhost:5000/api-docs` and verify docs load

---


### 10. Add ESLint + Prettier
**Files:** `.eslintrc.cjs`, `.prettierrc`, `.prettierignore`
**Est. Time:** 45 minutes

- [ ] 10.1 Install ESLint: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks`
- [ ] 10.2 Create `.eslintrc.cjs` with rules:
  - [ ] `no-unused-vars: error`
  - [ ] `no-console: warn` (allow warn/error but not log in prod)
---

## 🟡 MEDIUM — Do After High Priority

### 11. Add Protected Route Tests
**Files:** New test files
**Est. Time:** 2 hours

- [ ] 11.1 Test that `/api/admin/*` routes require valid session token
- [ ] 11.2 Test that `/api/users/*` routes require valid JWT
- [ ] 11.3 Test permission-based access (finance role can't access HR routes)
- [ ] 11.4 Test that expired tokens are rejected
- [ ] 11.5 Test that tampered tokens are rejected

---


### 12. Add Database Query Tests
**Files:** New test files
**Est. Time:** 2 hours

- [ ] 12.1 Create test database `the_greggory_systems_test`
- [ ] 12.2 Write test: create user → query user → verify fields match
- [ ] 12.3 Write test: create blog article → update → verify changes persisted
- [ ] 12.4 Write test: delete user (soft delete) → verify `deleted_at` is set
- [ ] 12.5 Write test: accounting entry creation with tax calculation
- [ ] 12.6 Add `beforeEach` hook to clean tables between tests

---


### 13. Add GitHub Actions CI
**File:** `.github/workflows/ci.yml`
**Est. Time:** 1 hour

- [ ] 13.1 Create `.github/workflows/ci.yml`
- [ ] 13.2 Add trigger: on push to main and on pull request
- [ ] 13.3 Add job: install dependencies
- [ ] 13.4 Add job: run linter
- [ ] 13.5 Add job: run tests
- [ ] 13.6 Add job: build frontend
- [ ] 13.7 Verify CI runs on next push

---


### 14. Add Pre-commit Hooks
**Files:** `.husky/pre-commit`
**Est. Time:** 30 minutes

- [ ] 14.1 Install Husky: `npm install -D husky lint-staged`
- [ ] 14.2 Initialize Husky: `npx husky install`
- [ ] 14.3 Create `.husky/pre-commit`: runs `lint-staged`
- [ ] 14.4 Add to `package.json`:
  ```json
  "lint-staged": {
    "*.{ts,tsx,js}": ["eslint --fix", "prettier --write"]
  }
  ```
- [ ] 14.5 Test: make a change with a lint error → commit should be blocked

---
---

## 🟢 LOW — Nice to Have

### 17. Add Electron Auto-updater
**Files:** `main.js`
**Est. Time:** 1 hour

- [ ] 17.1 Install `electron-updater`: `npm install electron-updater`
- [ ] 17.2 Add auto-update check on app start
- [ ] 17.3 Add update available notification in UI
- [ ] 17.4 Add download progress indicator
- [ ] 17.5 Add "restart to update" button

---


### 18. Add Database Migration System
**Files:** New `database/migrations/` folder
**Est. Time:** 3 hours

- [ ] 18.1 Install a migration tool (db-migrate or Knex migrations)
- [ ] 18.2 Create initial migration from canonical schema
- [ ] 18.3 Create migration for adding new features
- [ ] 18.4 Add `npm run migrate` script
- [ ] 18.5 Add `npm run rollback` script
- [ ] 18.6 Document migration workflow in README

---


### 19. Add API Response Caching
**Files:** `backend/middleware/`
**Est. Time:** 1 hour

- [ ] 19.1 Add in-memory cache for frequently-read data (blog posts, content)
- [ ] 19.2 Add cache invalidation on create/update/delete
- [ ] 19.3 Add `Cache-Control` headers for static content
- [ ] 19.4 Test: verify repeated requests are faster

---


### 20. Add Activity Log Dashboard Widget
**File:** `src/admin/pages/AdvancedDashboard.jsx`
**Est. Time:** 1 hour

- [ ] 20.1 Show recent activity logs on dashboard
- [ ] 20.2 Add filter by user/action/date
- [ ] 20.3 Add "export to CSV" button

---


## 📊 Progress Tracking

| Section | Tasks | Status |
|---------|-------|--------|
| 🔴 Critical | 5 sections, 21 tasks | ⬜ Not started |
| 🟠 High | 5 sections, 30 tasks | ⬜ Not started |
| 🟡 Medium | 5 sections, 30 tasks | ⬜ Not started |
| 🟢 Low | 4 sections, 15 tasks | ⬜ Not started |
| **Total** | **19 sections, 96 tasks** | **0% complete** |

---


## 🎯 Suggested Sprint Plan

### Sprint 1 (Days 1-3): Security & Stability
- Tasks 1, 2, 4, 5, 7
- Goal: App is secure and env vars are documented

### Sprint 2 (Days 4-7): Testing Foundation
- Tasks 3, 6, 10
- Goal: Tests run, schema is clean, code is linted

### Sprint 3 (Days 8-10): Documentation & DX
- Tasks 8, 9, 14
- Goal: New developer can set up in < 10 minutes

### Sprint 4 (Days 11-14): Coverage & CI
- Tasks 11, 12, 13, 15, 16
- Goal: 70%+ test coverage, CI passes on every push

---

> **How to use this list:** Copy this file, check off tasks as you complete them, and update the progress table. Start with Sprint 1 tasks.



### 15. Add Error Boundary to React App
**File:** `src/components/ErrorBoundary.jsx` (exists, needs integration)
**Est. Time:** 30 minutes

- [ ] 15.1 Review existing `ErrorBoundary.jsx`
- [ ] 15.2 Wrap `<App>` with ErrorBoundary in `src/main.tsx`
- [ ] 15.3 Add user-friendly fallback UI (not blank white screen)
- [ ] 15.4 Add error logging to console (or external service)
- [ ] 15.5 Test: throw error in a component → verify fallback UI shows

---


### 16. Add Loading States to Admin Pages
**Files:** Various admin page components
**Est. Time:** 2 hours

- [ ] 16.1 Add skeleton loaders to Dashboard page
- [ ] 16.2 Add skeleton loaders to Users list
- [ ] 16.3 Add skeleton loaders to Projects list
- [ ] 16.4 Add skeleton loaders to Content/Blog list
- [ ] 16.5 Ensure all API calls have loading + error + success states
- [ ] 16.6 Add retry button on error states

---

  - [ ] `eqeqeq: error` (require ===)
  - [ ] React hooks rules
- [ ] 10.3 Install Prettier: `npm install -D prettier eslint-config-prettier`
- [ ] 10.4 Create `.prettierrc`: `{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "all" }`
- [ ] 10.5 Add scripts: `"lint": "eslint src backend --ext .ts,.tsx,.js"`, `"format": "prettier --write src backend"`
- [ ] 10.6 Run linter and fix all errors

---

