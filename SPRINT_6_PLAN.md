# Sprint 6 Plan — Testing, Code Quality, Features, Performance, Docs, Security

> Started: 2026-09-11

---

## Phase 1: Code Quality (Foundation)

### 1.1 Add Validation to All Routes
- [ ] `backend/validators/schemas.js` — Add schemas for: admin, mpesa, sms, whatsapp, content, user-projects, contact-forms, management
- [ ] `backend/routes/admin.js` — Add validation to all POST/PUT routes
- [ ] `backend/routes/mpesa.js` — Add phone/amount validation
- [ ] `backend/routes/sms.js` — Add phone/message validation
- [ ] `backend/routes/whatsapp.js` — Add message validation
- [ ] `backend/routes/content.js` — Add content validation
- [ ] `backend/routes/user-projects.js` — Add project validation
- [ ] `backend/routes/contact-forms.js` — Add form validation

### 1.2 Standardize API Responses
- [ ] `backend/utils/responseHelper.js` — Create `success()` and `error()` helpers
- [ ] Apply consistent format to all routes

### 1.3 Refactor admin.js
- [ ] `backend/routes/admin-users.js` — Extract user management routes
- [ ] `backend/routes/admin-crm.js` — Extract CRM routes
- [ ] `backend/routes/admin-settings.js` — Extract settings routes

---

## Phase 2: Testing

### 2.1 Backend Route Tests
- [ ] `backend/__tests__/admin.test.js` — Admin CRUD tests
- [ ] `backend/__tests__/mpesa.test.js` — M-Pesa payment tests
- [ ] `backend/__tests__/sms.test.js` — SMS tests
- [ ] `backend/__tests__/whatsapp.test.js` — WhatsApp tests
- [ ] `backend/__tests__/content.test.js` — Content CRUD tests
- [ ] `backend/__tests__/user-projects.test.js` — Project tests

### 2.2 Service Tests
- [ ] `backend/__tests__/cache.test.js` — Cache middleware tests
- [ ] `backend/__tests__/responseHelper.test.js` — Response helper tests

### 2.3 Integration Tests
- [ ] `backend/__tests__/auth-flow.test.js` — Full auth flow
- [ ] `backend/__tests__/validation.test.js` — Validation error tests

---

## Phase 3: Features

### 3.1 Missing Endpoints
- [ ] `GET /api/admin/dashboard-stats` — Dashboard summary
- [ ] `GET /api/admin/activity-logs` — Activity listing
- [ ] `POST /api/users/forgot-password` — Password reset
- [ ] `GET /api/notifications` — User notifications

### 3.2 Search Functionality
- [ ] `GET /api/search?q=` — Global search
- [ ] Search results page in admin

---

## Phase 4: Performance

### 4.1 Database Optimization
- [ ] Add pagination helpers
- [ ] Add query result limiting

### 4.2 Caching
- [ ] Extend cache middleware to more routes
- [ ] Add cache invalidation patterns

---

## Phase 5: Documentation

### 5.1 Swagger Completion
- [ ] Add JSDoc annotations to all routes
- [ ] Document request/response schemas

### 5.2 Developer Docs
- [ ] `CONTRIBUTING.md` — Coding standards
- [ ] `docs/ARCHITECTURE.md` — System diagram

---

## Phase 6: Security

### 6.1 Security Middleware
- [ ] CSRF protection
- [ ] Security headers (CSP, HSTS)
- [ ] Rate limiting per-user

### 6.2 Security Audit
- [ ] Fix npm audit vulnerabilities
- [ ] Add security checklist

---

## Progress Tracking

| Phase | Status | Tests Added |
|-------|--------|-------------|
| 1.1 Validation | ⬜ Not started | — |
| 1.2 Response Helper | ⬜ Not started | — |
| 1.3 Refactor admin.js | ⬜ Not started | — |
| 2.1 Route Tests | ⬜ Not started | — |
| 2.2 Service Tests | ⬜ Not started | — |
| 2.3 Integration Tests | ⬜ Not started | — |
| 3.1 Missing Endpoints | ⬜ Not started | — |
| 3.2 Search | ⬜ Not started | — |
| 4.1 DB Optimization | ⬜ Not started | — |
| 4.2 Caching | ⬜ Not started | — |
| 5.1 Swagger | ⬜ Not started | — |
| 5.2 Developer Docs | ⬜ Not started | — |
| 6.1 Security Middleware | ⬜ Not started | — |
| 6.2 Security Audit | ⬜ Not started | — |
