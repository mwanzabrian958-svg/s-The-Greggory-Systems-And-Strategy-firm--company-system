# Sprint 7 — Next Steps

> Updated: 2026-09-11
> Status: Sprint 6 complete. i18n + realtime client + Socket.IO server landed. Real DB route tests added (opt-in). Coverage tooling enabled at **31.71%** baseline.

---

## ✅ Done (carried over from Sprint 6 / earlier)

| # | Task | Commit |
|---|------|--------|
| 1 | Extract `admin-users.js` from `admin.js` (11 routes) + contract tests | `1bc6ee8` |
| 2 | `npm audit` — backend server deps bumped (expres 4.22.2, multer 2.0.2, mysql2 3.24.4) + full analysis documented | `a879800` |
| 3 | `POST /api/users/reset-password` (password-reset flow end-to-end) | `7bf041e` |
| 4 | Coverage tooling: `@vitest/coverage-v8`, baseline 31.71%, `coverage/` gitignored | `9c78bcf` |
| 5 | Sprint 7 plan committed | `49469e1` |
| 6 | i18n (en/sw/fr) + realtime client landed (switcher, online status, socket types, 8 tests) | `84fdd06` |
| 7 | **Backend Socket.IO server** (`backend/realtime/socketServer.js`): handshake auth for BOTH admin HMAC session tokens and user JWTs; presence broadcasts; notification read/delete acks; conversation `join`/typing/message relay; `dashboard:requestStats`; shared CORS with Express; live `notification:new` push bridge in `notificationHelper`; 12 integration tests on an ephemeral port. Also fixed: ANSI_QUOTES-safe SQL, pre-existing empty `catch` lint errors in `AuthContext`, and the client socket URL resolver. | `05a5d16` |
| 8 | Mock DB bug fix: inner functions read `db.store` directly so `__clear()`/reassignment is reflected by live promise handles | `20153f2` |
| 9 | Wrap Express app in HTTP server and attach Socket.IO (shared CORS, REST + WebSocket on one port) | `23f1549` |
| 10 | **Real DB route coverage** (`backend/__tests__/routes.test.js`): management GET/PUT, contact-forms POST, users register — seeds real rows, asserts on real DB state, cleans up. Opt-in via `RUN_DB_TESTS=1`. **Mock DB removed** per project direction (2 actual DBs, no mocks, no mock data). | `97131ca` |

---

## 🔴 NEXT — Do These Now (Priority Order)

### 1. Expand real DB route coverage — 3h
Tests live in `backend/__tests__/routes.test.js` (opt-in: `RUN_DB_TESTS=1 npm test`). Uses REAL data — seeds rows, asserts on real DB state, cleans up after. Add the biggest remaining gaps:
- [ ] `images.js` (25% — binary GET + upload endpoints)
- [ ] `user-projects.js` (45% — CRUD endpoints)
- [ ] `users.js` (30% — login, client-dashboard, admin user management)
- [ ] `blog-articles.js` (POST/GET/DELETE)
- [ ] `content.js` (POST/GET/PUT)
- [ ] One service test each: `mpesaService` (16%), `smsService` (27%)
- [ ] Goal: `backend/routes` ≥ 60%, `backend/services` ≥ 50% → **All files ≥ 70%**. Add `coverage.thresholds` to `vitest.config.ts` once reached so CI enforces it.

### 2. Pull `src/` coverage off 0% — targeted component tests (RTL) — 3h
- [ ] Pure/simple first: `ErrorBoundary`, `PrivateRoute`, `RoleRoute`, `BrandHeader`, `Footer`, `SiteTagline`, `SocialMediaIcons` (`src/components/*.jsx`, many render simple props → render+assert only).
- [ ] Then interactive: `Navbar` (logged-in vs anonymous), `AuthLayout`, `SearchBlock`.
- [ ] Goal: `src/**` ≥ 50% lines; overall All-files ≥ 45%. Re-run `npm run test:coverage` to verify.

### 3. Dependency major upgrades (network-enabled machine; dedicated task) — 1 day
All remaining `npm audit` findings need a **major bump** — none are safe quick-fetches:
- [ ] **Electron 25 → 44** (desktop runtime; clears all electron/extract-zip high advisories). Verify `main.js`/`preload` still works.
- [ ] **Vitest 2 → 5** + matching `@vitest/coverage-v8` (clears the 1 **critical** + `@vitest/mocker`/`vite-node`).
- [ ] **Vite 4 → 7** + `@vitejs/plugin-react` bump (clears vite/esbuild dev-server advisories).
- [ ] **React Router v6 → v7** — registry does NOT publish the audit-suggested `6.30.7`; `7.18.x` is the only patched line. Migration: import `BrowserRouter` from `react-router-dom` still OK in v7, but check `Routes/Route`, `Navigate`, `useNavigate` re-exports and any `deserializeErrors` usage.
- [ ] Re-run `npm audit` until only informational/low remain (e.g. africastalking/joi — downgrade blocked by SDK, leave).

### 4. Hygiene / ops (30 min)
- [ ] Regenerate `backend/package-lock.json` (`cd backend && npm install`) so the committed `express ^4.22.2 / multer ^2.0.2 / mysql2 ^3.24.4` bumps are actually locked (this environment couldn't fetch; do it on a machine with registry access).
- [ ] Fix git credential helper: `git config --global credential.helper manager` (silences the `credential-manager-core is not a git command` push warning).
- [ ] Confirm GitHub Actions CI (.github/workflows/ci.yml — lint → test → build on Node 18) is green on `origin/main` after the next push.

---

## 📊 Progress

| Phase | Status |
|-------|--------|
| Sprint 6 API/hardening/docs | ✅ Complete (`1bc6ee8`, `a879800`, `7bf041e`, `9c78bcf`) |
| i18n + realtime client | ✅ Complete (`84fdd06`) |
| Socket.IO realtime server | ✅ Complete (`05a5d16`, `20153f2`, `23f1549`) |
| Real DB route tests (opt-in) | ✅ Started (`97131ca` — management, contact-forms, users) |
| Frontend coverage `src/**` | 0% |
| Overall coverage | 31.71% (validators 99.1%, config 60.95%, routes 28.84%, services 29.38%) |
| `npm audit` | Root: 1 critical + 6 high remain (all dev/desktop, major-upgrade only). Backend: 0 critical/high |

---

## 🎯 Immediate Next Action

**Expand real DB route coverage** — add tests for `images.js`, `user-projects.js`, `blog-articles.js`, `content.js`, and service tests (`mpesaService`, `smsService`). Run with `RUN_DB_TESTS=1 npm test` when the MySQL endpoints (local:3306 + cloud:28067) are reachable.
