# Transform Health — Admin Console User Manual

> **Access:** Navigate to the app and click **Admin** (top-right of the nav bar). The admin console opens in a new tab. Currently open for testing — auth gate will be re-enabled before launch.

---

## Overview

The Admin Console is the internal tool for the Transform Health team to manage the Women Leaders in Digital Health Database. From here you can:

- Browse, filter, and manage the full database of leaders
- Review and approve/reject pending profile submissions
- Handle update and deletion requests from leaders
- Review and approve nominated profiles
- Monitor QA test results from the testing team

The sidebar shows live counts for each tab so you always know what needs attention.

---

## Dashboard Stats

Three summary cards are visible at the top of the All Entries, Profile Requests, and Nominated tabs:

| Card | What it shows |
|---|---|
| **Pending** | Total submissions + nominations awaiting action |
| **Live** | Leaders currently published in the public directory |
| **Rejected** | Profiles that have been declined or removed |

---

## Tab Reference

### 1. All Entries

The full database — every record regardless of status (live, pending, rejected). This is also the workspace for reviewing and approving pending submissions.

**Table columns:** · Name · Role · Organisation · LinkedIn Clicks · Status

**For pending submissions, each row also shows:**
- A checkbox (to select for bulk action)
- **⚠ Possible duplicate** badge (amber) — appears if the submitted name matches an existing live leader
- **Approve / Reject** buttons in the expanded detail view

**To review a pending submission:**
1. Click any row with a **pending** status badge to expand it
2. Read the full bio, expertise tags, years of experience, geographical scope, countries of operation, and notable achievements
3. Check the email address (private — never published)
4. Click **Approve** to publish or **Reject** to decline
5. Confirm in the modal that appears

**Bulk actions (for pending rows):**
1. Tick the checkbox on multiple pending rows (or use **Select all**)
2. A bulk action bar appears above the table with **Approve N** and **Reject N** buttons
3. Click either — a single confirmation covers all selected

**Filters:**
- Search (name, org, role, expertise, email, country, bio)
- Country dropdown
- Expertise dropdown
- LinkedIn clicks: Most clicked / Least clicked

**Expanding a row** shows the full profile details. For pending entries you get **Approve / Reject / Delete** buttons. For live/rejected entries you get **Delete** only. Deletion here is a hard delete — the record is permanently removed from the database.

> On the duplicate badge: If you see ⚠ Possible duplicate, check whether this is genuinely the same person or a different person with the same name. The submitter was warned at the time — you have the final call.

---

### 2. Profile Requests

Three sub-tabs with colour-coded headers — green = New submissions, amber = Update requests, red = Delete requests.

#### New

Self-submitted profiles awaiting admin review. This sub-tab shows all pending self-submissions (same records that appear with `pending` status in All Entries). Nomination records appear in the Nominated tab.

**Workflow:**
1. Click a row to expand — shows all fields the leader filled in (personal details, expertise as pill tags, bio, notable items, LinkedIn)
2. Read through the full profile before deciding
3. Click **Approve** to publish the leader to the public directory, or **Reject** to decline
4. Confirm in the modal that appears

#### Updates

Legacy — leaders now update their profiles directly via the self-service magic link flow (see Section 6). This tab may still show older requests submitted before the self-service update was deployed.

**Workflow:**
1. Expand the row to read the full change request
2. Click **Dismiss** to close the request, or handle manually if needed
3. For new requests, direct the leader to the self-service flow instead

#### Deletes

Legacy — leaders now remove themselves directly via the self-service magic link flow (see Section 6). This tab may still show older requests submitted before the self-service update was deployed.

**Workflow:**
1. Expand the row to read the reason for removal (if provided)
2. Click **Approve deletion** — this permanently sets the leader's status to `rejected` and removes them from the public directory
3. Or click **Dismiss** to decline the request

**Bulk deletions:** Tick multiple rows and click **Approve N deletion(s)** to process them together.

> Deletion cannot be undone from the admin console. If a leader was removed in error, they would need to resubmit their profile.

---

### 3. Nominated

Profiles where someone nominated a woman leader on her behalf. These are lightweight records — no bio or photo yet.

**What you see per row:**
- Nominee name, "Nominated by [name]" credit line
- LinkedIn button (if a profile URL was provided)

**Actions per nomination:**
- **Approve** — publishes the nomination record with status live (creates a stub profile)
- **Reject** — removes it from the queue

