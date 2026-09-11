# Research List — Next Steps for The Greggory Systems Project

> Created: 2026-09-11
> Current State: Sprints 1-5 complete, 31 tests passing, 0 lint warnings, build successful

---

## 📊 Current Project Stats

| Metric | Value |
|--------|-------|
| Admin Pages | 49 |
| Department Pages | 14 |
| Employee Pages | 17 |
| Backend Routes | 17 |
| Backend Services | 4 (email, M-Pesa, SMS, WhatsApp) |
| Test Files | 7 (31 test cases) |
| Test Coverage | ~40% (estimated) |
| Lint Warnings | 0 |
| Build Status | ✅ Success |

---

## 🔴 HIGH PRIORITY — Testing Gaps

### 1. Expand Test Coverage (Target: 70%+)
**Current**: 31 tests cover auth, blog, users, permissions, login component, protected routes
**Gap**: Most routes, services, and components have zero test coverage

| Area | Tests Needed | Est. Time |
|------|-------------|-----------|
| `backend/routes/admin.js` (651 lines, 56KB) | Admin CRUD operations, user management, dashboard data | 4h |
| `backend/routes/mpesa.js` (110 lines) | M-Pesa STK push, transaction recording, status queries | 2h |
| `backend/routes/sms.js` (164 lines) | SMS sending, delivery tracking | 1h |
| `backend/routes/whatsapp.js` (132 lines) | WhatsApp message sending | 1h |
| `backend/routes/content.js` (130 lines) | Content CRUD operations | 1h |
| `backend/routes/user-projects.js` (146 lines) | Project CRUD, user-project associations | 2h |
| `backend/services/emailService.js` | Email sending, templates | 1h |
| `backend/middleware/cache.js` (53 lines) | Cache set/get/invalidation | 1h |
| `src/services/api.js` (180 lines) | API call, token injection, error handling | 2h |
| `src/admin/utils/permissions.js` (318 lines) | RBAC edge cases, navigation filtering | 2h |
| `src/context/AuthContext.jsx` | Auth state, login/logout flows | 1h |

### 2. Integration Tests
- [ ] Full auth flow: register → login → access protected route → logout
- [ ] Database migration runner: apply → rollback → re-apply
- [ ] Cache middleware: set → get → invalidate → verify miss
- [ ] Dual DB failover: simulate primary failure → verify fallback

### 3. E2E Tests (Electron)
- [ ] App launches and loads frontend
- [ ] Login flow works end-to-end
- [ ] Navigation between admin pages
- [ ] Data persists across sessions

---

## 🟠 HIGH PRIORITY — Code Quality & Architecture

### 4. Refactor `backend/routes/admin.js` (56KB, 651 lines)
**Issue**: This file is too large and violates single responsibility
**Plan**:
- [ ] Split into `admin-users.js`, `admin-projects.js`, `admin-financial.js`, `admin-reports.js`
- [ ] Extract common middleware patterns
- [ ] Add consistent error handling wrapper

### 5. Add Request Validation to Remaining Routes
**Current**: Only `users.js` and `blog-articles.js` use Zod validation
**Gap**: `admin.js`, `mpesa.js`, `sms.js`, `whatsapp.js`, `content.js`, `user-projects.js` have no validation

| Route | Validation Needed |
|-------|------------------|
| `admin.js` | All POST/PUT endpoints |
| `mpesa.js` | Phone number format, amount validation |
| `sms.js` | Phone number, message length |
| `whatsapp.js` | Phone number, message content |
| `content.js` | Title, body, type fields |
| `user-projects.js` | Project data, dates, budget |

### 6. Standardize API Response Format
**Issue**: Some routes return `{ success: true, ... }`, others return raw data
**Plan**:
- [ ] Create `backend/utils/responseHelper.js` with `success()` and `error()` helpers
- [ ] Apply consistent format across all routes
- [ ] Add response format tests

### 7. Add TypeScript to Backend
**Current**: Backend is plain JavaScript
**Plan**:
- [ ] Add JSDoc types to all backend files
- [ ] Or migrate critical routes to TypeScript with `ts-node`
- [ ] Add `backend/tsconfig.json` for type checking

---

## 🟡 MEDIUM PRIORITY — Feature Enhancements

### 8. Add Missing API Endpoints
| Endpoint | Purpose | Est. Time |
|----------|---------|-----------|
| `GET /api/admin/dashboard-stats` | Dashboard summary data | 1h |
| `GET /api/admin/activity-logs` | Activity log listing | 1h |
| `POST /api/users/forgot-password` | Password reset flow | 2h |
| `POST /api/users/reset-password` | Password reset confirmation | 1h |
| `GET /api/users/profile/:id` | User profile endpoint | 1h |
| `PUT /api/users/profile/:id` | Profile update | 1h |
| `GET /api/notifications` | User notifications | 1h |
| `POST /api/contact-forms` | Contact form submission | 1h |

### 9. Enhance Admin Dashboard
- [ ] Real-time activity feed (WebSocket or polling)
- [ ] Charts for user growth, revenue, project status
- [ ] Quick stats cards (total users, active projects, revenue)
- [ ] Recent activity timeline

### 10. Add Search Functionality
- [ ] Global search across users, projects, content
- [ ] Filterable search results
- [ ] Search API endpoint with pagination

### 11. Implement Notifications System
- [ ] Database table for notifications
- [ ] API endpoints for CRUD
- [ ] Real-time notification bell in admin header
- [ ] Email notifications for critical events

