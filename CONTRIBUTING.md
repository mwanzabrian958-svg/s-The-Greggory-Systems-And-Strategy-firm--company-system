# Contributing to The Greggory Systems Desktop App

Thank you for contributing! This document covers the coding standards, patterns, and requirements for working on this codebase.

---

## Code Style

### TypeScript / React (Frontend — `src/`)

- **Formatter:** Prettier (`npm run format`). Config in `.prettierrc`.
- **Linter:** ESLint (`npm run lint`). Config in `.eslintrc.cjs`.
- **Key rules:** `eqeqeq: error` (always use `===`), React hooks rules enforced, no unused vars.
- **File naming:** PascalCase for components (`SettingsModal.jsx`), camelCase for utilities/hooks.
- **Component structure:** One component per file. Default-export the component.
- **Styling:** Tailwind CSS utility classes. Merge classes with `tailwind-merge` / `clsx` via the `cn()` helper.
- **State management:** React hooks (`useState`, `useReducer`, `useContext`). Avoid prop drilling beyond 3 levels — use context or lift state.
- **API calls:** Use the shared `apiCall` helper (handles auth headers, error parsing, base URL).

### JavaScript (Backend — `backend/`)

- **Formatter:** Prettier (`npm run format`).
- **Linter:** ESLint with `--ext .ts,.tsx,.js`.
- **No TypeScript in `backend/`** — keep it plain JS unless a specific migration is approved.
- **Module system:** CommonJS (`require`/`module.exports`). The project uses `"type": "module"` at root but backend files use CJS.
- **Error handling:** Use `try/catch` in async routes. Return consistent JSON via `success()`/`error()` helpers.
- **DB queries:** Use `db.promise().query()` for async/await. Avoid raw callback-based `db.query()` in new code.
- **Naming:** camelCase for variables/functions, PascalCase for constructors/classes. Route files: kebab-case (`user-projects.js`).
## Validation Pattern

All POST/PUT routes **must** use Zod validation via the `validate()` middleware from `backend/validators/index.js`.

### How to add validation to a new route

1. Add a Zod schema in `backend/validators/index.js` (or extend an existing one).
2. Import `validate` and the schema in the route file:
   ```js
   const { validate, mySchema } = require('../validators');
   ```
3. Apply the middleware **before** the route handler:
   ```js
   router.post('/', validate(mySchema), async (req, res) => { ... });
   ```
4. The `validate()` middleware automatically returns `400` with `{ success: false, message: 'Validation failed', errors: [...] }` on failure.

### Existing schemas

| Schema | Used by |
|--------|---------|
| `loginSchema` | `POST /api/users/login` |
| `registerSchema` | `POST /api/users/register` |
| `blogSchema` | `POST/PUT /api/blog-articles` |
| `projectSchema` | `POST/PUT /api/user-projects` |
| `mpesaStkSchema` | `POST /api/mpesa/stkpush` |
| `smsBulkSchema` | `POST /api/sms/send-bulk` |
| `messageSchema` | `POST /api/sms/send`, `POST /api/sms/send-all` (local, in sms.js) |
| `whatsappBulkSchema` | `POST /api/whatsapp/send-bulk` |
| `contentSchema` | `POST/PUT /api/content` |
| `contactFormSchema` | `POST /api/contact-forms` |
| `managementSchema` | `PUT /api/management/:companyId` |

---

## Response Format

All API responses must use the `success()` and `error()` helpers from `backend/utils/responseHelper`.

### `success(res, data, statusCode?)`

```js
// Default 200
return success(res, { message: 'Created', id: 1 });

// Custom status (e.g. 201 for creation)
return success(res, { message: 'Created', id: 1 }, 201);
```

Produces:
```json
{
  "success": true,
  "message": "Created",
  "id": 1
}
```

### `error(res, message, statusCode?)`

```js
// Default 400
return error(res, 'Validation failed');

// Custom status
return error(res, 'Not found', 404);
```

Produces:
```json
{
  "success": false,
  "message": "Not found"
}
```

### Rules

- **Never** return raw `res.json(...)` or `res.send(...)` in new code — always use `success()`/`error()`.
- **Never** mix `{ success: true }` with `{ success: false }` shapes — keep them consistent.
- Validation errors from `validate()` already use the standard format.

---

## Testing Requirements

### Backend tests (`backend/__tests__/`)

- **Framework:** Vitest + Supertest.
- **Pattern:** Use `request(app)` (in-process) — never hit a live server.
- **File naming:** `<route-name>.test.js`.
- **Run:** `npm test` (DB tests opt-in via `RUN_DB_TESTS=1`).

### Frontend tests (`src/__tests__/`)

- **Framework:** Vitest + React Testing Library + jest-dom.
- **File naming:** `<component-name>.test.tsx`.

### Before submitting

1. `npm run format` — all clean.
2. `npm run lint` — exit 0.
3. `npm test` — all pass, 0 failures.

---

## Project Structure

```
backend/
  routes/     — Express routers
  validators/ — Zod schemas + validate() middleware
  utils/      — responseHelper, notificationHelper, activityLogFormatter, sessionToken
  services/   — M-Pesa, SMS, WhatsApp, email
  middleware/ — auth, cache, rate limiting
  config/     — database config
  docs/       — Swagger/OpenAPI
  __tests__/  — Backend tests

src/
  admin/        — Admin panel
  components/   — Shared React components
  pages/        — Client-facing pages
  __tests__/    — Frontend tests
```