---

### 4. Test Results

A dashboard of submissions from the QA testing sheet. Used during pre-launch testing sprints.

**What you see:**
- Pass / Fail / Pending summary counts
- One card per tester, showing their overall pass rate with a colour-coded progress bar
- Expand each tester to see results by section (Directory, Analytics, Submit, Admin, etc.)
- Expand each section to see individual test cases with scenario, priority, status, and notes

Test results are saved both to your browser's local storage and to the database (Supabase). When a tester re-enters their name on a return visit, previous results are loaded and merged automatically. The database uses upsert (insert or update) based on tester name + scenario — so revisiting a scenario updates its existing row rather than creating a duplicate.

**Filters:**
- Filter by tester name
- Filter by status (Pass / Fail / Pending)
- Search by scenario or notes text

Rows with a **Fail** status are tinted red for quick scanning. When filters are active, section headings show how many results are visible vs. the total.

**Managing test results:**
- **Delete a single result** — click the **✕** button on any row to permanently remove that test case
- **Clear a tester's results** — click the **✕ clear** button on a tester's card to remove all of their results at once
- Both actions show a confirmation dialog before deleting

> Deletions are permanent and cannot be undone from the admin console.

---

### 5. Test Fixes

A reference checklist of 21 known bug items identified during pre-launch QA testing. All items have been fixed and verified in the codebase.

Each item shows:
- An ID and description of the issue
- A priority level (Critical / Important / Nice-to-have)
- File references for where the fix was applied
- A green ✓ status indicator confirming the fix is in place

These are hardcoded reference items (not database-driven) — use this tab to cross-reference what was addressed in the latest deployment before re-testing via the Testing Sheet.

---

### 6. Self-Service Profile Management (Email System)

Leaders can now manage their own profiles entirely without admin intervention. The flow uses a Supabase Edge Function (`send-email`) to deliver secure, single-use magic links.

**User journey — fully self-service:**
1. Leader clicks "Manage your profile" from the Database, Analytics, or Submit page
2. Enters their name and email → system finds their profile
3. Chooses "Update profile" or "Remove profile"
4. A magic link is sent directly to their email (no admin involved)
5. Leader clicks the link → lands on a secure edit/delete form
6. For updates: edits name, role, organisation, bio, LinkedIn, and expertise fields directly
7. For deletion: provides an optional reason and confirms removal
8. Changes are saved directly to the database — no admin approval needed
9. The page refreshes automatically to show updated data
10. An email notification is sent to the admin team for awareness

**Admin's role:**
- Admin no longer needs to approve or process individual update/delete requests
- Admin receives a notification email whenever a leader updates or deletes their profile
- Admin can still manually edit or delete records from the **All Entries** tab if needed

**Recommended sender address:**

Use a dedicated functional email address — not an individual team member's account. This avoids issues if staff roles change and ensures the setup remains sustainable long-term.

> **Preferred:** `noreply@transformhealthcoalition.org`

This email is used solely for sending automated profile management links (system-generated, not actively monitored). If needed, copies or alerts can be forwarded to designated team members.

**Setup steps:**

The Transform Health team needs to:

1. Create or designate the functional email address (e.g. `noreply@transformhealthcoalition.org`) in Google Workspace

2. **Recommended (production):** Enable 2-Step Verification on the account, then generate an App Password:
   - Go to **Google Account → Security → 2-Step Verification** → turn it on
   - Then go to **Google Account → Security → App Passwords**
   - Select **"Mail"** as the app and **"Other"** (name it "Supabase SMTP")
   - Copy the 16-character app password
   - Share it with the technical team as `GOOGLE_SMTP_PASS`
   
   An App Password is more secure than using the account password directly, and won't break if the account password is changed later.

3. **Interim (current):** Since 2-Step Verification is not yet enabled, the account password is used directly for SMTP auth. The technical team has configured `GOOGLE_SMTP_PASS` with the account password.

The technical team configures these secrets in the Supabase project dashboard (**Project Settings → Edge Functions → Secrets**):

| Secret | Value |
|---|---|
| `GOOGLE_SMTP_USER` | `noreply@transformhealthcoalition.org` |
| `GOOGLE_SMTP_PASS` | Account password or App Password (see above) |

