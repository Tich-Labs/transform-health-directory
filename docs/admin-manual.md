# Transform Health — Admin Console User Manual

> **Access:** Navigate to the app and click **Admin** (top-right of the nav bar). You will be prompted to sign in with your admin email and password (Supabase Auth).

---

## Overview

The Admin Console is the internal tool for managing the Women Leaders in Digital Health Database. It is organised into tabs in the sidebar, each with a live count badge:

- **All Entries** — the full database: browse, search, filter, sort, and approve/reject pending submissions
- **Profile Requests** — self-service update and deletion requests submitted by leaders
- **Nominated** — profiles submitted on behalf of someone else, ready for admin outreach
- **Activity Log** — a record of every self-service update and deletion, filterable by action type, date range, and name
- **Documentation** — this manual, including the Product Report covering technical architecture, cost, licensing, dependencies, and the handover checklist

The sidebar shows live counts next to each tab so you always know what needs attention. Hover over any tab for a tooltip. Use the **↻ Refresh** button to reload the latest data from Supabase.

**Non-technical content management:** Leaders manage their own profiles entirely without admin intervention via the self-service magic link flow — they find their profile, request a magic link by email, and edit or delete their data directly. The admin only needs to review new submissions and nominations.

A detailed **Product Report** is available in the Documentation section covering the full technical architecture, platform assessment, cost/licensing breakdown, accessibility features, and the handover checklist for transferring the codebase to Transform Health (see `docs/TRANSFER_CHECKLIST.md`).

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


### 4. Self-Service Profile Management (Email System)

---

### 5. Manage Admin Users *(super admin only)*

