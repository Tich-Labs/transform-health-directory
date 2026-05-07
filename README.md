# Transform Health Women Leaders Directory

A project to increase visibility, representation, and engagement of women leaders across leadership, policy, and technical spaces in digital health.

## Project Structure

- **`client/`** — React + Vite frontend application
- **`scripts/`** — One-time migration and utility scripts (includes `create-test-results-table.sql`)
- **`docs/`** — Internal documentation (`admin-manual.md`)
- **`client/public/testing-sheet.html`** — Standalone QA testing checklist (bundled with build)
- **`.github/workflows/`** — GitHub Actions for automatic deployment to GitHub Pages

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + Vite |
| Styling | Tailwind CSS (design tokens in tailwind.config.cjs) |
| Maps | react-simple-maps |
| HTTP | Axios |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage (profile-photos bucket) |
| Auth | Supabase Auth (email/password — currently bypassed in test mode) |
| Deployment | GitHub Pages |

---

## Quick Setup Guide

### Prerequisites

- Node.js 18+
- Supabase account (free tier at [supabase.com](https://supabase.com))
- GitHub account (for hosting)

---

### Step 1: Clone & Install

```bash
git clone https://github.com/Tich-Labs/transform-health-directory.git
cd transform-health-directory
cd client
npm install
```

---

### Step 2: Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com).

2. **Run the schema** to create the `leaders` and `requests` tables:
   - In the Supabase dashboard, go to **SQL Editor**
   - Paste and run the contents of `scripts/schema.sql`

3. **Create the Storage bucket:**
   - Go to **Storage** in the Supabase dashboard
   - Create a bucket named `profile-photos`
   - Set it to **Public** (public read, authenticated write)

4. **Enable Row Level Security:**
   - RLS is already configured in `scripts/schema.sql`
   - Verify: anon key should return only `live` leaders

5. **Note your project credentials:**
   - Go to **Project Settings → API**
   - Copy the **Project URL** and **anon public key**

---

### Step 3: Frontend Environment

```bash
cd client
cp .env.example .env
```

Edit `client/.env` and set:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

### Step 4: Run Migration (if starting fresh)

If you have existing data to migrate from Google Sheets:

```bash
# From the project root
node scripts/migrate-to-supabase.mjs
```

This script reads the existing leader data and inserts it into Supabase. The production migration inserted 82 leaders successfully with RLS verified.

---

### Step 5: Local Development

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

**Manual testing flow:**

1. Open the DATABASE tab — you should see leader cards loading from Supabase (~82 leaders)
2. Submit a test profile via the SUBMIT PROFILE tab
3. Go to ADMIN tab (currently open — no login required in test mode)
4. Approve the test submission — the profile should appear in DATABASE

---

### Step 6: Deploy to GitHub Pages

1. **Add GitHub Actions secrets:**
   - Go to your GitHub repo → **Settings → Secrets and variables → Actions**
   - Add: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Remove any old Firebase or Apps Script secrets if present

2. **Enable GitHub Pages:**
   - Go to **Settings → Pages**
   - Source: **GitHub Actions**
   - The workflow in `.github/workflows/deploy.yml` will auto-deploy on every push to `main`

3. **Push to main:**

   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

---

## Before Going Live (Checklist)

- [ ] Create `test_results` table in Supabase (run `scripts/create-test-results-table.sql`)
- [ ] Re-enable admin auth gate — one-line change in `client/src/pages/Admin.jsx` (currently bypassed for testing)
- [ ] Create admin user in Supabase Auth dashboard (email/password)
- [ ] Update GitHub Actions CI secrets: add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, remove `VITE_APPS_SCRIPT_URL` and Firebase vars
- [ ] Set up Supabase Function for email sending:

  **Supabase Dashboard → Database → Functions**
  1. Create a new function named `send-email`
  2. Copy the code from `supabase/functions/send-email/index.ts`
  3. Deploy: `supabase functions deploy send-email`
  4. Set secrets (Dashboard → Settings → Functions → Secrets):

     **Option A: Google Workspace (FREE for Workspace users)**
     - `GOOGLE_SMTP_USER`: Your Workspace email (e.g. `noreply@transformhealthcoalition.org`)
     - `GOOGLE_SMTP_PASS`: App Password (NOT regular password)
       - Go to Google Account → Security → 2-Step Verification → App Passwords
       - Generate a 16-character app password
     - Host: `smtp.gmail.com`, Port: `587`

     **Option B: SendGrid (paid)**
     - `SENDGRID_API_KEY`: Your SendGrid API key

     **Option C: Generic SMTP**
     - `SMTP_HOST`: Your SMTP host
     - `SMTP_PORT`: Usually `587`
     - `SMTP_USERNAME`: SMTP username
     - `SMTP_PASSWORD`: SMTP password

- [ ] Verify: "Send update link" in Admin → Profile Requests now sends real emails via the Function

---

## Client App — Project Structure

```text
client/src/
├── App.jsx              # Main app with routing and navigation
├── main.jsx             # Entry point
├── supabase.js          # Supabase client initialization
├── api/
│   └── leaders.js       # All Supabase calls: getLeaders, submitProfile, approveRequest,
│                        # checkDuplicateName, getTestResults, etc.
├── components/
│   ├── LeaderCard.jsx   # Profile card (expertise tags title-cased)
│   ├── SiteHeader.jsx   # Top header bar
│   └── SiteFooter.jsx   # Footer
├── pages/
│   ├── Database.jsx     # Public directory with search/filter
│   ├── Submit.jsx       # Multi-step form — centered max-w-[1000px], off-canvas illustration,
│                        # duplicate name check on blur
│   ├── SubmitSteps.jsx  # Step components: Branch, Consent, BasicInfo (country mandatory),
│                        # ProfileDetails (geo scope here), Links
│   ├── ManageProfile.jsx # Update/remove profile flow (requests written to Supabase)
│   ├── Analytics.jsx    # Statistics and world map
│   ├── Admin.jsx        # Admin console — duplicate flag, User Manual button in sidebar footer
│   └── AdminManual.jsx  # TOC-driven single-section user manual (no long scroll)
└── utils/
    └── compressImage.js # Client-side image compression

docs/
└── admin-manual.md      # Markdown source for the admin user manual
```

---

## Admin Console

- Standalone admin route with a dedicated admin header/footer and no public site nav/footer.
- Pending review includes a searchable, filterable list of submissions with expandable detail panels.
- Requests and profile update/delete flows are surfaced in a dedicated Requests tab with inline action buttons.
- All entries view supports sort order, pagination, and status badges for live/pending/rejected.
- The sidebar includes a refresh action and a quick "View directory" link back to the public database.
- Summary metrics surface pending, live, and rejected counts at the top of the console.
- **Currently in test mode — no login required.** Supabase Auth is wired but bypassed. Will be re-enabled before launch.

---

## Legacy: Google Apps Script

The `apps-script/` folder is retained but is **not required for core functionality**. The full backend has moved to Supabase.

Apps Script is still referenced for one action: sending update-link emails to leaders via `MailApp`. This will be replaced with a production SMTP solution before launch.

The Apps Script web app URL (`VITE_APPS_SCRIPT_URL`) is no longer used by the frontend for any data operations.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run format` | Format code with Prettier |
| `node test-dummy-test.js` | Insert a dummy test result into Supabase `test_results` table |

---

## Troubleshooting

| Issue | Solution |
| --- | --- |
| 0 leaders in DATABASE tab | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `client/.env` |
| Supabase returns empty array | Verify RLS is configured — anon key should return only `live` leaders |
| Photo not uploading | Check Supabase Storage bucket `profile-photos` exists and is public-read |
| Admin tab shows login screen | Auth gate has been re-enabled — create an admin user in Supabase Auth dashboard |
| CI/CD failing on GitHub Actions | Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in GitHub repo secrets |
| Migration script fails | Check `SUPABASE_SERVICE_ROLE_KEY` is set — migration requires the service role key, not the anon key |

---

## TODO / Backlog

### Done (Migration Complete — May 2026)

| Task | Status |
| --- | --- |
| Supabase PostgreSQL database — `leaders` + `requests` tables | Done |
| 82 leaders migrated from Google Sheets to Supabase | Done |
| Photo storage — Supabase Storage `profile-photos` bucket wired | Done |
| Photo mandatory on submit (was optional, now enforced) | Done |
| Supabase Auth wired for admin (bypassed in test mode) | Done |
| Firebase removed — `firebase.js` deleted, package removed | Done |
| Mock data removed — `mockData.js` deleted | Done |
| Apps Script removed as backend — `api/leaders.js` fully rewritten | Done |
| Email field added (private, not public) | Done |
| "Other" expertise + 5 selection limit | Done |
| Bio 300-500 chars enforced | Done |
| Countries of operation field (multi-select country picker) | Done |
| Nominator name/email saved and displayed in Admin | Done |
| Analytics: region + specialization combo filtering | Done |
| Analytics: dynamic bar chart, clickable bars | Done |
| Emerging Voices section removed from Analytics | Done |
| Toggle button to hide/show header & footer | Done |
| No-scroll layout in talking-points.html | Done |
| User Journey section added to talking-points.html | Done |
| Testing sheet (testing-sheet.html) with checklist | Done |
| Apps Script: `bulkSeed` function added | Done |
| `scripts/` folder committed (seed scripts) | Done |
| LinkedIn click tracking — `linkedin_clicks` column + Admin filters | Done |
| Admin — Test Results tab (Supabase `test_results` table) | Done |
| Admin Sidebar — reordered (All Entries first, divider before Tests) | Done |
| Testing Sheet — Testing Notes at top, status dropdown fix | Done |
| Production SMTP emails | ⏳ Pending | Apps Script MailApp still used for "send update link"; needs SendGrid/Mailgun/Resend |
| GA4 / Plausible analytics | ⏳ Pending | No analytics service configured |
| Profile modal — wider + better design | ✅ Done | 1200px wide, brand colours, improved spacing |
| Photo storage | ✅ Done | Supabase Storage fully implemented and working |
| Regions of operation field | ✅ Done | Implemented as multi-select country picker |
| Nominations submitter info | ✅ Done | Nominator name/email saved and displayed in Admin Console |

---

## Before Launch

| Task | Notes |
| --- | --- |
| Re-enable admin auth gate | One-line change in `Admin.jsx` |
| Create admin user in Supabase Auth dashboard | Manual step, no code change |
| Update GitHub Actions CI secrets | Add Supabase vars, remove Firebase + Apps Script vars |
| Create `test_results` table in Supabase | Run `scripts/create-test-results-table.sql` in SQL Editor |

---

## Testing

For interactive testing, open `testing-sheet.html` in your browser — it includes test cases across multiple sections with step-by-step instructions, priority indicators, and auto-saved results.

**Test results** are saved to the Supabase `test_results` table and visible in the **Admin Console → "Test Results" tab** (new tab with pass/fail/pending summary cards and full results table).

**⚠️ One-time setup required:** Run `scripts/create-test-results-table.sql` in the Supabase SQL Editor to create the `test_results` table. Until then, the "Save Results Now" button will save locally only.
