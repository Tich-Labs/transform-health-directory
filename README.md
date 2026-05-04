# Transform Health Women Leaders Directory

A project to increase visibility, representation, and engagement of women leaders across leadership, policy, and technical spaces in digital health.

## Project Structure

- **`client/`** — React + Vite frontend application
- **`apps-script/`** — Google Apps Script backend for Google Sheets integration (deploy docs: [apps-script/README_DEPLOY.md](./apps-script/README_DEPLOY.md))
- **`.github/workflows/`** — GitHub Actions for automatic deployment to GitHub Pages

---

## 🚀 Quick Setup Guide (For Handover)

### Prerequisites
- Node.js 18+ installed
- Google account (for Sheets + Apps Script)
- Firebase project (for profile photo storage)
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

### Step 2: Google Sheets + Apps Script Setup

1. **Create a new Google Sheet** (this will store all leader profiles)
   - Name it: `Transform Health Directory - Live`
   - Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

2. **Create Apps Script project:**
   - In the Google Sheet, go to **Extensions → Apps Script**
   - Paste the code from `apps-script/Code.gs`
   - Click **Project Settings (gear icon) → Script Properties**
   - Add these properties:
     ```
     TARGET_SHEET_ID   = 1ElqmE1NDvhSNrGPPcTU67g_ndKxsZs68FRn04yus4C0
     ADMIN_PASSWORD    = {choose a secure admin password}
     SITE_URL          = {your deployed site URL, e.g. https://yourname.github.io/transform-health-directory}
     ```

3. **Deploy the Apps Script:**
   - Click **Deploy → New Deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (this allows the frontend to call it)
   - Copy the **Web app URL** (looks like `https://script.google.com/macros/s/.../exec`)

4. **Test the API:**
   ```bash
   # Test GET entries
   curl "{YOUR_APPS_SCRIPT_URL}?api=entries&status=live"
   
   # Should return: [] (empty array, no entries yet)
   ```

---

### Step 3: Firebase Setup (Profile Photos)

1. **Create Firebase project:**
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Click **Add project → Create a project**
   - Name it: `transform-health-directory`

2. **Enable Storage:**
   - In Firebase console, go to **Build → Storage**
   - Click **Get started**
   - Start in **test mode** (or set up security rules)

3. **Register web app:**
   - Go to **Project Settings (gear icon) → General**
   - Scroll to **Your apps → Add app → Web**
   - Register app (no need to set up Firebase Hosting)
   - Copy the config values

4. **Add Firebase config to `.env`:**
   ```bash
   cd client
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

---

### Step 4: Connect Frontend to Backend

Edit `client/.env` and add your Apps Script URL:
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

**Test locally:**
```bash
cd client
npm run dev
```
- Open `http://localhost:5173`
- Submit a test profile via the "SUBMIT PROFILE" tab
- Check your Google Sheet — a new row should appear with status "pending"
- Go to "ADMIN" tab, enter your admin password
- Approve the test submission
- Check "DATABASE" tab — your test profile should appear

---

### Step 5: Deploy to GitHub Pages

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your GitHub repo → **Settings → Pages**
   - Source: **GitHub Actions**
   - The workflow in `.github/workflows/deploy.yml` will auto-deploy

3. **Update Apps Script SITE_URL:**
   - Go back to Apps Script → **Project Settings → Script Properties**
   - Update `SITE_URL` to your GitHub Pages URL:
     ```
     SITE_URL = https://yourusername.github.io/transform-health-directory
     ```

4. **Redeploy Apps Script** (to pick up new SITE_URL):
   - Click **Deploy → Manage deployments → Edit**
   - Version: **New version**
   - Click **Deploy**

---

### Step 5.5: Quick Test Checklist (Personal Account)

**Pre-flight check:**
```bash
# 1. Verify .env exists with your Sheet ID
cat client/.env | grep VITE_SHEET_ID

# 2. Start local dev server
cd client
npm run dev
# Should start on http://localhost:5173

# 3. Test API connection (in new terminal)
curl "http://localhost:5173/api/entries?status=live"
# Should return: [] (empty array = API working)
```

**Manual testing flow:**
1. ✅ Open `http://localhost:5173`
2. ✅ Submit a test profile via "SUBMIT PROFILE" tab
3. ✅ Check your Google Sheet → Should see new row with status "pending"
4. ✅ Go to "ADMIN" tab → Enter your admin password
5. ✅ Approve the test submission
6. ✅ Check "DATABASE" tab → Profile should appear
7. ✅ Test "Manage your profile" → Enter your email
8. ✅ Check email → Click magic link → Should open profile editor

---

