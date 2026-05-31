# BuildCheck Monitor — Free Live Deployment Guide

Deploy BuildCheck Monitor for **$0/month** using three services:

| Service | Role | Free Tier |
|---|---|---|
| **TiDB Cloud** | MySQL database (serverless) | 5 GB storage, no credit card, no expiry |
| **Render** | Node.js backend API | 750 hrs/month (sleeps after 15 min inactivity) |
| **Netlify** | React frontend | Unlimited sites, 100 GB bandwidth/month |

> **Estimated time:** 30–45 minutes.

---

## Step 1 — Set Up TiDB Cloud (Database)

1. Go to [https://tidbcloud.com](https://tidbcloud.com) and create a free account.
2. Click **Create Cluster** → choose **Serverless** → pick any region → click **Create**.
3. Wait ~30 seconds for the cluster to provision.
4. Click your cluster → **Connect** → **General** tab.
5. Note down these values (you'll need them in Step 2):
   - **Host** (looks like `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
   - **Port** (usually `4000`)
   - **Username** (looks like `yourname.root`)
   - **Password** (click **Generate password** and copy it somewhere safe)
6. Open the **SQL Editor** tab (or **Chat2Query**) to run the schema:
   - Open `database/schema.sql` from this project.
   - Paste the entire contents into the editor and click **Run**.
   - This creates the `buildcheck_monitor` database and all tables.
7. Optionally seed a first admin user — see the tip at the end of this guide.

> **TiDB & SSL:** TiDB Cloud requires SSL connections. The `db.js` config handles
> this automatically when `DB_HOST` is not `localhost`.
> Add `ssl: { rejectUnauthorized: true }` to the pool config if you get SSL errors
> (see the Common Issues section below).

---

## Step 2 — Deploy the Backend on Render

1. Go to [https://render.com](https://render.com) and sign up (free).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and push the **entire project** (or just the `backend/` folder)
   to a GitHub repository, then select it.
4. Fill in the service form:
   - **Name:** `buildcheck-api` (or any name you like)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Scroll to **Environment Variables** and add each of the following:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `DB_HOST` | *(your TiDB host from Step 1)* |
   | `DB_PORT` | `4000` |
   | `DB_USER` | *(your TiDB username)* |
   | `DB_PASSWORD` | *(your TiDB password)* |
   | `DB_NAME` | `buildcheck_monitor` |
   | `JWT_SECRET` | *(a long random string — see tip below)* |
   | `JWT_EXPIRES_IN` | `24h` |
   | `CORS_ORIGIN` | *(leave blank for now; fill in after Step 3)* |

   > **Tip — Generate a JWT secret:** Open any terminal and run:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   > ```
   > Copy the output and paste it as `JWT_SECRET`. Keep this value constant — changing it
   > invalidates all active login sessions.

6. Click **Create Web Service**. Render will build and deploy (~2 minutes).
7. Copy your Render URL — it looks like `https://buildcheck-api.onrender.com`.
   Test it: open `https://buildcheck-api.onrender.com/health` — you should see:
   ```json
   { "ok": true, "name": "BuildCheck Monitor API" }
   ```

---

## Step 3 — Deploy the Frontend on Netlify

### A. Create the Netlify redirect file

Netlify needs to know how to proxy `/api/*` requests to your Render backend.
Inside the `frontend/` folder, create a file named **`netlify.toml`** with this content
(replace the URL with your actual Render URL from Step 2):

```toml
[[redirects]]
  from = "/api/*"
  to   = "https://buildcheck-api.onrender.com/:splat"
  status = 200
  force  = true

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```

> The first rule proxies API calls and **strips the `/api` prefix** (`:splat` captures
> everything after `/api/`), matching how the backend routes are defined.
> The second rule enables React Router's client-side navigation.

### B. Build the frontend locally

In the `frontend/` folder, run:

```bash
npm install
npm run build
```

This creates a `frontend/dist/` folder — that's what you deploy.

### C. Deploy to Netlify

**Option 1 — Drag & Drop (quickest, no account setup):**

1. Go to [https://app.netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually**.
2. Drag the entire `frontend/dist/` folder into the drop zone.
3. Done! Netlify gives you a URL like `https://amazing-name-123.netlify.app`.

**Option 2 — Git deploy (auto-deploys on every push):**

1. Push your project to GitHub.
2. Go to [https://app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
3. Pick your repo and configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**.

### D. Update CORS on Render

1. Go back to your Render dashboard → your `buildcheck-api` service → **Environment**.
2. Set `CORS_ORIGIN` to your Netlify URL exactly as shown — no trailing slash:
   ```
   https://amazing-name-123.netlify.app
   ```
3. Click **Save Changes** — Render redeploys automatically (~1 minute).

---

## Step 4 — Verify Everything Works

1. Open your Netlify URL in a browser.
2. Log in (see "Seeding an Admin User" below if you haven't created one yet).
3. Navigate through all pages — Dashboard, New Project, Inspection, Reports.
4. Test the PDF export on the Reports page.
5. Test on a real phone or use browser DevTools → Toggle device toolbar.

---

## Seeding an Admin User

TiDB Cloud does not ship with any users. After running `schema.sql`, insert one via
the SQL Editor:

```sql
USE buildcheck_monitor;

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin',
  'admin@example.com',
  '$2b$10$yourHashHere',   -- see note below
  'admin'
);
```

> **Generating a bcrypt hash:** The backend uses `bcryptjs`. Run this locally:
> ```bash
> node -e "const b=require('bcryptjs'); b.hash('YourPassword123', 10).then(console.log)"
> ```
> Copy the output hash into the SQL above.

---

## Common Issues & Fixes

| Problem | Fix |
|---|---|
| **Backend returns 502 or sleeps on first visit** | Render free tier sleeps after 15 min of inactivity. The first request wakes it (~30 s delay). This is normal. |
| **CORS error in browser console** | Make sure `CORS_ORIGIN` on Render exactly matches your Netlify URL — no trailing slash, no `http` vs `https` mismatch. |
| **Database connection refused** | Double-check `DB_HOST`, `DB_PORT` (must be `4000`), `DB_USER`, and `DB_PASSWORD` in Render env vars. |
| **`SSL: CERTIFICATE_VERIFY_FAILED` or similar** | TiDB Cloud requires SSL. Add `ssl: { rejectUnauthorized: true }` to the `createPool` config in `backend/src/config/db.js`. |
| **Login returns 401** | `JWT_SECRET` must be identical on every deploy. Set it once and never change it while users are logged in. |
| **White screen / 404 on page refresh** | Make sure `netlify.toml` (with the `/*` → `/index.html` redirect) is inside the `frontend/` folder and included in the build. |
| **API calls return 404 on Netlify** | Check that the `netlify.toml` redirect `to` URL exactly matches your Render service URL and has no trailing slash. |
| **File uploads don't persist** | Render's free tier has an ephemeral filesystem — uploaded photos are lost on redeploy. For production, store uploads in Cloudinary or AWS S3. |

---

## Optional — Custom Domain

1. Buy a domain at Namecheap, Cloudflare Registrar, etc.
2. In Netlify → Site settings → **Domain management** → **Add custom domain**.
3. Follow Netlify's DNS instructions (usually < 1 hour to propagate).
4. Update `CORS_ORIGIN` on Render to your custom domain.

---

## Local Development (without TiDB)

Run with a local MySQL database:

```bash
# Terminal 1 — Backend
cd backend
# Create a .env file:
echo "NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=buildcheck_monitor
JWT_SECRET=devsecret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173" > .env

npm install
npm start

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:5000` automatically
(configured in `vite.config.js`), stripping the `/api` prefix to match backend routes.

---

## Architecture Summary

```
Browser (Netlify CDN)
   │
   ├── Static files: React app (HTML/JS/CSS)
   │
   └── /api/* requests
         │  (Netlify redirects → strips /api prefix)
         ▼
   Render (Node.js / Express)
   ├── /auth          — login, register
   ├── /projects      — CRUD projects
   ├── /inspections   — inspection wizard
   ├── /violations    — violation tracking
   ├── /reports       — report generation
   └── /health        — health check
         │
         ▼
   TiDB Cloud (MySQL-compatible, serverless)
   └── buildcheck_monitor database
```

---

*BuildCheck Monitor — Construction Inspection & Compliance Tracking System*
