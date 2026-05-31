# BuildCheck Monitor — User Testing Guide

This guide walks you through end-to-end testing of every module with concrete sample inputs. Follow the steps in order — they mirror the strict workflow:

> Login → Project Details → Site Inspection → Safety Inspection → Photo Documentation → Processing → Decision → (Violation OR Storage) → Reporting → End

You will run **two test scenarios**:

- **Scenario A — Compliant inspection** (no violation triggered)
- **Scenario B — Non-compliant inspection** (violation workflow triggered)

---

## 0. Prerequisites

- MySQL is running and `database/schema.sql` has been imported into `buildcheck_monitor`.
- Backend running: `cd backend && npm run dev` → http://localhost:5000
- Frontend running: `cd frontend && npm run dev` → http://localhost:5173

Open http://localhost:5173 in your browser (Chrome/Edge/Firefox). Mobile view: use DevTools → Toggle Device Toolbar to test responsiveness.

---

## 1. Login Module Test

### Test 1.1 — Invalid credentials
| Field    | Value                       |
|----------|-----------------------------|
| Email    | `wrong@example.com`         |
| Password | `wrongpass`                 |

**Expected:** Red error banner: "Invalid credentials". Stay on login page.

### Test 1.2 — Inspector login (Scenario A user)
| Field    | Value                          |
|----------|--------------------------------|
| Email    | `inspector@buildcheck.com`     |
| Password | `Inspector@123`                |

**Expected:** Redirect to **Dashboard**. Header shows "Field Inspector" / role: inspector.

### Test 1.3 — Admin login
| Field    | Value                       |
|----------|-----------------------------|
| Email    | `admin@buildcheck.com`      |
| Password | `Admin@123`                 |

**Expected:** Redirect to Dashboard, role: admin.

---

## 2. Project Details Module Test

Click **+ New Project** on the dashboard.

### Test 2.1 — Validation: blank submission
Click **Save & Continue** without filling anything.
**Expected:** Red "Required" messages under each required field. No submission.

### Test 2.2 — Validation: invalid date order
Use these inputs:

| Field                       | Value                                   |
|-----------------------------|-----------------------------------------|
| Start Date                  | `2026-12-01`                            |
| Target Completion Date      | `2026-06-01` (earlier than start)       |

**Expected:** Error "Must be on or after start date".

### Test 2.3 — Valid project (use this for Scenario A)

| Field                          | Value                                              |
|--------------------------------|----------------------------------------------------|
| Year                           | `2026`                                             |
| Reference Number               | `2026-001`                                         |
| Project Name                   | `Construction of Five-Storey CEMDS Building Phase 2`|
| Project Location               | `CEMDS` (from dropdown)                            |
| Person-In-Charge               | `Trisha Marie I. Juliano` (from roster)            |
| Contractor                     | `R.M. Mangubat Construction`                       |
| Mode of Procurement            | `Public Bidding`                                   |
| Funding Source                 | `Fund 101 — General Appropriations Act 2026`       |
| Project Status                 | `Ongoing`                                          |
| Duration                       | `270 calendar days`                                |
| Approved Budget — ABC (₱)      | `30500000`                                         |
| Contract Amount (₱)            | `30200000`                                         |
| Variation Orders (₱)           | `150000`                                           |
| Revised Contract Amount (₱)    | `30350000`                                         |
| Date of Start                  | `2026-04-01`                                       |
| Target Date of Completion      | `2026-12-27`                                       |
| Revised Expiry Date            | `2027-01-15`                                       |

Click **Save & Continue →**.
**Expected:** Project saved → automatically redirected to **Step 2 — Site Inspection**, project name shown in header.

### Test 2.4 — Second project (use later for Scenario B)