> **Recommendation:** Enable 2-Step Verification and switch to an App Password before launch. This is more secure and avoids disruption if the account password is ever changed. The SMTP config in Supabase only needs to be updated once when switching.

> **The `send-email` Edge Function is already deployed** at `supabase/functions/send-email/`. Only the secrets above need to be configured in the Supabase project dashboard. Once set, test by sending an update link from **Profile Requests → Updates** and verifying the leader receives the email.

**Email structure (current implementation):**

The magic link email is constructed inline in `client/src/api/leaders.js` (`requestManage` function). From top to bottom:

1. **Transform Health logo** — centered, hotlinked from the WordPress site
2. **1px full-width pink line** (`#F85A8E`)
3. **Avatar** — photo with pink border ring, or initials on a grey circle fallback, plus LinkedIn badge overlay
4. **Leader name** — bold, centered
5. **Expertise tags** — blue pills matching the card style
6. **CTA button** — pink ("Manage my profile") or red ("Remove my profile")
7. **Expiry badge** — amber pill reading "Expires in 24 hours"
8. **Fallback link** — monospace code block with the raw `?manage=` URL
9. **1px grey divider**
10. **Footer** — "You received this because you have a profile in the **Transform Health Women Leaders Directory** (pink, bold). Didn't request this? You can safely ignore this email."

The page background uses `#f5efe0` (`brand-sand`) to match the database content section.

**Technical architecture:**

The magic link system has three layers:

**1. Token (`client/src/api/leaders.js:284-286`)**

When a user requests a magic link, the frontend builds a token:
```js
const token = btoa(JSON.stringify({ leaderId, mode }));
```
- `leaderId` — the leader's UUID in the `leaders` table
- `mode` — `"update"` or `"delete"`
- The token is **not encrypted** — it is simple base64. Security relies on the token being sent only to the leader's email address.
- The full magic link URL: `{origin}?manage={token}`

**2. Email HTML (`client/src/api/leaders.js:303-391`)**

The entire email body is constructed as a template literal inside `requestManage()`. It uses inline `<table>` layout for email client compatibility. The function resolves avatar, LinkedIn URL, and expertise tags from the values passed by the find-profile step, falling back to database values if absent.

**3. Edge Function (`supabase/functions/send-email/index.ts`)**

The email is sent via a Supabase Edge Function that proxies through a Google Apps Script Web App:
```
requestManage() → supabase.functions.invoke("send-email", { to, subject, html })
                  → fetch(APPS_SCRIPT_URL) → Google Apps Script → SMTP send
```
- The Edge Function receives `{ to, subject, htmlBody }` and forwards it to a Google Apps Script URL configured via the `APPS_SCRIPT_URL` environment variable.
- The Apps Script handles the actual SMTP delivery via Google Workspace.
- No secrets are exposed to the client — the Apps Script URL is server-side only.

**Fallback:** If the Edge Function call fails (e.g., email service down), `requestManage` catches the error and returns a manual URL to the user so they can still access their profile:
```js
return { ok: false, url, message: "Email service unavailable. Use this link instead:" };
```

**URL management:** When a profile is found via "Find My Profile," the browser URL is updated to `?profile=FirstName+LastName` using `history.replaceState`. Both `?manage=` and `?profile=` params are cleaned up when the modal closes or on page reload after a save/delete.

---

## Common Workflows

### Publishing a new leader

1. Open **All Entries**
2. Use the search or filters to find pending entries, or scroll to rows with a yellow **pending** status badge
3. Click the row to expand — read bio, check photo, verify expertise tags
4. If ⚠ Possible duplicate appears, search for the name to compare against other records
5. Click **Approve** → confirm → leader goes live instantly in the public directory
6. Or use the checkboxes + bulk **Approve** to process multiple submissions at once

### Handling a profile update request

Profile updates are now fully self-service — leaders manage their own updates via magic link.

**If a leader contacts you about updating their profile:**
1. Direct them to the **"Manage your profile"** option on the directory website
2. They enter their name and email → receive a magic link → edit their profile directly
3. No admin action is needed; you will receive a notification email after the update is saved

**If you need to update a profile manually:**
1. Open **All Entries**, find the record
2. Expand and make the desired changes directly in the database if needed

### Removing a leader from the directory

**If the leader requested removal (self-service):**
1. Leaders now remove themselves directly via the **"Manage your profile"** flow
2. They choose "Remove profile" → receive a magic link → confirm deletion
3. No admin action is needed; you will receive a notification email after the removal

