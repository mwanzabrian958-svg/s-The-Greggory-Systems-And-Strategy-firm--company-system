# Sprint 7 — Next Steps

> Updated: 2026-09-11
> Status: Sprint 6 complete (commits `e1ca5f4` → `9c78bcf` on `main`). All tests green; coverage tooling enabled at **31.71%** baseline.

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
| 7 | **Backend Socket.IO server** (`backend/realtime/socketServer.js`): handshake auth for BOTH admin HMAC session tokens and user JWTs; presence broadcasts; notification read/delete acks; conversation `join`/typing/message relay; `dashboard:requestStats`; shared CORS with Express; live `notification:new` push bridge in `notificationHelper`; 12 integration tests on an ephemeral port. Also fixed: ANSI_QUOTES-safe SQL (`'read'`/`'unread'` literals — double quotes are identifiers on this DB), pre-existing empty `catch` lint errors in `AuthContext`, and the client socket URL resolver (`resolveSocketUrl`) | (this commit) |

---

## 🔴 NEXT — Do These Now (Priority Order)

### 1. Land the in-progress i18n + realtime client feature (uncommitted work) — 2h
The working tree has staged-but-uncommitted feature files that are **not wired in** and currently **won't compile**:
- [ ] **Missing type file:** `src/services/socket.ts` imports `../types/socket` but `src/types/socket.d.ts` does NOT exist (only `backend/types/socket.d.ts`). Copy the client-relevant event maps into `src/types/socket.d.ts`; drop the server-only `NodeJS.Global.io` block from the client copy. Verify `tsc` passes.
- [ ] Wire i18n: init `src/i18n/index.ts` in `main.tsx` (or `App.tsx`); add a language switcher (en/sw/fr) using `src/hooks/useLanguageSwitcher.ts` into `Navbar` or a settings dropdown.
- [ ] Wire `src/hooks/useOnlineStatus.ts` into the app shell (online/offline indicator).
- [ ] Optional: connect `src/services/socket.ts` with the auth token on login, subscribe via the `on()`/`SUB` helper.
- [ ] Tests: `src/__tests__/i18n.test.ts` using `__tests__/i18n-fixtures.cjs` (assert all 3 locales share the same key set); `useOnlineStatus` jsdom test.
- [ ] Gate: `npm run build` (tsc) + `npm run lint` + `npm test` all green, then **commit** these files.

### 2. Pull `src/` coverage off 0% — targeted component tests (RTL) — 3h
- [ ] Pure/simple first: `ErrorBoundary`, `PrivateRoute`, `RoleRoute`, `BrandHeader`, `Footer`, `SiteTagline`, `SocialMediaIcons` (`src/components/*.jsx`, many render simple props → render+assert only).
- [ ] Then interactive: `Navbar` (logged-in vs anonymous), `AuthLayout`, `SearchBlock`.
- [ ] Goal: `src/**` ≥ 50% lines; overall All-files ≥ 45%. Re-run `npm run test:coverage` to verify.

### 3. Backend route happy-path coverage with a mocked DB — 4h
- [ ] Add `backend/test-utils/mockDb.js` (stub for `db.promise().query` returning scripted rows / counting calls) used only by tests.
- [ ] Biggest gaps first (measured): `images.js` (25% — binary GET + upload), `management.js` (24%), `user-projects.js` (45%), `users.js` (30%), and one service test each (`mpesaService` 16%, `smsService` 27%).
- [ ] Goal: `backend/routes` ≥ 60%, `backend/services` ≥ 50% → **All files ≥ 70%**. Add `coverage.thresholds` to `vitest.config.ts` once reached so CI enforces it.

### 4. Dependency major upgrades (network-enabled machine; dedicated task) — 1 day
All remaining `npm audit` findings need a **major bump** — none are safe quick-fetches:
- [ ] **Electron 25 → 44** (desktop runtime; clears all electron/extract-zip high advisories). Verify `main.js`/`preload` still works.
- [ ] **Vitest 2 → 5** + matching `@vitest/coverage-v8` (clears the 1 **critical** + `@vitest/mocker`/`vite-node`).
- [ ] **Vite 4 → 7** + `@vitejs/plugin-react` bump (clears vite/esbuild dev-server advisories).
- [ ] **React Router v6 → v7** — registry does NOT publish the audit-suggested `6.30.7`; `7.18.x` is the only patched line. Migration: import `BrowserRouter` from `react-router-dom` still OK in v7, but check `Routes/Route`, `Navigate`, `useNavigate` re-exports and any `deserializeErrors` usage.
- [ ] Re-run `npm audit` until only informational/low remain (e.g. africastalking/joi — downgrade blocked by SDK, leave).

### 5. Hygiene / ops (30 min)
- [ ] Regenerate `backend/package-lock.json` (`cd backend && npm install`) so the committed `express ^4.22.2 / multer ^2.0.2 / mysql2 ^3.24.4` bumps are actually locked (this environment couldn't fetch; do it on a machine with registry access).
- [ ] Fix git credential helper: `git config --global credential.helper manager` (silences the `credential-manager-core is not a git command` push warning).
- [ ] Confirm GitHub Actions CI (.github/workflows/ci.yml — lint → test → build on Node 18) is green on `origin/main` after the next push.

---

## 📊 Progress

| Phase | Status |
|-------|--------|
| Sprint 6 API/hardening/docs | ✅ Complete (`1bc6ee8`, `a879800`, `7bf041e`, `9c78bcf`) |
| i18n + realtime client | 🚧 Wired source present, uncommitted, missing `src/types/socket.d.ts` |
| Frontend coverage `src/**` | 0% |
| Overall coverage | 31.71% (validators 99.1%, config 60.95%, routes 28.84%, services 29.38%) |
| `npm audit` | Root: 1 critical + 6 high remain (all dev/desktop, major-upgrade only). Backend: 0 critical/high |

---

## 🎯 Immediate Next Action

Start with **#1** — the uncommitted i18n/socket work is the only thing actively "in flight"; committing it (after wiring + the missing types file) unblocks everything else.