### 12. Add Export Functionality
- [ ] Export users to CSV/Excel
- [ ] Export financial reports to PDF
- [ ] Export activity logs
- [ ] Scheduled report generation

---

## 🟡 MEDIUM PRIORITY — Performance & Optimization

### 13. Database Query Optimization
- [ ] Add database indexes for frequently queried columns
- [ ] Implement query result pagination (limit/offset)
- [ ] Add query logging for slow queries
- [ ] Optimize N+1 queries in admin routes

### 14. Frontend Performance
- [ ] Implement React.lazy() for all admin pages (code splitting)
- [ ] Add skeleton loaders to all data-fetching pages
- [ ] Optimize bundle size (current: 443KB vendor-react)
- [ ] Add service worker for offline capability

### 15. Caching Strategy
- [ ] Extend cache middleware to more routes
- [ ] Add Redis for distributed caching (production)
- [ ] Implement cache warming for critical data
- [ ] Add cache hit/miss metrics

---

## 🟢 LOW PRIORITY — Documentation & DX

### 16. API Documentation Completion
**Current**: Swagger docs exist but only cover health, users, blog
**Plan**:
- [ ] Add JSDoc swagger annotations to all routes
- [ ] Document all request/response schemas
- [ ] Add authentication requirements to docs
- [ ] Generate OpenAPI spec for external tools

### 17. Developer Documentation
- [ ] Add `CONTRIBUTING.md` with coding standards
- [ ] Create `docs/ARCHITECTURE.md` with system diagram
- [ ] Add `docs/DATABASE.md` with schema documentation
- [ ] Create `docs/DEPLOYMENT.md` with deployment guide

### 18. User Documentation
- [ ] Admin user guide (how to use each feature)
- [ ] Department-specific guides
- [ ] FAQ section
- [ ] Video tutorials for complex workflows

---

## 🟢 LOW PRIORITY — Security Hardening

### 19. Additional Security Measures
- [ ] Add CSRF protection for state-changing operations
- [ ] Implement Content Security Policy headers
- [ ] Add request ID tracking for audit trails
- [ ] Implement account lockout after failed attempts
- [ ] Add 2FA/TOTP for admin accounts
- [ ] Encrypt sensitive data at rest (PII fields)

### 20. Security Audit
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Add dependency vulnerability scanning to CI
- [ ] Implement rate limiting per-user (not just IP)
- [ ] Add security headers audit (securityheaders.com)
- [ ] Penetration testing for common vulnerabilities

---

## 🔵 FUTURE — Advanced Features

### 21. Real-time Features
- [ ] WebSocket server for live updates
- [ ] Real-time collaboration on documents
- [ ] Live chat between admin and users
- [ ] Real-time notifications

### 22. Mobile Responsiveness
- [ ] Make admin dashboard mobile-friendly
- [ ] Add touch-friendly controls
- [ ] Responsive tables and forms
- [ ] Mobile navigation menu

### 23. Internationalization (i18n)
- [ ] Add i18n framework (react-i18next)
- [ ] Support for multiple languages
- [ ] Locale-specific date/number formatting
- [ ] Swahili language support (local market)

### 24. Analytics & Reporting
- [ ] User behavior analytics
- [ ] Revenue forecasting
- [ ] Project timeline tracking
- [ ] Custom report builder

### 25. Third-party Integrations
- [ ] Google Workspace integration
- [ ] Slack notifications
- [ ] Zapier webhook support
- [ ] QuickBooks/Xero accounting sync

---

## 📋 Suggested Sprint Plan

### Sprint 6: Testing & Quality (Week 1-2)
- Expand test coverage to 70%+
- Refactor admin.js into smaller modules
- Add validation to all routes
- Standardize API responses

### Sprint 7: Features & Performance (Week 3-4)
- Add missing API endpoints
- Implement search functionality
- Add notifications system
- Optimize database queries
- Implement code splitting

### Sprint 8: Documentation & Security (Week 5-6)
- Complete Swagger docs
- Write developer documentation
- Security audit and hardening
- Add export functionality

### Sprint 9: Advanced Features (Week 7-8)
- Real-time features
- Mobile responsiveness
- Analytics dashboard
- Third-party integrations

---

## 🔍 Research Needed

Before starting each sprint, research:

1. **Testing**: Best practices for testing Express routes with supertest, mocking MySQL
2. **Validation**: Zod schema patterns for complex nested objects
3. **Performance**: React.lazy() with React Router, bundle analysis tools
4. **Security**: CSRF implementation for Express, CSP header configuration
5. **Real-time**: WebSocket vs Socket.io vs Server-Sent Events for this use case
6. **i18n**: react-i18next setup with lazy loading of translations
7. **Export**: Best libraries for CSV/PDF generation in Node.js
8. **Caching**: Redis vs in-memory caching for single-instance deployment

---

## 📁 Key Files to Review

| File | Purpose | Lines |
|------|---------|-------|
| `backend/routes/admin.js` | Main admin routes (needs refactor) | 651 |
| `backend/server.js` | Express server setup | 227 |
| `src/App.tsx` | Main React app + routing | 252 |
| `src/services/api.js` | API service layer | 180 |
| `src/admin/utils/permissions.js` | RBAC system | 318 |
| `backend/middleware/cache.js` | Response caching | 53 |
| `backend/validators/index.js` | Zod schemas | 67 |
| `backend/config/database.js` | MySQL cluster config | 72 |