**If you need to remove someone without a request:**
1. Open **All Entries**, find the record
2. Expand and click **Delete** → confirm

### Reaching out to a nominee

1. Open **Nominated**, find the nominee, expand their row
2. Note the nominator's email and the nominee's LinkedIn profile
3. Reach out via your preferred channel (LinkedIn message or email)

### Checking for duplicates

1. Open **All Entries** — pending rows with duplicate names show the ⚠ Possible duplicate badge
2. Search for the name to see all records (live, pending, rejected) with that name
3. Compare email addresses and profile details to determine if it's the same person
4. Approve the latest and reject the older pending one, or vice versa

---

## Status Reference

| Status | Meaning | Visible in public directory? |
|---|---|---|
| `live` | Approved and published | Yes |
| `pending` | Submitted, awaiting review | No |
| `rejected` | Declined or removed | No |

---

## Duplicate Detection

The platform includes two layers of duplicate protection:

**At submission time:** When a submitter enters their name in Step 2 (Basic Info), the form checks Supabase for any existing leader with the same first and last name (live or pending). If a match is found, an amber warning is shown — but the submission is not blocked. The submitter can still proceed.

**In the admin console:** Any pending submission whose name matches an existing live leader is flagged with an **⚠ Possible duplicate** badge in the All Entries table. The admin makes the final call on whether to approve or reject.

---

## Tips & Notes

- **Refresh button (↻)** in the sidebar header reloads all data from Supabase — use this if you've been on the page a while and want to see latest submissions.
- **Action messages** (green banner) confirm successful approvals, rejections, or sends. They clear automatically.
- **Email addresses** in expanded rows are private — they are never shown in the public directory.
- **LinkedIn Clicks** in All Entries shows how many times a leader's LinkedIn link has been clicked from their profile card — useful for seeing which profiles get the most engagement.
- **Expertise tags** are shown as blue pill/badge chips everywhere they appear — hover to see the full text if it's truncated on smaller screens.
- The **admin tab** does not show the site header/footer — it is a standalone internal tool.
- **Returning testers** can continue where they left off — the testing sheet saves their name, current section, scroll position, and all results to local storage and Supabase. When they re-enter their name on a return visit, previous results are loaded and merged automatically.
- **Live auto-refresh:** The console refreshes its data every 30 seconds while the tab is open and visible. It also refreshes when the tab regains focus (e.g., switching back from another tab).
- **DEV badge:** The Test Results and Test Fixes tabs show a `DEV` badge in the sidebar — these are developer/internal tools used during pre-launch testing and may be hidden or restricted in production.
- **Photo review:** Profile photos are not displayed in the admin expanded view during review. To verify a photo, check the public directory after approval or inspect the row in Supabase directly.
- **Chrome toggle (eye button):** A small eye toggle appears at the bottom-right of the Database, Analytics, and Submit pages. Click it to hide/show the site header, nav bar, and footer — useful when demoing how the directory would look embedded in the Transform Health website.

---

## Pre-Launch Checklist (Admin Setup)

Before going live, the following need to be completed by the technical team:

- [ ] **Re-enable the admin auth gate** — add auth check at the top of `Admin.jsx` (currently no auth at all)
- [ ] **Create an admin user** in Supabase Auth (manual dashboard step)
- [ ] **Configure SMTP secrets** in Supabase project settings — the `send-email` Edge Function is built; set `GOOGLE_SMTP_USER` + `GOOGLE_SMTP_PASS` (or `SENDGRID_API_KEY` / `SMTP_*` fallback)
- [ ] **Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`** to GitHub Actions secrets (if CI/CD is set up)
- [ ] **Remove test-mode RLS policies** — drop three policies in `schema.sql` lines 63–82 (`Admin test mode: read all leaders`, `Admin test mode: update leaders`, `Admin test mode: update requests`)
- [x] **Run `create-test-results-table.sql`** on production — done, test results schema migrated

> The SMTP setup is partially complete: a Supabase Edge Function (`supabase/functions/send-email/`) handles email delivery. It supports Google Workspace SMTP, SendGrid, and generic SMTP fallback. It needs the relevant secrets configured in the Supabase project dashboard before going live.

---

*Last updated: May 2026 · Transform Health internal documentation*
