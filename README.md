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
- **Styling:** Inline styles (primary) + Tailwind CSS (limited use)
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

### Code Quality / Technical Debt (From Audit) — Updated

| # | Task | Priority | Status |
|---|---|---|---|
| 14 | **Compress Card-top.svg** (1.95MB → <100KB) | 🔴 High — blocks LCP | ⚠️ Partial — file modified but still ~1.95MB |
| 15 | **Replace inline styles with Tailwind classes** | 🔴 High — mixed styles | 🔄 Partial — config created, pages refactored but arbitrary values remain |
| 16 | **Create reusable UI components** (Button, Input, LeaderCard) | 🔴 High | ✅ **Done** — 3 components created |
| 17 | **Centralize API layer** (client/src/api/leaders.js) | 🔴 High — scattered Axios calls | ✅ **Done** — centralized with all endpoints |
| 18 | **Extract monolithic pages** (Submit.jsx 2000+ lines → steps) | 🔴 High — untestable | 🔄 Partial — LeaderCard extracted, pages still large |
| 19 | **Add useLeaders / useAdminData custom hooks** | 🟡 Medium — no caching | ✅ **Done** — useLeaders.js created (69 lines) |
| 20 | **Configure tailwind.config.js** with design tokens | 🟡 Medium — arbitrary values | 🔄 Partial — brand colors added, not fully adopted |
| 21 | **Add React Query / SWR for data fetching** | 🟡 Medium — no caching | ❌ Not started — useLeaders uses raw useEffect |
| 22 | **Accessibility audit** (aria-labels, focus trap, keyboard nav) | 🟢 Low — fails WCAG 2.1 AA | ❌ Not started |
| 23 | **Code splitting / lazy loading** | 🟢 Low — all 4 pages bundled | ❌ Not started |
| 24 | **DRY up icons** (LeaderCard + ProfileModal duplicate SVG) | 🟡 Medium | ❌ Not started — same icons defined twice |
| 25 | **Move COUNTRY_TO_CONTINENT out of hook** | 🟡 Medium | ❌ Not started — exported from useLeaders.js |

### Recommended Order for Thursday–Sunday
- **Today (Thursday):** Items 8–9 (profile modal, analytics region filter)
- **Friday:** Item 10 (admin view new fields)
- **Weekend:** Start technical debt items 14–17 (SVG compression, Tailwind migration, reusable components)
- **Post-pilot:** Items 11–13 (Sheets, SMTP, Analytics)