Controls who can access the admin console and what they can do. This tab is only visible to super admins. See **[Managing Admin Users](#managing-admin-users)** below for the full roles reference, step-by-step instructions, and activity log details.

Leaders can now manage their own profiles entirely without admin intervention. The flow uses the `self-service` Supabase Edge Function to generate signed tokens and deliver magic link emails.

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

**How email sending works:**

Email is sent via a Google Apps Script Web App deployed under the Transform Health Google Workspace account. The `self-service` Supabase Edge Function calls the Apps Script URL, which uses `MailApp.sendEmail()` to send from the designated Google account — no SMTP credentials are needed.

**Edge Function secrets** (configured in Supabase Dashboard → Settings → Edge Functions → Secrets):

| Secret | Purpose |
|---|---|
| `APPS_SCRIPT_URL` | URL of the deployed Google Apps Script Web App — required for all email delivery |
| `MAGIC_LINK_SECRET` | HMAC-SHA256 key used to sign and verify self-service tokens — prevents forged magic links |
| `ADMIN_NOTIFY_EMAIL` | Address that receives a notification whenever a leader updates or deletes their profile |

**Security properties of the magic link flow:**

- Tokens are generated server-side by the `self-service` Edge Function (`action: "generate"`), signed with `MAGIC_LINK_SECRET`
- When a leader lands on a magic link, `self-service` (`action: "verify"`) checks the signature and a 48-hour expiry before the edit form is shown
- Forged or expired tokens are silently rejected — no edit form is shown
- The `self-service` function validates every email recipient against the database before sending — it cannot be used to send arbitrary email

**If email delivery stops working:**

1. Check `APPS_SCRIPT_URL` is still set in Supabase Edge Function Secrets
2. Confirm the Google Apps Script Web App is still deployed under an active Transform Health Google account (redeployment is needed if the owning account changes)
3. Check the Apps Script execution log for errors: Google Drive → find the script → Executions

> **The `self-service` Edge Function is deployed** at `supabase/functions/self-service/`. It handles token generation, token verification, and email sending — all public self-service operations in one function. To test after any change, send a test magic link from the **All Entries** tab using the enrichment email button on any live leader with an email on file.

**Email structure (current implementation):**

The magic link email is constructed inline in `client/src/api/leaders.js` (`requestManage` function). From top to bottom:

1. **Transform Health logo** — centered, hotlinked from the WordPress site
2. **1px full-width pink line** (`#F85A8E`)
3. **Avatar** — photo with pink border ring, or initials on a grey circle fallback, plus LinkedIn badge overlay
4. **Leader name** — bold, centered
5. **Expertise tags** — blue pills matching the card style
6. **CTA button** — pink ("Manage my profile") or red ("Remove my profile")
7. **Expiry badge** — amber pill reading "Expires in 48 hours"
8. **Fallback link** — monospace code block with the raw `?manage=` URL
9. **1px grey divider**
10. **Footer** — "You received this because you have a profile in the **Transform Health Women Leaders Directory** (pink, bold). Didn't request this? You can safely ignore this email."

The page background uses `#f5efe0` (`brand-sand`) to match the database content section.

**Technical architecture:**

The magic link system has three layers:

**1. Token (`client/src/api/leaders.js:284-286`)**

When a user requests a magic link, the frontend builds a token:
```js
const token = btoa(JSON.stringify({ leaderId, mode, createdAt: Date.now() }));
```
- `leaderId` — the leader's UUID in the `leaders` table
- `mode` — `"update"` or `"delete"`
- `createdAt` — timestamp used to enforce **48-hour expiry** on the client side
- The token is **not encrypted** — it is simple base64. Security relies on the token being sent only to the leader's email address.
- The full magic link URL: `{origin}?manage={token}`

**2. Email HTML (`client/src/api/leaders.js:303-391`)**

The entire email body is constructed as a template literal inside `requestManage()`. It uses inline `<table>` layout for email client compatibility. The function resolves avatar, LinkedIn URL, and expertise tags from the values passed by the find-profile step, falling back to database values if absent.

**3. Edge Function (`supabase/functions/self-service/index.ts`)**

All public self-service operations are handled by a single Edge Function that dispatches on an `action` field:
```
Token request:
  requestManage() → invoke("self-service", { action: "generate", leaderId, mode })
                  → HMAC-sign token → return { token }

Email send:
  requestManage() → invoke("self-service", { action: "send-email", to, subject, html })
                  → fetch(APPS_SCRIPT_URL) → Google Apps Script → Google Workspace send

Magic link click (App.jsx on mount):
  → invoke("self-service", { action: "verify", token })
  → verify signature + expiry → return { ok, leaderId, mode }
```

- The `APPS_SCRIPT_URL` secret is server-side only — never exposed to the client.
- Two functions total in the project (`self-service` + `manage-admin`), staying within the Supabase free tier limit of 2.

> **Why one function?** Supabase free tier allows a maximum of 2 Edge Functions per project. Token generation, token verification, and email sending were consolidated into `self-service` (all public, no admin auth) to stay within that limit without paying for Pro.

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

## Managing Admin Users

> **Access:** Only super admins see the **Manage Admin Users** tab in the sidebar. Regular admins and editors do not have access to this tab.

### Admin roles

There are three roles in the system. Each role is a strict subset of the one above it.

| Role | Who it's for | What they can do |
|---|---|---|
| `super_admin` | Platform owner / technical lead | Everything admin can do, plus add and remove other admin users. Cannot be removed from the console. |
| `admin` | Core team members managing the directory | Approve and reject submissions, delete leaders, send enrichment magic links, view all profile data and gaps. Cannot manage other admin users. |
| `editor` | Reviewers or observers | View all entries and profile data, see which fields are missing from any profile. Cannot approve, reject, delete, send magic links, or manage admin users. |

> **Tip:** Use `editor` for team members who need visibility into the data but should not be able to approve or remove leaders. Promote to `admin` when they need to take action.

### Adding a new user

1. Go to **Manage Admin Users** in the sidebar (super admin only).
2. Enter the person's email address.
3. Select their role from the dropdown.
4. Click **Add user**.

The system will create a Supabase Auth account for that email if one does not already exist, assign the selected role, and send an invitation email with a link to the admin console. The new user should use **Forgot password** on the login page to set their password on first sign-in.

> If the person already has a Supabase Auth account (e.g., they previously submitted a leader profile), the system will assign the role to their existing account without creating a duplicate.

### Removing a user

Click the **✕** button next to any non-super-admin user and confirm the prompt. Removal does two things:

1. Deletes their row from `admin_roles` — they immediately lose admin privileges
2. Deletes their account from Supabase Auth — they can no longer log in at all

Super admins cannot be removed through the console (this prevents accidental lockout). If you need to remove a super admin, do it directly in Supabase Dashboard → Authentication → Users.

### Admin activity log

Every add and remove action is recorded in the **Admin activity** section at the bottom of the Manage Admin Users tab. Each entry shows what happened, who performed the action, and when. This log is read-only and cannot be edited.

### Database Backup

The **Database Backup** section at the bottom of the Manage Admin Users tab lets you export a CSV snapshot of each table. Two buttons are available:

- **Export Leaders** — downloads a CSV of all leader profiles including all fields (public and private). Filename: `th-leaders-YYYY-MM-DD.csv`
- **Export Requests** — downloads a CSV of all submissions and requests. Filename: `th-requests-YYYY-MM-DD.csv`

**Why this matters:** The Supabase free tier does not include automatic backups or Point-in-Time Recovery (PITR). If data is accidentally deleted or corrupted, there is no way to restore it without a manual export. Run this backup at least once a month, or before making any bulk changes.

> **Recommended:** Store the exported CSVs in a shared Google Drive folder accessible to the Transform Health team — not just on one person's laptop.

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
- **Photo review:** Profile photos are not displayed in the admin expanded view during review. To verify a photo, check the public directory after approval or inspect the row in Supabase directly.
- **Chrome toggle (eye button):** A small eye toggle appears at the bottom-right of the Database, Analytics, and Submit pages. Click it to hide/show the site header, nav bar, and footer — useful when demoing how the directory would look embedded in the Transform Health website. The site header and footer now match the Transform Health WordPress site (white navbar with dropdowns, multi-column navy footer).

---

## Pre-Launch Checklist (Admin Setup)

Before going live, the following need to be completed by the technical team:

- [x] **Re-enable the admin auth gate** — done; `Admin.jsx` checks `supabase.auth.getSession()` on mount and gates all content behind login
- [x] **Create an admin user** in Supabase Auth — done (`noreply@transformhealthcoalition.org`)
- [x] **Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`** to GitHub Actions secrets — done
- [x] **Remove test-mode RLS policies** — done; test-mode policies have been dropped from production
- [ ] **Run migration 015** (`015_restrict_public_columns.sql`) in Supabase Dashboard → SQL Editor — restricts anon API access to public-safe columns only

---

*Last updated: May 2026 · Transform Health internal documentation*
