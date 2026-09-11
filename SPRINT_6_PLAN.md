# Sprint 6 — Next Steps

> Updated: 2026-09-11
> Current: 32 tests passing, 0 lint warnings, Phase 1 partially complete

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
- [ ] `backend/routes/content.js` — Add `validate(contentSchema)` to POST/PUT
- [ ] `backend/routes/user-projects.js` — Add `validate(projectSchema)` to POST/PUT
- [ ] `backend/routes/contact-forms.js` — Add `validate(contactFormSchema)` to POST
- [ ] `backend/routes/management.js` — Add `validate(managementSchema)` to PUT

### 2. Apply Response Helpers to Remaining Routes (30 min)
- [ ] `backend/routes/content.js` — Use `success()`/`error()`
- [ ] `backend/routes/user-projects.js` — Use `success()`/`error()`
- [ ] `backend/routes/contact-forms.js` — Use `success()`/`error()`
- [ ] `backend/routes/management.js` — Use `success()`/`error()`
- [ ] `backend/routes/images.js` — Use `success()`/`error()`

### 3. Write Route Tests (1 hour)
- [ ] `backend/__tests__/mpesa.test.js` — Test STK push validation
- [ ] `backend/__tests__/sms.test.js` — Test SMS send/bulk/send-all validation
- [ ] `backend/__tests__/whatsapp.test.js` — Test WhatsApp send/bulk validation
- [ ] `backend/__tests__/content.test.js` — Test content CRUD validation

### 4. Add Missing API Endpoints (1 hour)
- [ ] `GET /api/admin/dashboard-stats` — Dashboard summary data
- [ ] `GET /api/admin/activity-logs` — Activity log listing with pagination
- [ ] `POST /api/users/forgot-password` — Password reset email

### 5. Refactor admin.js (1 hour)
- [ ] Extract user management routes → `backend/routes/admin-users.js`
- [ ] Extract CRM routes → `backend/routes/admin-crm.js`
- [ ] Extract settings routes → `backend/routes/admin-settings.js`
- [ ] Update `backend/server.js` to use new route files

### 6. Add Swagger Annotations (30 min)
- [ ] `backend/routes/content.js` — Add JSDoc swagger comments
- [ ] `backend/routes/user-projects.js` — Add JSDoc swagger comments
- [ ] `backend/routes/mpesa.js` — Add JSDoc swagger comments
- [ ] `backend/routes/sms.js` — Add JSDoc swagger comments

### 7. Write CONTRIBUTING.md (30 min)
- [ ] Code style guidelines
- [ ] Validation pattern (how to use `validate()`)
- [ ] Response format (how to use `success()`/`error()`)
- [ ] Testing requirements

### 8. Security Hardening (30 min)
- [ ] Add `helmet` CSP configuration
- [ ] Add rate limiting per-user (not just IP)
- [ ] Add request size limits

---

## 📊 Progress

| Phase | Status | Completion |
|-------|--------|------------|
| 1.1 Validation | 🟡 In progress | 3/7 routes done |
| 1.2 Response Helper | 🟡 In progress | 3/8 routes done |
| 1.3 Refactor admin.js | ⬜ Not started | 0% |
| 2.1 Route Tests | ⬜ Not started | 0/6 files |
| 3.1 Missing Endpoints | ⬜ Not started | 0/3 endpoints |
| 5.1 Swagger | ⬜ Not started | 0/4 routes |
| 5.2 Developer Docs | ⬜ Not started | 0/1 files |
| 6.1 Security | ⬜ Not started | 0/3 items |

---

## 🎯 Immediate Next Action

Start with **#1: Add Validation to Remaining Routes** — 4 files, ~30 minutes:

1. `backend/routes/content.js`
2. `backend/routes/user-projects.js`
3. `backend/routes/contact-forms.js`
4. `backend/routes/management.js`

Pattern for each:
```javascript
const { validate, contentSchema } = require('../validators');
const { success, error } = require('../utils/responseHelper');

router.post('/', validate(contentSchema), async (req, res) => {
  // ... existing logic, but use success()/error() for responses
});
```