| Field                          | Value                                              |
|--------------------------------|----------------------------------------------------|
| Year                           | `2026`                                             |
| Reference Number               | `2026-002`                                         |
| Project Name                   | `Concreting of Internal Road Network — Naic Campus`|
| Project Location               | `Naic Campus`                                      |
| Person-In-Charge               | `Lordley M. Abellar`                               |
| Contractor                     | `480 Builders`                                     |
| Mode of Procurement            | `Small Value Procurement`                          |
| Funding Source                 | `Fund 164 — Special Trust Fund`                    |
| Project Status                 | `Ongoing`                                          |
| Duration                       | `120 calendar days`                                |
| Approved Budget — ABC (₱)      | `5000000`                                          |
| Contract Amount (₱)            | `4850000`                                          |
| Variation Orders (₱)           | `0`                                                |
| Revised Contract Amount (₱)    | `4850000`                                          |
| Date of Start                  | `2026-03-15`                                       |
| Target Date of Completion      | `2026-07-12`                                       |
| Revised Expiry Date            | `2026-07-30`                                       |

---

## 3. SCENARIO A — Compliant Inspection (no violation)

After saving the first project (2.3), you should already be on Step 2.

### Step 2 — Site Inspection (Scenario A)

| Field                  | Value                                              |
|------------------------|----------------------------------------------------|
| Date & Time            | (auto-filled to current timestamp — accept)        |
| Weather                | `Sunny`                                            |
| Activities (multi)     | ✔ Foundation Works, ✔ Concrete Pouring, ✔ Rebar Installation |
| **Manpower** rows      |                                                    |
|   1                    | Skilled Workers — `15`                             |
|   2 (+ Add Row)        | Laborers — `22`                                    |
|   3 (+ Add Row)        | Engineers — `2`                                    |
|   4 (+ Add Row)        | Safety Officers — `1`                              |
| **Equipment** rows     |                                                    |
|   1                    | Good — `Concrete mixer operating normally`         |
|   2 (+ Add Equipment)  | Excellent — `Backhoe with valid inspection sticker`|
| Site Cleanliness       | `Clean`                                            |
| Compliance with Plans  | `Fully Compliant`                                  |

Click **Continue →**.
**Expected:** Move to Step 3. (Compliance remarks field is hidden because compliance = Fully Compliant.)

### Step 3 — Safety Inspection (Scenario A)

**General Safety Items** (default rows; edit values):

| # | Item                                | Status      | Remarks |
|---|-------------------------------------|-------------|---------|
| 1 | Workers wearing complete PPE        | Compliant   |         |
| 2 | Safety signage installed            | Compliant   |         |
| 3 | Emergency exits accessible          | Compliant   |         |
| 4 | First aid kit available             | Compliant   |         |

**Risk Areas** (1 row):

| Risk Type            | Risk Level | Measures                              |
|----------------------|------------|---------------------------------------|
| Working at Heights   | `Low`      | `Safety harness and guardrails in use`|

**Environmental Items** (default 3 rows; values):

| Item                                | Status         | Remarks |
|-------------------------------------|----------------|---------|
| Dust control measures in place      | Satisfactory   |         |
| Proper waste disposal observed      | Satisfactory   |         |
| Noise control measures implemented  | Satisfactory   |         |

Overall Safety Assessment: `Good`

Click **Continue →**.

### Step 4 — Photo Documentation (Scenario A)

- Upload **2 sample JPG/PNG photos** (any construction images you have, each < 5MB).
- **Test 4.1 — File-type rejection:** Try to upload a `.pdf` or `.txt` → Expect alert: "Some files were rejected".
- Click **Continue →**.

### Step 5 — Review & Submit (Scenario A)

- Verify the summary shows your project, weather "Sunny", activities, manpower totals, "Good" assessment, and **2 photos attached**.
- Click **Submit Inspection**.
- **Expected:** Alert "Inspection saved successfully!" → redirected to **Reports** for that project.
- **No violation form should appear** (because everything is compliant).

---

## 4. SCENARIO B — Non-Compliant Inspection (violation workflow)

Go to **Dashboard** → click **New Inspection** on the second project (City Road Concreting). The wizard skips Step 1 (project already saved) and starts at Step 2.

### Step 2 — Site Inspection (Scenario B)

| Field                  | Value                                              |
|------------------------|----------------------------------------------------|
| Date & Time            | accept default                                     |
| Weather                | `Rainy`                                            |
| Activities             | ✔ Road Works, ✔ Excavation Works                   |
| Manpower               | Laborers — `30`; Equipment Operators — `4`         |
| Equipment              | `Needs Maintenance` — `Compactor making unusual noise` |
| Site Cleanliness       | `Needs Improvement`                                |
| **Compliance**         | **`Non-Compliant`**                                |
| Compliance Remarks *   | `Subgrade thickness below specification on station 0+050 to 0+080.` |

