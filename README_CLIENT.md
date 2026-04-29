# Transform Health Women Leaders Directory — Client App

A React web application for the Transform Health Women Leaders Directory. It allows users to browse a database of women leaders in digital health, submit new profiles, manage existing profiles, and provides an admin console for the Transform Health team.

---

## Pages & Features

### 1. Database

The main public-facing page. Displays all live profiles in a searchable, filterable grid.

**Features:**
- **Search** — filter by name, role, organisation, or bio keywords
- **Expertise filter** — narrow by one of 15 expertise areas (AI, Digital health, Health financing, etc.)
- **Featured only** toggle — show only featured/highlighted leaders
- **Pagination** — 12 profiles per page
- **Profile detail modal** — click any card to open a full profile view showing:
  - Name, role, organisation
  - Bio (shows *TBC* if not yet provided)
  - Expertise tags
  - LinkedIn link (shows *TBC* if not provided)
  - "Is this you?" button to update or remove the profile

> Note: The current 80 members were imported from an existing database and many fields (bio, LinkedIn) are not yet filled. These will be completed as members engage with the app post-launch.

---

### 2. Submit

A multi-step form for adding profiles to the directory.

**Step 1 — Submission type** (choose one of three):
- **Submit my own** — add yourself to the directory
- **Nominate someone** — recommend a leader for inclusion
- **Update or remove** — manage an existing profile (routes to the Manage Profile flow)

**Steps 2–4** (for new/nominated profiles):
- Step 2: Personal details — name, role, organisation, bio
- Step 3: Expertise tags (up to 5) + LinkedIn URL
- Step 4: Review + consent confirmation

On submission, the form posts to the Apps Script backend and the profile enters a pending review queue visible to admins.

---

### 3. Manage Profile (Update / Remove)

Accessible from:
- Submit page → "Update or remove" tile
- Profile detail modal → "Is this you?" button
- A magic link received by email

**Step 1 — Request type:**
- **Update my profile** — request changes to role, bio, expertise, LinkedIn, etc.
- **Remove me** — request removal from the directory

**Step 2 — Confirm your details:**
- Enter name + email (required) + LinkedIn (optional)
- **Magic link button**: "Send my profile to this email →"
  - Apps Script looks up the profile by name, generates a one-time token, and emails a personalised link
  - Clicking the link opens the app with the profile pre-filled and a "Verified via email" badge
  - Without the link, users can still describe their changes manually

**Step 3 — Changes or reason:**
- *Update*: free-text field to describe what should change; if verified via email, the current profile values are shown as a reference
- *Delete*: optional reason for removal; shows a red warning that the profile will be removed after admin review

**Step 4 — Review and submit:**
- Summary of the request
- Submit button (red for deletions, dark for updates)

On submission, the request appears in the Admin console Requests tab for the team to action.

---

### 4. Analytics

Visualisation of directory statistics including total leaders, expertise distribution, and other metrics.

---

### 5. Admin Console

A private panel for the Transform Health team to manage the directory. Access is not restricted in the current build — production hardening (login/password gate) should be added before public launch.

**Pending Submissions tab:**
- Lists all profiles submitted via the Submit form that are awaiting review
- Shows name, role, organisation, bio, expertise, and submitter email
- **Approve** — marks profile as live and visible in the database
- **Reject** — removes from the pending queue

**Profile Requests tab:**
- Lists update and delete requests submitted by directory members
- Shows request type badge (blue = update, red = delete), the person's email, their requested changes or reason
- **Done** — marks the request as handled (admin makes the changes manually in the Google Sheet)
- **Dismiss** — dismisses the request without action

**All Entries tab:**
- Table view of all profiles regardless of status (live, pending, rejected)
- Shows featured status

---

## Magic Link Flow (How it works end-to-end)

```
User clicks "Send my profile to this email"
         ↓
Apps Script receives { action: 'sendProfileLink', firstName, lastName, email }
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
ManageProfile opens with profile pre-filled + "Verified via email" badge
         ↓
User edits changes → submits → stored in Requests sheet → visible in Admin > Requests tab
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Backend | Google Apps Script (serverless) |
| Database | Google Sheets |
| Email | Apps Script `MailApp` (no third-party service) |
| Hosting | GitHub Pages |

---

## Environment Variables

Create a `.env.local` file in the `client/` directory:

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

The app works without this variable — it falls back to mock data so development and design work can happen independently of the backend.

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

## Roadmap / Known Gaps

- **Admin auth** — the admin panel has no login gate in the current build. Add a password prompt before shipping publicly.
- **Profile photos** — the schema supports a `photo_url` field but the UI currently shows initials avatars. Photo upload can be added post-launch.
- **Countries field** — the database stat strip shows a `-` placeholder for countries. Country data is not yet collected in the submission form.
- **Bio and LinkedIn for existing members** — ~80 current members were imported without bios or LinkedIn URLs. These will be filled via the magic link update flow after launch.
- **Expertise multi-select** — the current data has one expertise tag per profile. The schema and UI support multiple; the Sheet import will need a migration pass.
