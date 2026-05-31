# BuildCheck Monitor

**Construction Inspection and Time Tracking System**

A web-based, mobile-responsive system that replaces manual construction inspection recording with a centralized digital platform. Records structured inspection data, tracks safety/compliance findings, detects violations, and generates detailed reports.

> Workflow (strictly enforced):
> Login → Project Details → Site Inspection → Safety Inspection → Photo Documentation → Processing → Decision → (Violation Handling **OR** Data Storage) → Reporting → End

---

## Tech Stack

**Frontend**

- React 18 (Vite)
- Tailwind CSS
- React Router DOM v6
- Axios
- React Hook Form
- Zustand (state management)

**Backend**

- Node.js + Express.js
- RESTful API
- JWT authentication (jsonwebtoken)
- bcrypt (password hashing)
- Multer (file uploads)
- Joi (input validation)

**Database**

- MySQL 8 (manage via PHPMyAdmin)
- Fully normalized relational schema (foreign keys + indexing)

---

## Project Structure

```
buildcheck-monitor/
├── backend/            Node.js + Express API
│   ├── src/
│   │   ├── config/     DB connection
│   │   ├── middleware/ JWT auth, file upload, error handling
│   │   ├── routes/     auth, projects, inspections, violations, reports
│   │   ├── utils/      validators
│   │   └── server.js
│   ├── uploads/        photo storage (created at runtime)
│   ├── .env.example
│   └── package.json
├── frontend/           React + Vite SPA
│   ├── src/
│   │   ├── api/        axios instance
│   │   ├── components/ shared UI
│   │   ├── pages/      Login, Dashboard, ProjectEntry, InspectionWizard, Reports, ViolationReports
│   │   ├── store/      zustand stores
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── database/
│   └── schema.sql      MySQL schema + seed admin user
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or later
- **npm** v9+
- **MySQL** 8 (with **PHPMyAdmin** for management — XAMPP / WAMP / MAMP all work)

---

## Setup Instructions

### 1. Create the database

1. Open **PHPMyAdmin** (http://localhost/phpmyadmin).
2. Create a new database named `buildcheck_monitor` (collation: `utf8mb4_general_ci`).
3. Select the database → click **Import** → choose `database/schema.sql` → **Go**.

This creates all tables and seeds a default admin user:

- Email: `admin@buildcheck.com`
- Password: `Admin@123`

(You can also run it from a shell):
```bash
mysql -u root -p buildcheck_monitor < database/schema.sql
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your MySQL credentials:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=buildcheck_monitor
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=8h
UPLOAD_DIR=uploads
CORS_ORIGIN=http://localhost:5173
```

Start the API:

```bash
npm run dev    # nodemon (development)
# or
npm start      # production
```

The API runs at **http://localhost:5000**.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

Build for production:
```bash
npm run build
npm run preview
```

---

## Default Credentials

| Role      | Email                   | Password   |
|-----------|-------------------------|------------|
| Admin     | admin@buildcheck.com    | Admin@123  |
| Inspector | inspector@buildcheck.com| Inspector@123 |

The 10 named inspectors from the official roster spreadsheet are also pre-seeded
(e.g. `tjuliano@buildcheck.com`, `labellar@buildcheck.com`, …) — all share the
default password `Inspector@123` and can be reassigned in PHPMyAdmin.

## Pre-Selection Lookup Data

The system ships with two reference lists (sourced from the
`Database_of_Infrastructure_Projects.xlsx` provided with the brief):

- **Locations** (24 CvSU campuses & colleges): Main Campus, Research, CAFENR,
  CAS, CED, CEMDS, CEIT, CON, COM, CSPEAR, CVMBS, CCJ, Graduate School,
  Bacoor City, Cavite City, Imus, Silang, Carmona, Rosario, Naic, General Trias,
  Tanza, Trece Martires, Maragondon Campus.
- **Person-In-Charge roster** (10 inspectors): Trisha Marie I. Juliano,
  Lordley M. Abellar, Sancho B. Bayot, Jr., Elpidio N. Roderos, Jr.,
  Arturo L. Bago, Ryan Janssen R. Sanchez, Rowmar Joshua M. Pascual,
  Marnellie N. Gatdula, Juan N. Rodil, Janelle D. Adsuara.

Both are exposed via lookup endpoints:
- `GET /projects/lookup/locations`
- `GET /projects/lookup/inspectors`

---

## API Reference

All protected endpoints require `Authorization: Bearer <jwt-token>` header.

### Authentication
- `POST /auth/login` — { email, password } → { token, user }
- `POST /auth/register` *(admin only)* — create user

### Projects
- `POST /projects` — create project
- `GET /projects` — list all
- `GET /projects/:id` — get one

### Inspections
- `POST /inspections` — create inspection (multipart for photos)
- `GET /inspections/:projectId` — list by project
- `GET /inspections/detail/:id` — full inspection record

### Violations
- `POST /violations` — log a violation
- `GET /violations/:inspectionId` — list by inspection

### Reports
- `GET /reports/:projectId` — full project report (filterable by date/status)
- `GET /reports/:projectId/pdf` — generated PDF on the client side

---

## Workflow Enforcement

The frontend `InspectionWizard` enforces the strict step order:

1. **Project Details** (must be saved first)
2. **Site Inspection**
3. **Safety & Health Inspection**
4. **Photo Documentation**
5. **Review & Submit**

Each step validates required fields before proceeding. The backend re-validates everything via Joi schemas. Non-compliance, high/critical risk, or detected safety issues automatically trigger the **Violation Workflow**, requiring contractor acknowledgement before storage.

---

## Security

- Passwords hashed with **bcrypt** (10 rounds)
- **JWT** access tokens with role-based authorization (`admin`, `inspector`)
- File upload type/size validation (JPG/PNG, ≤ 5 MB)
- Joi input sanitization on every endpoint
- Parameterized SQL queries (prevents SQL injection)

---

## License

MIT — built for CENG 116B coursework.