Click **Continue →**.
**Test 4B.1 — Required remark:** If compliance is "Non-Compliant" and you leave Remarks blank, you should see "Required" error.

### Step 3 — Safety Inspection (Scenario B)

**General Safety:**

| Item                            | Status            | Remarks                          |
|---------------------------------|-------------------|----------------------------------|
| Workers wearing complete PPE    | `Non-Compliant`   | `2 workers without hard hats observed` |
| Safety signage installed        | Compliant         |                                  |
| Emergency exits accessible      | Compliant         |                                  |
| First aid kit available         | Compliant         |                                  |

**Risk Areas:**

| Risk Type            | Risk Level    | Measures                                       |
|----------------------|---------------|------------------------------------------------|
| Excavation Area      | **`High`**    | `Trench shoring required; barricades installed`|
| Heavy Equipment Zone | Moderate      | `Spotter assigned to all reversing equipment`  |

**Environmental:**

| Item                              | Status               | Remarks                       |
|-----------------------------------|----------------------|-------------------------------|
| Dust control measures in place    | `Needs Improvement`  | `Water truck delayed`         |
| Proper waste disposal observed    | Satisfactory         |                               |
| Noise control measures implemented| Satisfactory         |                               |

Overall Safety Assessment: `Needs Immediate Attention`

Click **Continue →**.

### Step 4 — Upload 1 photo, then Continue.

### Step 5 — Review & Submit (Scenario B)

Click **Submit Inspection**.
**Expected:** The amber **⚠ Violation Workflow Triggered** screen appears (because compliance is Non-Compliant, PPE is Non-Compliant, risk level is High, and overall = Unsafe-tier).

### Violation Form

| Field                | Value                                                                       |
|----------------------|-----------------------------------------------------------------------------|
| Violation Description | `Subgrade thickness on Sta. 0+050–0+080 is 12 cm vs. required 15 cm; two laborers observed without hard hats in active excavation zone.` |
| Corrective Actions   | `(1) Re-excavate and re-compact subgrade to 15 cm and submit re-test report. (2) Conduct toolbox meeting on PPE compliance and issue replacement hard hats by EOD.` |
| Contractor Remarks   | `Acknowledged. Re-work scheduled for tomorrow shift; PPE replenished.`      |
| ✔ Acknowledgement     | **Check the box**                                                           |

**Test 5B.1 — Block missing acknowledgement:** Leave checkbox unchecked → click Submit → alert "Contractor acknowledgement is required."

Now check the box and click **Submit Violation & Finish**.
**Expected:** Alert "Violation recorded with contractor acknowledgement." → redirect to Reports page.

---

## 5. Reports Module Test

Open **Reports** from the nav (or the redirect from above).

### Test 5.1 — Project selection & summary
- Select **Concreting of Internal Road Network — Naic Campus**.
- Top cards should show: 1 inspection, 1 violation, 1 acknowledged.
- "Inspection History" table should list the inspection with weather "Rainy", compliance "Non-Compliant", assessment "Needs Immediate Attention".

### Test 5.2 — Filtering
| Filter | Value                                   | Expected                |
|--------|-----------------------------------------|-------------------------|
| From   | `2030-01-01`                            | 0 inspections shown     |
| From   | (clear)                                 | All inspections back    |
| Status | `Pending`                               | 0 inspections shown     |
| Status | `Completed`                             | All inspections shown   |

### Test 5.3 — Detailed view
Click **Detailed** tab.
- The non-compliant inspection should show a **red bordered "Violations"** block with the description, corrective action, and "Acknowledged: ✓ Yes".
- Photos should appear as a thumbnail grid.

### Test 5.4 — PDF Export
Click **Export PDF**.
**Expected:** Browser downloads `buildcheck-report-<project-name>.pdf` containing project info, summary, and per-inspection details with violations.

### Test 5.5 — Compliant project report
- Switch project to **Construction of Five-Storey CEMDS Building Phase 2**.
- Should show: 1 inspection, 0 violations, 0 acknowledged. Detailed view shows no red violation block.

