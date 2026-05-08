# Transform Health — Admin Console User Manual

> **Access:** Navigate to the app and click **Admin** (top-right of the nav bar). The admin console opens in a new tab. Currently open for testing — auth gate will be re-enabled before launch.

---

## Overview

The Admin Console is the internal tool for the Transform Health team to manage the Women Leaders in Digital Health Database. From here you can:

- Review and publish new profile submissions
- Handle update and deletion requests from leaders
- Manage nominated profiles and send outreach
- View and filter the full database
- Monitor QA test results from the testing team

The sidebar shows live counts for each tab so you always know what needs attention.

---

## Dashboard Stats

Three summary cards are always visible at the top of the console:

| Card | What it shows |
|---|---|
| **Pending** | Total submissions + requests awaiting action |
| **Live** | Leaders currently published in the public directory |
| **Rejected** | Profiles that have been declined or removed |

---

## Tab Reference

### 1. Pending Submissions

Self-submitted profiles waiting for your review before going live.

**What you see per row:**
- Name, role, organisation, bio preview, primary expertise tag
- **⚠ Possible duplicate** badge (amber) — appears if the submitted name matches an existing live leader

**To review a submission:**
1. Click any row to expand it
2. Read the full bio, expertise tags, years of experience, geographical scope, countries of operation, and notable achievements
3. Check the email address (private — never published)
4. Click **Approve** to publish or **Reject** to decline
5. Confirm in the modal that appears

**Bulk actions:**
- Tick the checkbox on multiple rows (or use **Select all**)
- Click **Bulk Approve** or **Bulk Reject** — a single confirmation covers all selected

**Filtering & sorting:**
- Search by name, role, org, expertise, country, or bio text
- Filter by country or expertise tag
- Sort by Name A→Z / Z→A, Newest first, Oldest first, or Expertise A→Z

> **On the duplicate badge:** If you see ⚠ Possible duplicate, check whether this is genuinely the same person or a different person with the same name. The submitter was warned at the time — you have the final call.

---

### 2. Nominated

Profiles where someone nominated a woman leader on her behalf. These are lightweight records — no bio or photo yet.

**What you see per row:**
- Nominee name, "Nominated by [name]" credit line
- LinkedIn button (if a profile URL was provided)

**Actions per nomination:**
- **Approve** — publishes the nomination record with status live (creates a stub profile)
- **Reject** — removes it from the queue
- **Copy Message** — generates a ready-to-send invitation email to the nominee, personalised with their name, role, and org. Click to copy to clipboard, then paste into your email client.

The copy message includes:
- Who nominated them
- A description of the database
- A call to action to submit their full profile

---

### 3. Profile Requests

Leaders who are already in the database and want to make changes. Two sub-tabs:

#### Updates

Leaders requesting changes to their profile (role, bio, photo, etc.).

**Workflow:**
1. Expand the row to read the full change request
2. Click **Send update link** — this emails the leader a magic link to edit their own profile
3. The row updates to show **Link sent** status
4. Once the leader resubmits via the link, it appears as a new entry in Pending Submissions
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

### 4. All Entries

The full database — every record regardless of status (live, pending, rejected).

**Useful for:**
- Auditing the full dataset
- Finding specific leaders to check their status
- Hard-deleting a record entirely (use with care)

**Table columns:** Name · Role · Organisation · LinkedIn Clicks · Status

**Filters:**
- Search (name, org, role, expertise, email, country, bio)
- Country dropdown
- Expertise dropdown
- LinkedIn clicks: Most clicked / Least clicked

**Expanding a row** shows the full profile details plus a **Delete** button. Deletion here is a hard delete — the record is permanently removed from the database.

> Use the All Entries tab for lookups and auditing. Use Pending/Nominated/Requests for day-to-day workflow.

---

### 5. Test Results

A dashboard of submissions from the QA testing sheet. Used during pre-launch testing sprints.

**What you see:**
- Pass / Fail / Pending summary counts
- One card per tester, showing their overall pass rate with a colour-coded progress bar
- Expand each tester to see results by section (Directory, Analytics, Submit, Admin, etc.)
- Expand each section to see individual test cases with scenario, priority, status, and notes

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

## Common Workflows

### Publishing a new leader

1. Open **Pending Submissions**
2. Click the row to expand — read bio, check photo, verify expertise tags
3. If ⚠ Possible duplicate appears, open **All Entries** in a new tab and search for the name to compare
4. Click **Approve** → confirm → leader goes live instantly in the public directory

### Handling a profile update request

1. Open **Profile Requests → Updates**
2. Expand the row — read what the leader wants changed
3. Click **Send update link** — leader receives a magic link by email
4. Once they resubmit, the updated profile appears in **Pending Submissions** for your review
5. Approve the updated version

### Removing a leader from the directory

**If the leader requested removal:**
1. Open **Profile Requests → Deletes**
2. Read the reason, click **Approve deletion**

**If you need to remove someone without a request:**
1. Open **All Entries**, find the record
2. Expand and click **Delete** → confirm

### Reaching out to a nominee

1. Open **Nominated**
2. Find the nominee, expand their row
3. Click **Copy Message** — a personalised invitation is copied to your clipboard
4. Paste into your email client and send to the nominee's LinkedIn or known email

### Checking for duplicates

1. Open **Pending Submissions** — look for the ⚠ Possible duplicate badge
2. Open **All Entries** and search the name to see all records with that name
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

**In the admin console:** Any pending submission whose name matches an existing live leader is flagged with an **⚠ Possible duplicate** badge in the Pending Submissions list. The admin makes the final call on whether to approve or reject.

---

## Tips & Notes

- **Refresh button (↻)** in the sidebar header reloads all data from Supabase — use this if you've been on the page a while and want to see latest submissions.
- **Action messages** (green banner) confirm successful approvals, rejections, or sends. They clear automatically.
- **Email addresses** in expanded rows are private — they are never shown in the public directory.
- **LinkedIn Clicks** in All Entries shows how many times a leader's LinkedIn link has been clicked from their profile card — useful for seeing which profiles get the most engagement.
- The **admin tab** does not show the site header/footer — it is a standalone internal tool.
- **Returning testers** can continue where they left off — the testing sheet saves their name, current section, scroll position, and all results to local storage and Supabase. When they re-enter their name on a return visit, previous results are loaded and merged automatically.

---

## Pre-Launch Checklist (Admin Setup)

Before going live, the following need to be completed by the technical team:

- [ ] Re-enable the admin auth gate (one-line change in `Admin.jsx`)
- [ ] Create an admin user in Supabase Auth
- [ ] Set up production SMTP for the magic link emails (currently Apps Script)
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to GitHub Actions secrets
- [ ] Tighten Supabase RLS policies (currently open for testing)
- [ ] Run `scripts/add-test-results-unique-constraint.sql` in Supabase SQL Editor to enable upsert-based saving (preserves timestamps, prevents duplicate rows)

---

*Last updated: May 2026 · Transform Health internal documentation*
