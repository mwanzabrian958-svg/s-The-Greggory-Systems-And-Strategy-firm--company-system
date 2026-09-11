# Sprint 6 — Next Steps

> Updated: 2026-09-11
> Current: 56 tests passing (7 DB-skipped), 0 lint errors, Phase 1-3 + 5-6 complete

---

## ✅ Done

| # | Task | Commit |
|---|------|--------|
| 1 | Create response helper (`success`, `error`, `created`, `paginated`) | `21e34c1` |
| 2 | Add 15 validation schemas (admin, mpesa, sms, whatsapp, content, contact, management, notification) | `21e34c1` |
| 3 | Add validation to M-Pesa route | `21e34c1` |
| 4 | Add validation to SMS route (3 endpoints) | `ae92776` |
| 5 | Add validation to WhatsApp route (2 endpoints) | `ae92776` |
| 6 | Rewrite users test with validation tests | `ae92776` |

---

## 🔴 NEXT — Do These Now (Priority Order)

### 1. Add Validation to Remaining Routes (30 min)
- [x] `backend/routes/content.js` — Add `validate(contentSchema)` to POST/PUT
- [x] `backend/routes/user-projects.js` — Add `validate(projectSchema)` to POST/PUT
- [x] `backend/routes/contact-forms.js` — Add `validate(contactFormSchema)` to POST
- [x] `backend/routes/management.js` — Add `validate(managementSchema)` to PUT

### 2. Apply Response Helpers to Remaining Routes (30 min)
- [x] `backend/routes/content.js` — Use `success()`/`error()`
- [x] `backend/routes/user-projects.js` — Use `success()`/`error()`
- [x] `backend/routes/contact-forms.js` — Use `success()`/`error()`
- [x] `backend/routes/management.js` — Use `success()`/`error()`
- [x] `backend/routes/images.js` — Use `success()`/`error()`

### 3. Write Route Tests (1 hour)
- [x] `backend/__tests__/mpesa.test.js` — Test STK push validation
- [x] `backend/__tests__/sms.test.js` — Test SMS send/bulk/send-all validation
- [x] `backend/__tests__/whatsapp.test.js` — Test WhatsApp send/bulk validation
- [x] `backend/__tests__/content.test.js` — Test content CRUD validation

### 4. Add Missing API Endpoints (1 hour)
- [x] `GET /api/admin/dashboard-stats` — Dashboard summary data
- [x] `GET /api/admin/activity-logs` — Already existed in admin.js (verified)
- [x] `POST /api/users/forgot-password` — Password reset email

### 5. Refactor admin.js (1 hour)
- [x] Extract user management routes → `backend/routes/admin-users.js` (11 routes: `profile-lookup`, `live-users`, `search`, `admin-users`, `users`, `create-admin`, `users/:id/export-pdf`, `users/:id`, `users/:id/status` PUT, `users/:id` DELETE, `users/:id` GET) — mounted at `/api/admin` in `server.js`; all public URLs unchanged; zero route duplication across the two routers (17 + 11); unused `bcrypt`/`verifySessionToken` imports + `requireAdminSession` removed from slimmed `admin.js`; contract tests in `users.test.js` (auth-rejection parity for 8 protected endpoints + shape contract for 3 public) pass pre/post split (23/23 users suite, 5/5 protected suite)
- [x] Extract CRM routes → `backend/routes/admin-crm.js` (mounted at `/api/admin/crm`)
- [x] Extract settings routes → `backend/routes/admin-settings.js` (mounted at `/api/admin`)
- [x] Update `backend/server.js` to use new route files

> **Note on admin-users.js:** The user-management block (`/admin-users`, `/users`, `/users/:id`, export-pdf, status, delete) is deeply intertwined with activity logging and session handling in admin.js. Extracting it safely requires route tests first — recommended as the first task of Sprint 7.

### 6. Add Swagger Annotations (30 min)
- [x] `backend/routes/content.js` — Add JSDoc swagger comments
- [x] `backend/routes/user-projects.js` — Add JSDoc swagger comments
- [x] `backend/routes/mpesa.js` — Add JSDoc swagger comments
- [x] `backend/routes/sms.js` — Add JSDoc swagger comments

