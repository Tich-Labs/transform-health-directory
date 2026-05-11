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

Leaders who are already in the database and want to make changes. Two sub-tabs:

#### Updates

Leaders requesting changes to their profile (role, bio, photo, etc.).

**Workflow:**
1. Expand the row to read the full change request
2. Click **Send update link** — this emails the leader a magic link to edit their own profile
3. The row updates to show **Link sent** status
4. Once the leader resubmits via the link, it appears as a new pending entry in **All Entries**
5. Review and approve that new submission as normal

> If the request is spam or irrelevant, click **Dismiss** to close it without sending a link.

#### Deletes

Leaders who want to be removed from the directory.

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

A reference checklist of 15 known bug items identified during pre-launch QA testing. All items have been fixed and verified in the codebase.

Each item shows:
- An ID and description of the issue
- A priority level (Critical / Important / Nice-to-have)
- File references for where the fix was applied
- A green ✓ status indicator confirming the fix is in place

These are hardcoded reference items (not database-driven) — use this tab to cross-reference what was addressed in the latest deployment before re-testing via the Testing Sheet.

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

1. Open **Profile Requests → Updates**
2. Expand the row — read what the leader wants changed
3. Click **Send update link** — leader receives a magic link by email
4. Once they resubmit, the updated profile appears as a new pending entry in **All Entries** for your review
5. Approve the updated version

### Removing a leader from the directory

**If the leader requested removal:**
1. Open **Profile Requests → Deletes**
2. Read the reason, click **Approve deletion**

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
