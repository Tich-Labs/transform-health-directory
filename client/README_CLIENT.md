# Transform Health Women Leaders Directory — Client App

React + Vite application for the Transform Health Women Leaders Directory.

## Quick Start

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

## Project Structure

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

## Admin console improvements

- Admin now has a standalone console route with a dedicated admin header/footer and no public site nav/footer.
- Pending review includes a searchable, filterable list of submissions with expandable detail panels.
- Requests and profile update/delete flows are surfaced in a dedicated Requests tab with inline action buttons.
- All entries view supports sort order, pagination, and status badges for live/pending/rejected.
- The sidebar includes a refresh action and a quick “View directory” link back to the public database.
- Summary metrics surface pending, live, and rejected counts at the top of the console.

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Inline styles (primary) + Tailwind CSS (limited use)
- **Maps:** react-simple-maps
- **HTTP:** Axios
- **Storage:** Firebase Storage
- **Backend:** Google Apps Script
- **Database:** Google Sheets

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run format` | Format code with Prettier |
