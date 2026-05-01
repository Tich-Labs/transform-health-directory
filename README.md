# Transform Health Women Leaders Directory

A project to increase visibility, representation, and engagement of women leaders across leadership, policy, and technical spaces in digital health.

## Project Structure

- **`client/`** — React + Vite frontend application
- **`apps-script/`** — Google Apps Script backend for Google Sheets integration (deploy docs: [apps-script/README_DEPLOY.md](./apps-script/README_DEPLOY.md))
- **`.github/workflows/`** — GitHub Actions for automatic deployment to GitHub Pages

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
| 8 | **Profile detail modal** | New component, needs to pull all fields and lay them out well | ⏳ Pending |
| 9 | **Analytics region → show leader cards below map** | Need to wire `selectedRegion` into a filtered list render | ⏳ Pending |
| 10 | **Admin view new fields** | Extend existing admin card — no new backend, just UI columns | ⏳ Pending |

### Post-Pilot (Needs Backend / External Services)

| # | Task | Why It Takes More Time |
|---|---|---|
| 11 | **Google Sheets integration** | Needs a backend proxy or Apps Script web app — can't call Sheets API direct from browser securely |
| 12 | **SMTP email notifications** | Needs a server (Firebase Function or Node endpoint), email service config, template design |
| 13 | **Click-through analytics** | Needs an analytics service (Plausible / GA4) or custom event logging — not a one-liner |

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

1. **Admin view new fields** (item 10, ~1hr) — Extend existing admin card with new columns
2. **Profile detail modal** (item 8, ~1hr) — New component, pull all fields and layout
3. **SMTP email notifications** (item 12) — Needs server/Firebase Function + email service config
4. **Google Sheets integration** (item 11) — Needs backend proxy or Apps Script web app
5. **Click-through analytics** (item 13) — Needs analytics service (Plausible/GA4) or custom logging