### Step 6: Test Email Magic Links

1. Submit a profile with your email address
2. Approve it in Admin
3. Use "Manage your profile" link on the site
4. Enter your email → Check inbox for magic link
5. Click the link → Should open your profile for editing

---

### Troubleshooting

| Issue | Solution |
|---|---|
| Apps Script returns 403 | Redeploy as "Anyone" access |
| Firebase permission denied | Check Storage rules, switch to test mode |
| Sheet not found | Verify TARGET_SHEET_ID in Script Properties |
| Magic link not working | Check SITE_URL in Script Properties, redeploy |
| Photos not uploading | Verify Firebase config in `.env` |

---

## Client App — Quick Start

### 1) Install dependencies

```bash
cd client
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set `VITE_APPS_SCRIPT_URL` to your deployed Apps Script web app URL (see `apps-script/README_DEPLOY.md`).

The app works without this variable — it falls back to mock data for local development.

### 3) Firebase Setup (profile photos)

Profile photos are uploaded to Firebase Storage. Configure these in your `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Setup steps:**
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Register a web app and copy the config values
3. Enable Storage (start in test mode)
4. Add the values to `.env`

**Photo handling:**
- Images are compressed client-side (max 600px longest edge, ~80% JPEG quality)
- Typical file size stays under 200KB
- Stored in Firebase Storage under `/profile-photos/<timestamp>-<name>.jpg`

### 4) Local development

```bash
npm run dev
```

### 5) Build for GitHub Pages

```bash
npm run build
```

The `dist/` folder is published to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

---

## Client App — Project Structure

```
client/src/
├── App.jsx              # Main app with routing and navigation
├── main.jsx             # Entry point
├── firebase.js          # Firebase Storage initialization
├── components/
│   ├── SiteHeader.jsx   # Top header bar
│   └── SiteFooter.jsx   # Footer
├── pages/
│   ├── Database.jsx     # Public directory with search/filter
│   ├── Submit.jsx       # Multi-step submission form
│   ├── ManageProfile.jsx # Update/remove profile flow
│   ├── Analytics.jsx    # Statistics and world map
│   └── Admin.jsx        # Admin console (pending, requests, all entries with search, filter, review details)
├── data/
│   └── mockData.js      # Mock leader data for development
└── utils/
    └── compressImage.js # Client-side image compression
```

## Admin Console

