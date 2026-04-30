# Transform Health Women Leaders Directory — Client App

A React web application for the Transform Health Women Leaders Directory. It allows users to browse a database of women leaders in digital health, submit new profiles, manage existing profiles, and provides an admin console for the Transform Health team.

---

## Pages & Features

### 1. Database

The main public-facing page. Displays all live profiles in a searchable, filterable grid.

**Features:**
- **Search bar** — filter by name, role, organisation, or bio keywords
- **Sort dropdown** — A → Z, Z → A, Latest (newest entries first)
- **Filters toggle** — opens a collapsible panel with clickable chip buttons:
  - **Continent** — Africa, Asia, Europe, North America, South America, Oceania (selecting one auto-filters available countries)
  - **Country** — all available countries; filtered by selected continent
  - **Expertise** — 15 expertise areas as toggleable pills
- **Active filter chips** — removable blue pills shown below the toolbar when any filter is active, with "Clear all"
- **Load more** — 9 profiles initially, with a "Load more leaders" button to reveal more (expands to pagination past 18 entries)
- **Profile detail modal** — click any card to open a full profile view showing:
  - Name, role, organisation
  - Bio (shows *TBC* if not yet provided)
  - Expertise tags (comma-separated in data, rendered as individual pills)
  - LinkedIn link (shows *TBC* if not provided)
  - "Update or remove my profile" button to open the profile management modal
- **"Already in the database?" link** — at the bottom of the page, opens the Manage Profile modal

> Note: The current ~80 members were imported from an existing database and many fields (bio, LinkedIn) are not yet filled. These will be completed as members engage with the app post-launch.

---

### 2. Submit

A multi-step form for adding profiles to the directory.

**Step 0 — Branch selection** (choose one of two):
- **I am nominating myself** — add yourself to the directory
- **I am nominating someone else** — provide a public profile link (e.g. LinkedIn URL) for the nominee

**Step 1 — Consent:**
- Yes/No consent to have profile displayed publicly
- Explains what is public (name, role, organisation, expertise, bio, LinkedIn) vs private (email)
- Declining shows a "Thank you" modal and redirects to the directory

**Steps 2–4** (for self-nominations):
- Step 2: Basic info — first name, last name, profile photo upload (optional, compressed client-side, stored in Firebase Storage), country of residence, organisation, role
- Step 3: Profile details — years of experience (0-2, 3-7, 8-15, 15+), areas of expertise (up to 3 tags), country/countries of operation (multi-select), short bio (100-150 characters enforced)
- Step 4: Links & achievements — LinkedIn URL, up to 3 notable achievements (each with title, link, and type: Publication/Project/Achievement/Award)

On submission, the form posts to the Apps Script backend and the profile enters a pending review queue visible to admins.

**Nomination branch:** If nominating someone else, the form skips to a thank-you screen after collecting the nominee's public profile link.

---

### 3. Manage Profile (Update / Remove)

A bottom-sheet modal overlay rendered by `App.jsx`. Opens from:
- Database page → "Manage or remove your profile" link (bottom of page)
- Database page → Profile detail modal → "Update or remove my profile" button
- Analytics page → "Manage or remove your profile" link
- Submit page → "Manage or remove your profile" link (Step 0)
- A magic link received by email (`?token=...` opens the modal over the Directory page)

**Step 1 — Identify:**
- Enter first name, last name, email (optional), LinkedIn (optional)
- "Find my profile" button looks up the profile in mock data (or live via backend)
- If found, shows profile summary and offers two actions:
  - **Update profile** — request changes to role, bio, expertise, LinkedIn, etc.
  - **Remove profile** — request removal from the directory
- **Magic link button**: "Or send my profile to this email instead →"
  - Apps Script looks up the profile by name, generates a one-time token, and emails a personalised link
  - Clicking the link opens the app with the profile pre-filled and a "Verified via email" badge
  - Without the link, users can still describe their changes manually

**Step 2 — Changes or reason:**
- *Update*: free-text field to describe what should change; if verified via email, the current profile values are shown as a reference
- *Delete*: optional reason for removal; shows a warning that the profile will be removed after admin review

**Step 3 — Review and submit:**
- Summary of the request (type, email, changes/reason)
- Submit button

On submission, the request appears in the Admin console Requests tab for the team to action.

---

### 4. Analytics

Visualisation of directory statistics using `react-simple-maps` and custom charts.

**Features:**
- **Geographic Density Map** — interactive world map with countries shaded by leader count (1-2 = medium, 3+ = dark) and regional markers showing leader distribution across N. America, Europe, Africa, S. Asia, and Latin America
- **Specialisation Bar Chart** — top 8 expertise areas with counts, percentages, and proportional bars
- **Featured Leaders** — "Emerging Voices in Practice" section showcasing 4 highlighted leaders with clickable cards that open detail modals
- **Stats summary** — total leaders, expertise areas, and organisations represented