---

## 6. Violation Reports Page Test

(Direct URL: http://localhost:5173/violations — currently linked from the page itself; you can also visit it manually.)

- Select **Concreting of Internal Road Network — Naic Campus**.
- One violation card appears with green pill **✓ Acknowledged**.
- Create another non-compliant inspection (repeat Scenario B briefly) but **uncheck** acknowledgement → it appears here with amber **Pending Acknowledgement** pill and an **Acknowledge** button.
- Click **Acknowledge**, type any remark in the prompt, OK → pill turns green.

---

## 7. Authentication & Authorization Test

### Test 7.1 — Logout
Click **Logout** in the header → redirected to login page. Try visiting http://localhost:5173/ → bounced back to login.

### Test 7.2 — Token persistence
Login again → close and re-open the tab → you should still be logged in (token is persisted in localStorage).

### Test 7.3 — Admin-only registration (via API)

Login as admin first to get a token, then in another terminal:

```bash
TOKEN="<paste-jwt-from-localStorage-or-login-response>"

# As admin — should succeed
curl -X POST http://localhost:5000/auth/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@buildcheck.com",
    "password": "Maria@2026",
    "role": "inspector"
  }'
```

**Expected:** `201 Created` with the new user.
Now login as the inspector and try the same call → **403 Forbidden**.

---

## 8. Mobile Responsiveness Test

- Open Chrome DevTools → Toggle Device Toolbar → choose **iPhone 14 Pro**.
- Verify:
  - Header collapses cleanly (logo + nav wrap)
  - Project Details form stacks to single column
  - Inspection wizard checklist grids reflow to 2 columns
  - Step indicator wraps without overlap
  - Tables in Reports become horizontally scrollable

---

## 9. Database Verification (PHPMyAdmin)

After running both scenarios, open PHPMyAdmin → `buildcheck_monitor` and confirm row counts:

| Table            | Expected (after both scenarios) |
|------------------|---------------------------------|
| `users`          | 2 (or more if you registered)   |
| `projects`       | 2                               |
| `inspections`    | 2                               |
| `activities`     | 5 (3 + 2)                       |
| `manpower`       | 6 (4 + 2)                       |
| `equipment`      | 3 (2 + 1)                       |
| `safety_general` | 8 (4 + 4)                       |
| `safety_risk`    | 3 (1 + 2)                       |
| `environmental`  | 6 (3 + 3)                       |
| `photos`         | 3 (2 + 1)                       |
| `violations`     | 1                               |

Run a quick check in PHPMyAdmin SQL tab:

```sql
SELECT
  (SELECT COUNT(*) FROM projects)       AS projects,
  (SELECT COUNT(*) FROM inspections)    AS inspections,
  (SELECT COUNT(*) FROM violations)     AS violations,
  (SELECT COUNT(*) FROM photos)         AS photos;
```

---

## 10. Decision Logic Truth Table

The system triggers the violation workflow when **any** of these is true:

| Condition                                               | Triggers? |
|---------------------------------------------------------|-----------|
| `compliance_status = "Non-Compliant"`                   | ✅        |
| Any general-safety item with `status = "Non-Compliant"` | ✅        |
| Any risk area with `risk_level = "High"` or `"Critical"`| ✅        |
| `overall_assessment = "Unsafe Condition"`               | ✅        |
| All items satisfactory and compliant                    | ❌        |

You can verify this by editing only ONE field at a time in Scenario A and checking whether the violation screen appears.

---

## ✅ Test Completion Checklist

- [ ] 1. Login with bad and good credentials
- [ ] 2. Project creation with validation
- [ ] 3. Scenario A — fully compliant inspection submitted
- [ ] 4. Scenario B — non-compliant inspection + violation workflow + acknowledgement
- [ ] 5. Reports filter, summary view, detailed view, PDF export
- [ ] 6. Violation Reports page acknowledgement
- [ ] 7. Logout and token persistence
- [ ] 8. Admin-only registration (403 for inspector)
- [ ] 9. Mobile-responsive verification
- [ ] 10. Database row counts match expectations

If every item above passes, the system meets the documented functional, security, and workflow requirements.