- Standalone admin route with a dedicated admin header/footer and no public site nav/footer.
- Pending review includes a searchable, filterable list of submissions with expandable detail panels.
- Requests and profile update/delete flows are surfaced in a dedicated Requests tab with inline action buttons.
- All entries view supports sort order, pagination, and status badges for live/pending/rejected.
- The sidebar includes a refresh action and a quick "View directory" link back to the public database.
- Summary metrics surface pending, live, and rejected counts at the top of the console.

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (design tokens in tailwind.config.cjs)
- **Maps:** react-simple-maps
- **HTTP:** Axios
- **Storage:** Firebase Storage (profile photos)
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **Deployment:** GitHub Pages

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run format` | Format code with Prettier |

---

## TODO / Backlog

### Before Monday (Pilot-Ready) — Low Hanging Fruit
*Each is 30–60 min, completed items marked ✅*

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | **Specialisation: add "Other" + raise limit 3→5** | ✅ Done `dc716e4` | One array change + input field in Submit.jsx |
| 2 | **Bio character limit 300–500** | ✅ Done `04c1c5f` | Changed validation + label |
| 3 | **Firebase 5MB cap** | ✅ Done (code exists) | Client-side check before upload in compressImage.js |
| 4 | **Regions of operation field** | ✅ Done (multi-select exists) | `selectedCountries` state in Submit.jsx |
| 5 | **Optional country field on Submit** | ✅ Done | Email field added `04c1c5f`, country optional |
| 6 | **Directory dropdown filters** | ✅ Done `b21b3ed` | Swapped chips for `<select>` elements on main row |
| 7 | **Icons on profile card name/title** | ✅ Done `7beb4ed` | User, building, location pin icons added |

### Moderate — This Weekend (~2–4 hrs each)

| # | Task | Why Harder | Status |
|---|---|---|---|
| 8 | **Profile detail modal** | New component, needs to pull all fields and lay them out well | ✅ **Done** — ProfileModal.jsx exists and wired in Database.jsx |
| 9 | **Analytics: region drilldown → show leader cards** | Need to wire `selectedRegion` into a filtered list render | ✅ **Done** — regionLeaders + LeaderCard grid renders below map in Analytics.jsx |
| 10 | **Admin view new fields** | Extend existing admin card — no new backend, just UI columns | ✅ **Done** — yearsExp + countries + region fields added |

### Post-Pilot (Needs Backend / External Services)

| # | Task | Status | Notes |
|---|---|---|---|
| 11 | **Google Sheets integration** | ✅ **Done** | Apps Script (`Code.gs`) fully wired; `leaders.js` API layer calls it; falls back to mock data only if `VITE_APPS_SCRIPT_URL` is empty |
| 12 | **SMTP email notifications** | ⏳ **Pending** | Uses `MailApp.sendEmail()` (Google Apps Script) for now; needs production SMTP (SendGrid, Mailgun, etc.) |
| 13 | **Click-through analytics (GA4 / Plausible)** | ⏳ **Pending** | No GA4, Plausible, or custom event logging found in client code |
| 17 | **LinkedIn / website click tracking** | ⏳ **Pending** | Track clicks on LinkedIn and website links to measure database usefulness; needs: (1) onClick handlers in `LeaderCard.jsx` + `ProfileModal.jsx`, (2) Apps Script endpoint to log clicks to a Sheet, (3) dashboard to display counts |

### Pending Tasks (Not Yet Started)

| # | Task | Status | Notes |
|---|---|---|---|
| 14 | **Country-level drilldown on analytics map** | ⏳ **Pending** | `Analytics.jsx` has region-level buttons only; map itself is not clickable at country level |
| 15 | **Analytics: filter profiles by region + show corresponding women leaders** | ✅ **Done** | `regionLeaders` + `LeaderCard` grid renders below map when region selected (`Analytics.jsx:77-83, 238-243`) |
| 16 | **Clean up and update profile details in admin view** | ✅ **Done** | Expanded card shows Profile (role, org, country, countries of operation, years exp, expertise), Contact, and Bio sections (`Admin.jsx:854-882`) |

### Code Quality / Technical Debt (From Audit) — Final Status

| # | Task | Priority | Status |
|---|---|---|---|
| 14 | **Compress Card-top.svg** (1.95MB → 1.5K) | 🔴 High — blocks LCP | ✅ **Done** — verified 1.5K |
| 15 | **Replace inline styles with Tailwind classes** | 🔴 High | ✅ **Done** — grep: Database.jsx:0, Submit.jsx:0 |
| 16 | **Create reusable UI components** (Button, Input, LeaderCard) | 🔴 High | ✅ **Done** — 3 components + SubmitSteps.jsx |
| 17 | **Centralize API layer** (client/src/api/leaders.js) | 🔴 High | ✅ **Done** — all endpoints centralized |
| 18 | **Extract monolithic pages** (Submit.jsx → steps) | 🔴 High | ✅ **Done** — Submit.jsx → SubmitSteps.jsx (280 lines) |
| 19 | **Add useLeaders / useAdminData custom hooks** | 🟡 Medium | ✅ **Done** — useLeaders.js (69 lines) |
| 20 | **Configure tailwind.config.js** with design tokens | 🟡 Medium | ✅ **Done** — brand colors added |
| 21 | **Add React Query / SWR for data fetching** | 🟡 Medium | ✅ **Done** — commit, useQuery with 5min stale time |
| 22 | **Accessibility audit** (aria-labels, focus trap, keyboard nav) | 🟢 Low | ✅ **Done** — commit, focus trap + aria-labels added |
| 23 | **Code splitting / lazy loading** | 🟢 Low | ✅ **Done** — commit, React.lazy() + Suspense |
| 24 | **DRY up icons** (LeaderCard + ProfileModal duplicate SVG) | 🟡 Medium | ✅ **Done** — commit `b31a6c1`, icons.jsx created |
| 25 | **Move COUNTRY_TO_CONTINENT out of hook** | 🟡 Medium | ✅ **Done** — commit `4abfc01`, moved to utils/countries.js |
| 26 | **Wire up Admin.jsx to use API layer** | 🔴 High | ✅ **Done** — commit `71fbd6c`, all axios replaced with api.* |
| 27 | **Wire up SubmitSteps.jsx to use Button/Input** | 🔴 High | ✅ **Done** — grep: 39 usages of Button/Input/Textarea/Select |

### Recommended Next Steps (In Priority Order)

1. **SMTP email notifications** (item 12) — Needs server/Firebase Function + email service config
2. **Google Sheets integration** (item 11) — Needs backend proxy or Apps Script web app
3. **Click-through analytics** (item 13) — Needs analytics service (Plausible/GA4) or custom logging
4. **Compression audit** — Run Lighthouse, identify remaining large assets
5. **Mobile UX review** — Test all pages on mobile, fix any overflow/overlap issues