> Note: Currently uses `MOCK_LEADERS` data. Should be updated to fetch live data from the backend.

---

### 5. Admin Console

A private panel for the Transform Health team to manage the directory. Access is not restricted in the current build — production hardening (login/password gate) should be added before public launch.

**Layout:** Sidebar navigation on the left, content area on the right with inbox-style expandable rows.

#### Pending Submissions tab
- Lists all self-nominated profiles awaiting review
- Inbox rows: avatar, name, role, org, bio preview, expertise badge
- Click to expand: full bio, profile details (country, experience, geo scope, countries, expertise, branch), notable achievements, contact info
- **Approve** — marks profile as live and visible in the database
- **Reject** — removes from the pending queue
- Filter bar: search (name, org, role, expertise, bio, country), country dropdown, expertise dropdown
- Sorted alphabetically by name (A-Z / Z-A toggle available)

#### Nominated tab
- Shows profiles submitted via the "nominating someone else" branch
- Inbox rows with pink accents, direct LinkedIn link on each row
- Click to expand: profile summary, contact details, bio, and a **prewritten outreach message**
- **Copy message** — copies a personalised LinkedIn message to clipboard for easy paste
- **Approve / Reject** — same as pending submissions

#### Profile Requests tab
Split into two sub-tabs:

**Updates sub-tab:**
- Lists update requests from existing directory members
- Each row shows name, email, and a preview of their requested changes
- Click to expand: request details (email, LinkedIn, submitted date), full change description
- **Send update link via email** — triggers the Apps Script `sendProfileLink` action, which emails the user a magic link to update their own profile (self-service — no manual admin edits needed)
- Shows "Link sent" badge once triggered
- **Dismiss** — dismisses the request without action
- Once the user updates via their magic link, it re-enters as a new pending submission

**Deletes sub-tab:**
- Lists deletion requests from directory members
- Each row has a checkbox for bulk selection
- **Bulk action bar**: "Select all" checkbox + "Approve N deletion(s)" button
- Click to expand: request details, reason for removal
- Individual "Approve deletion" or "Dismiss" buttons

#### All Entries tab
- Table view of all profiles regardless of status (live, pending, rejected)
- Shows name, role, organisation, status badge
- Paginated at 15 entries per page
- Searchable by name, role, org, expertise, country

---

## Magic Link Flow (How it works end-to-end)

```
User clicks "Or send my profile to this email instead →"
          ↓
Apps Script receives { action: 'sendProfileLink', firstName, lastName, email, linkedin }
          ↓
Apps Script looks up profile in Google Sheet by name (+ LinkedIn if provided)
          ↓
Generates a one-time token → stores in Requests sheet → emails magic link to user
          ↓
User clicks link: https://yourapp.com?token=abc123
           ↓
React app reads token from URL on load → calls Apps Script ?api=profile&token=abc123
           ↓
Apps Script returns profile snapshot, marks token as used (cannot be reused)
           ↓
Bottom-sheet modal opens over the Directory page with profile pre-filled + "Verified via email" badge
           ↓
User edits changes → submits → stored in Requests sheet → visible in Admin > Requests tab
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Inline styles (primary) + Tailwind CSS (limited use) |
| HTTP client | Axios |
| Maps | react-simple-maps |
| Storage | Firebase Storage (profile photos) |
| Backend | Google Apps Script (serverless) |
| Database | Google Sheets |
| Email | Apps Script `MailApp` (no third-party service) |
| Hosting | GitHub Pages |

---

## Environment Variables

Create a `.env` file in the `client/` directory (copy from `.env.example`):

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Firebase Storage (profile photos)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

The app works without `VITE_APPS_SCRIPT_URL` — it falls back to mock data so development and design work can happen independently of the backend.

Firebase is required for profile photo uploads. See the Firebase setup section below.

---

## Firebase Setup (Profile Photos)

Profile photos are uploaded to Firebase Storage. Before running the app, set up a Firebase project:

1. **Create a Firebase project**
   - Go to [firebase.google.com](https://firebase.google.com) → **Go to Console** → **Add project**
   - Name it (e.g. `transform-health-db`) and continue through setup (you can disable Analytics)

2. **Register a web app**
   - Click the **</>** (web) icon in the project overview
   - Give it a name (e.g. `transform-health-client`)
   - Copy the config object values

3. **Enable Storage**
   - Go to **Storage** in the left sidebar → **Get Started**
   - Start in **test mode** (you can lock down rules later for production)

4. **Add Firebase config to `.env`**
   - Add the variables shown in the Environment Variables section above

**Photo handling:**
- Images are compressed client-side before upload (max 600px longest edge, ~80% JPEG quality)
- Typical file size stays under 200KB without visible quality loss
- Photos are stored in Firebase Storage under `/profile-photos/<timestamp>-<name>.jpg`
- The download URL returned by Firebase is saved in the Sheets database alongside the profile

---

## Apps Script Setup

The backend lives in `apps-script/Code.gs`. It requires the following **Script Properties** (set in Apps Script → Project Settings → Script Properties):

| Property | Description |
|---|---|
| `TARGET_SHEET_ID` | The Google Sheet ID where submissions and requests are stored |
| `ADMIN_PASSWORD` | Password used to authenticate admin approve/reject actions |
| `SITE_URL` | The deployed app URL (e.g. `https://yourusername.github.io/repo`) — used to generate magic links |