### 7. Write CONTRIBUTING.md (30 min)
- [x] Code style guidelines
- [x] Validation pattern (how to use `validate()`)
- [x] Response format (how to use `success()`/`error()`)
- [x] Testing requirements

### 8. Security Hardening (30 min)
- [x] Add `helmet` CSP configuration
- [x] Add rate limiting per-user (not just IP) — JWT-keyed limiter on `/api/users/*` (100 req/15min), falls back to IP
- [x] Add request size limits — `express.json` / `urlencoded` both tightened to 5mb

---

## 📊 Progress

| Phase | Status | Completion |
|-------|--------|------------|
| 1.1 Validation | ✅ Done | 7/7 routes done |
| 1.2 Response Helper | ✅ Done | 8/8 routes done |
| 1.3 Refactor admin.js | ✅ Done | CRM + Settings + Users extracted (3/3 files) |
| 2.1 Route Tests | ✅ Done | 6/6 files |
| 3.1 Missing Endpoints | ✅ Done | 3/3 endpoints |
| 5.1 Swagger | ✅ Done | 4/4 routes |
| 5.2 Developer Docs | ✅ Done | 1/1 files (CONTRIBUTING.md) |
| 6.1 Security | ✅ Done | 3/3 items |

---

## 🎯 Immediate Next Action

Sprint 6 is essentially complete. Remaining carry-over into Sprint 7 (in priority order):

1. **Extract user management routes → `backend/routes/admin-users.js`** — ✅ **Done** this session.
2. **Address `npm audit` findings** — ✅ **Analysis complete.** Root: 12 findings (2 low, 3 moderate, 6 high, 1 critical). Backend: 3 findings (1 low, 1 moderate, 1 high).
   - **Backend (production server) — FIXED by dependency bumps:**
     - `mysql2` `^3.21.0 → ^3.24.4` (fixes high-severity auth-plugin downgrade + inflate DoS)
     - `multer` `^1.4.5-lts.1 → ^2.0.2`
     - `express` `^4.19.2 → ^4.22.2`
     - Remaining backend findings (low `body-parser`, moderate `qs`, low `joi`/`africastalking`) are transitive through `express`/`africastalking` and only fully clear by moving the backend to `express` 5.x (major). Defer to a dedicated upgrade.
   - **Root (frontend/dev/desktop) — REMAINING (deferred, all dev-only or desktop-runtime):**
     - **critical | `vitest` ≤4.1.10** → `vitest` 5.x (major; would also pull `@vitest/mocker`, `vite-node`). Affects `npm test` only. The fixable/dev-server attack requires the Vitest UI server.
     - **high | `electron` 25.9.8** → 44.x (major runtime + API changes; huge download). Desktop packaging concern only — the Node/Express API and browser frontend are unaffected.
     - **high | `vite` 4.5.14** → 6.4.3+/7.x; **moderate | `esbuild`**: dev-server only, `npm run dev`/build tooling.
     - **high | `react-router` / `react-router-dom` 6.16.0** → registry does **not** publish `6.30.7` (audit's suggested range doesn't exist there); latest published is `7.18.x`. Requires the React Router v6→v7 major migration (API changes, `<BrowserRouter>`→framework router option, route loader changes). Plan as a dedicated migration task.
     - low | `africastalking`/`joi` (downgrade required to 0.7.4 — skip, do not downgrade a working SDK for a low-severity transitive).
   - **Action taken this session:** kept `backend/package.json` bumps that clear the 1 backend high; documented the remaining 12 root findings (1 critical, 6 high are all dev/desktop-only or major-version). Every remaining item requires a major dependency upgrade — none are safe quick-fetches.
   - Re-verify with `npm audit` and `cd backend && npm audit` after the major upgrades (Sprint 8+).
3. ~~**Add a `/reset-password` endpoint**~~ — ✅ **Done.** `POST /api/users/reset-password` now consumes the tokens issued by `forgot-password` (SHA-256-hashed at rest, single-use, 24h expiry). The password-reset flow is end-to-end complete.
4. **Optional:** install/run `npm run test:coverage` to hit the 70%+ coverage target.
