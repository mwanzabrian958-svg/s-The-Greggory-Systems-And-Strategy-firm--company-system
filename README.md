# The Greggory Systems & Strategy Firm — Company System

A full-stack desktop application for a strategy consulting firm. Serves as both a public-facing website and a comprehensive internal management platform with role-based access across multiple departments.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron 25 |
| Frontend | React 18 + TypeScript + Vite |
| Backend | Express 5 (Node.js) |
| Database | MySQL (dual-endpoint: local XAMPP + cloud Aiven) |
| Styling | Tailwind CSS + DaisyUI + Framer Motion |
| Auth | JWT + bcryptjs |
| Charts | Recharts |

## Prerequisites

- Node.js 18+ and npm
- XAMPP (for local MySQL development)
- Git

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/mwanzabrian958-svg/s-The-Greggory-Systems-And-Strategy-firm--company-system.git
cd s-The-Greggory-Systems-And-Strategy-firm--company-system

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# 4. Start XAMPP (Apache + MySQL)

# 5. Initialize the database
node backend/init-db.js

# 6. Launch the full application
npm run start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Launches backend + frontend + Electron together |
| `npm run dev` | Starts dev launcher with XAMPP check |
| `npm run vite` | Frontend dev server only (port 5173) |
| `npm run backend` | Backend API server only (port 5000) |
| `npm run build` | Builds frontend for production |
| `npm run electron` | Runs Electron only (requires built frontend) |
| `npm run lint` | Runs ESLint on src and backend |
| `npm run format` | Runs Prettier on src and backend |

## Project Structure

```
├── main.js                 # Electron entry point
├── preload.js              # Electron preload script (contextBridge)
├── index.html              # HTML entry
├── backend/
│   ├── server.js           # Express API server
│   ├── config/database.js  # MySQL cluster with failover
│   ├── routes/             # API route modules
│   ├── middleware/          # Auth & validation middleware
│   ├── validators/         # Zod validation schemas
│   ├── services/           # Email, M-Pesa, etc.
│   └── utils/              # Helpers (session tokens, etc.)
├── src/
│   ├── App.tsx             # Main React app + routing
│   ├── main.tsx            # React entry point
│   ├── admin/              # Admin dashboard
│   │   ├── AdminRouter.jsx # Admin route definitions
│   │   ├── components/     # Shared UI components
│   │   ├── pages/          # Admin page components
│   │   ├── config/         # Department UI configs
│   │   └── utils/          # Permissions, etc.
│   ├── components/         # Public site components
│   ├── services/           # API service layer
│   └── data/               # Static data
├── modules/                # Reusable modules (blog)
├── database/               # Schema and migration files
└── scripts/                # Dev and setup scripts
```

## Key Features

- **Public Landing Page** — Branded company landing with animated logo
- **Admin Dashboard** — Full internal management system
- **Department Workstations** — 11 departments with dedicated interfaces
- **Employee Role Dashboards** — Role-specific pages for 16+ positions
- **Dual MySQL Failover** — Automatic failover between local XAMPP and cloud Aiven
- **M-Pesa Integration** — Payment processing via Safaricom
- **Blog/Content Management** — Full CRUD for articles and media
- **Financial Management** — Invoicing, accounting entries, P&L reports
- **Role-Based Access Control** — Granular permissions per department/role

## Database Failover

The app uses mysql2's `createPoolCluster` with two MySQL endpoints:

1. **Cloud (Aiven)** — Production database with TLS
2. **Local (XAMPP)** — Development database on localhost

The `DB_PREFER` env variable controls which is tried first. If the primary endpoint fails, it automatically fails over to the secondary.

## Contributing

1. Create a feature branch (`feature/your-feature-name`)
2. Make your changes following existing code conventions
3. Run `npm run lint` and fix any issues
4. Test thoroughly
5. Submit a pull request

## License

Private — All rights reserved.

