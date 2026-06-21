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
| Database | Supabase (PostgreSQL) — currently on **Free Tier** (see [docs/TRANSFER_CHECKLIST.md#8-supabase-free-tier--features--limitations](docs/TRANSFER_CHECKLIST.md)) |
| File Storage | Supabase Storage (profile-photos bucket) |
| Auth | Supabase Auth (email/password — login required for all admin access) |
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
VITE_ADMIN_CC_EMAIL=name@yourorg.org
VITE_ADMIN_NOTIFY_EMAIL=noreply@yourorg.org
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
3. Go to ADMIN tab — sign in with your Supabase admin account
4. Approve the test submission — the profile should appear in DATABASE

---

### Step 6: Deploy to GitHub Pages

1. **Add GitHub Actions secrets:**
   - Go to your GitHub repo → **Settings → Secrets and variables → Actions**
   - Add all four secrets:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_ADMIN_CC_EMAIL`
     - `VITE_ADMIN_NOTIFY_EMAIL`
   - Remove any old Apps Script secrets if present

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

- [x] Admin auth gate active — login required (`client/src/pages/Admin.jsx`)
- [x] Admin user created in Supabase Auth (`noreply@transformhealthcoalition.org`)
- [x] GitHub Actions secrets set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_CC_EMAIL`, `VITE_ADMIN_NOTIFY_EMAIL`
- [x] Edge Function secrets set: `APPS_SCRIPT_URL`, `MAGIC_LINK_SECRET`, `ADMIN_NOTIFY_EMAIL`
- [ ] Set up email system for magic-link profile management:

  The self-service magic link flow lets leaders update or delete their own profiles with no account or password:
  1. Leader clicks "Manage your profile" on the site
  2. Enters name and email → system finds their profile
  3. Chooses "Update profile" or "Remove profile"
  4. A signed magic link is generated server-side and emailed directly to them (no admin involved)
  5. Leader clicks the link → signature verified server-side → edit or delete form shown
  6. Changes save directly to the database — no admin approval needed

  **What the client needs to configure** (in Supabase Dashboard → Settings → Edge Functions → Secrets):
  - `APPS_SCRIPT_URL` — Google Apps Script Web App URL (no SMTP credentials needed — Apps Script uses `MailApp.sendEmail()` directly)
  - `MAGIC_LINK_SECRET` — HMAC signing key, generate with `openssl rand -hex 32`
  - `ADMIN_NOTIFY_EMAIL` — address that receives a notification when a leader self-updates or self-deletes

  The `self-service` Edge Function at `supabase/functions/self-service/` handles token generation, token verification, and email sending. Two Edge Functions total in the project (`self-service` + `manage-admin`), within the Supabase free tier limit of 2.

- [ ] Verify: Trigger a magic link from the site's "Manage your profile" flow and confirm the leader receives the email

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
└── admin-manual.md      # Markdown source for the admin user manual (also rendered in-app)
```

---

## Admin Console

- Standalone admin route with a dedicated admin header/footer and no public site nav/footer.
- Pending review includes a searchable, filterable list of submissions with expandable detail panels.
- Requests and profile update/delete flows are surfaced in a dedicated Requests tab with inline action buttons.
- All entries view supports sort order, pagination, and status badges for live/pending/rejected.
- The sidebar includes a refresh action and a quick "View directory" link back to the public database.
- Summary metrics surface pending, live, and rejected counts at the top of the console.
- Admin auth gate is active — login required. Admin user: `noreply@transformhealthcoalition.org` (created in Supabase Auth dashboard).

---

## Email Delivery

Email sending uses the `self-service` Supabase Edge Function (`supabase/functions/self-service/`) which proxies through a Google Apps Script Web App. The same function also handles magic link token generation and verification — consolidating all public self-service operations into one function to stay within the Supabase free tier limit of 2 Edge Functions.

```
requestManage() → invoke("self-service", { action: "send-email", to, subject, html })
                → fetch(APPS_SCRIPT_URL) → Google Apps Script → Google Workspace send

Magic link click → invoke("self-service", { action: "verify", token })
                 → HMAC signature + expiry check → { ok, leaderId, mode }
```

Three secrets are required in Supabase Dashboard → Settings → Edge Functions → Secrets:

- `APPS_SCRIPT_URL` — Google Apps Script Web App URL (no SMTP credentials needed)
- `MAGIC_LINK_SECRET` — HMAC-SHA256 signing key for self-service tokens
- `ADMIN_NOTIFY_EMAIL` — address notified on every self-service update or deletion

The `apps-script/` folder contains the Apps Script source (`Code.gs`) — deploy it as a Web App under Transform Health's Google account.

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

### Completed (May–June 2026)

| Task | Status |
| --- | --- |
| Supabase migration — PostgreSQL, Storage, Auth, Edge Functions | ✅ Done |
| 82+ leaders live in Supabase | ✅ Done |
| Self-service magic-link profile management (update + delete) | ✅ Done |
| Photo upload with client-side compression | ✅ Done |
| Interactive Analytics page (world map, region + specialisation filters) | ✅ Done |
| LinkedIn click tracking with Admin filters | ✅ Done |
| Admin Console — full feature set (submissions, requests, nominations, test results) | ✅ Done |
| In-app Admin Manual with Product Report section | ✅ Done |
| CI/CD — GitHub Actions auto-deploy to GitHub Pages | ✅ Done |

### Pending

| Task | Notes |
| --- | --- |
| GA4 / Plausible analytics | No analytics service configured yet |
| Re-enable admin auth gate | One-line change + create admin user in Supabase Auth |
| Country-level map drilldown | Analytics map supports region-level only |

---

## Testing

For interactive testing, open `testing-sheet.html` in your browser — it includes test cases across multiple sections with step-by-step instructions, priority indicators, and auto-saved results.

**Test results** are saved to the Supabase `test_results` table and visible in the **Admin Console → "Test Results" tab** (new tab with pass/fail/pending summary cards and full results table).