The script creates two sheets automatically on first use:
- **Submissions** — new profile submissions and their approval status
- **Requests** — update/delete requests and magic link tokens

---

## Deployment

The app deploys automatically to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

**Manual deploy:**
```bash
cd client
npm install
npm run build
# dist/ folder is the deployable output
```

---

## TODO / Backlog

### P0 — Urgent

- **Convert all inline styles to Tailwind CSS** — every page (`Admin.jsx`, `Database.jsx`, `Analytics.jsx`, `Submit.jsx`, `ManageProfile.jsx`, `SiteHeader.jsx`, `SiteFooter.jsx`) mixes inline `style={{}}` with Tailwind classes. Replace all inline styles with Tailwind utility classes for consistency, easier maintenance, and smaller bundle. This affects ~2000+ lines across the codebase.

### Completed

- **Admin console scroll isolation** — the entire page used to scroll together, hiding the sidebar and "View directory" button. Now only the content area scrolls. The header, sidebar, filter bar, and footer stay pinned and always visible.
- **Profile management centralized as bottom-sheet modal** — ManageProfile no longer navigates to a separate `/manage` route. All "Update or remove my profile" flows and magic link tokens now open a consistent bottom-sheet modal over the Directory page, managed centrally in `App.jsx`.
- **Database filter redesign** — replaced 5 inline dropdowns with a clean, collapsible chip-based filter panel. Row 1 (sticky): search bar, sort dropdown, Filters toggle with badge count. Row 2 (collapsible): Continent, Country, and Expertise as clickable pill buttons matching the Submit form design patterns. Active filters shown as removable blue chips with "Clear all". Sort options: A → Z, Z → A, Latest (array reverse, not ID-based).

### P1 — Backend Wiring

- **Fix Apps Script `createSubmission` to save all fields** — the row currently writes 14 columns (id, branch, names, role, org, bio, linkedin, photo_url, status, token, email, note). Missing: `country`, `yearsExp`, `expertise`, `countries` (geo scope), `geoScope`, `notableItems`. Add these to the sheet columns and the `createSubmission` function in `apps-script/Code.gs`.
- **Add `?api=requests` endpoint to Apps Script** — the Admin Requests tab needs to fetch live data from the Requests sheet. Add a GET handler in `doGet` that returns all rows from the Requests sheet, analogous to `?api=entries`.
- **Wire Analytics to live data** — replace `MOCK_LEADERS` with a `useEffect` + `axios.get('?api=entries&status=live')` call in `Analytics.jsx`, matching the pattern in `Database.jsx`.
- **Wire Admin Requests to live data** — replace `MOCK_REQUESTS` with a fetch from the new `?api=requests` endpoint. Remove the hardcoded mock array from `Admin.jsx`.
- **No `.env` file exists** — only `.env.example`. Need real values for `VITE_APPS_SCRIPT_URL` and all Firebase config vars before the app can talk to the backend or accept photo uploads.

### P2 — UI / Design

- **Database page — Figma alignment** — card layout, spacing, typography, and hero section need to match Figma specs.
- **Analytics page — Figma alignment** — map styling, bar chart design, featured leaders section layout need to match Figma specs.
- **Database grid cards missing profile photos** — the profile detail modal supports `photo_url` but the grid cards don't display photos. Add photo thumbnail rendering.
- **Analytics mock data missing `region` field** — `markerData` in `Analytics.jsx` reads `m.region` but `MOCK_LEADERS` has no `region` property, so map markers show 0 counts. Add `region` to mock entries or derive it from `country`.

### P3 — Nice to Have

- **Admin auth** — the admin panel has no login gate. Add a password prompt before shipping publicly.
- **Featured only toggle** — the filter panel could include a "Featured only" checkbox to complement the existing `featured` field in the data schema.
- **Bio and LinkedIn for existing members** — ~80 current members were imported without bios or LinkedIn URLs. These will be filled via the magic link update flow after launch.
- **Expertise multi-select migration** — existing Sheet data has one expertise tag per profile; the new form supports up to 3. Will need a migration pass.
- **Country data for imported profiles** — existing imported profiles do not have country of residence or countries of operation data. The country/continent filters now work for profiles that have this field.
