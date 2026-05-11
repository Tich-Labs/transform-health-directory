import React, { useState } from "react";

// ── Shared primitives ────────────────────────────────────────────────────────
function H3({ children }) {
  return <h3 className="text-[1.6rem] font-semibold text-brand-dark mt-6 mb-2">{children}</h3>;
}
function P({ children }) {
  return <p className="text-[1.5rem] text-gray-700 leading-[1.8] mb-3">{children}</p>;
}
function Li({ children }) {
  return <li className="text-[1.5rem] text-gray-700 leading-[1.8] mb-1">{children}</li>;
}
function Ul({ children }) {
  return <ul className="list-disc list-outside ml-6 mb-4">{children}</ul>;
}
function Ol({ children }) {
  return <ol className="list-decimal list-outside ml-6 mb-4">{children}</ol>;
}
function Code({ children }) {
  return <code className="bg-gray-100 text-brand-navy text-[1.3rem] px-1.5 py-0.5 rounded font-mono">{children}</code>;
}
function Note({ children }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-5 py-3 mb-4">
      <p className="text-[1.4rem] text-amber-800 leading-[1.7] m-0">{children}</p>
    </div>
  );
}
function Tip({ children }) {
  return (
    <div className="bg-brand-blue-tint border-l-4 border-brand-navy rounded-r-lg px-5 py-3 mb-4">
      <p className="text-[1.4rem] text-brand-navy leading-[1.7] m-0">{children}</p>
    </div>
  );
}
function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto mb-5">
      <table className="w-full text-[1.4rem] border-collapse">
        <thead>
          <tr className="bg-brand-blue-tint">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-2 font-semibold text-brand-navy border border-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 border border-gray-200 text-gray-700 leading-[1.6]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-3 mb-2">
      <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 border-gray-300 bg-white" />
      <span className="text-[1.5rem] text-gray-700 leading-[1.7]">{children}</span>
    </li>
  );
}

// ── Section content definitions ──────────────────────────────────────────────
const SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <>
        <P>The Admin Console is the internal tool for managing the Women Leaders in Digital Health Database. From here you can:</P>
        <Ul>
          <Li>Review and publish new profile submissions</Li>
          <Li>Handle update and deletion requests from leaders already in the directory</Li>
          <Li>Manage nominated profiles and send personalised outreach</Li>
          <Li>Browse and audit the full database</Li>
          <Li>Monitor QA test results from the testing team</Li>
        </Ul>
        <P>The sidebar shows live counts next to each tab so you always know what needs attention. Use the <strong>↻ Refresh</strong> button to reload the latest data from Supabase.</P>
        <Tip><strong>Access:</strong> Click <strong>Admin</strong> in the top-right of the nav bar — it opens in a new tab. Auth gate is currently disabled for testing and will be re-enabled before launch.</Tip>
      </>
    ),
  },
  {
    id: "dashboard-stats",
    label: "Dashboard Stats",
    content: (
      <>
        <P>Three summary cards are visible at the top of the All Entries, Profile Requests, and Nominated tabs:</P>
        <Table
          headers={["Card", "What it shows"]}
          rows={[
            ["Pending", "All submissions and requests awaiting action"],
            ["Live", "Leaders currently published in the public directory"],
            ["Rejected", "Profiles that have been declined or removed"],
          ]}
        />
        <Tip>These counts update each time you refresh. Use the <strong>↻</strong> button in the sidebar header to force a reload.</Tip>
      </>
    ),
  },
  {
    id: "all-entries",
    label: "All Entries",
    content: (
      <>
        <P>The full database — every record regardless of status (<Code>live</Code>, <Code>pending</Code>, <Code>rejected</Code>). This is also where you review and approve pending submissions.</P>
        <H3>Table columns</H3>
        <Table
          headers={["Column", "What it shows"]}
          rows={[
            ["Checkbox", "Appears on pending rows only — use for bulk actions"],
            ["Name", "First and last name; shows ⚠ Possible duplicate badge if name matches an existing live leader"],
            ["Role", "Current role / title"],
            ["Organisation", "Organisation or institution"],
            ["LinkedIn Clicks", "How many times this leader's LinkedIn link has been clicked"],
            ["Status", "live / pending / rejected (colour-coded badge)"],
          ]}
        />
        <H3>Reviewing a pending submission</H3>
        <Ol>
          <Li>Click any row to expand it — look for the yellow <strong>pending</strong> badge to identify entries needing review</Li>
          <Li>Read the full bio, expertise tags, years of experience, geographical scope, countries of operation, and any notable achievements</Li>
          <Li>Check the email address — it is private and never published</Li>
          <Li>Click <strong>Approve</strong> to publish or <strong>Reject</strong> to decline</Li>
          <Li>Confirm in the modal that appears</Li>
        </Ol>
        <H3>Bulk actions</H3>
        <Ol>
          <Li>Tick checkboxes on multiple pending rows (or use <strong>Select all</strong>)</Li>
          <Li>A bulk action bar appears above the table</Li>
          <Li>Click <strong>Approve N</strong> or <strong>Reject N</strong> — a single confirmation covers all selected</Li>
        </Ol>
        <H3>Filters</H3>
        <Ul>
          <Li>Search: name, org, role, expertise, email, country, or bio</Li>
          <Li>Country dropdown</Li>
          <Li>Expertise tag dropdown</Li>
          <Li>LinkedIn clicks: Most clicked / Least clicked</Li>
        </Ul>
        <H3>Expanding a row</H3>
        <P>Shows full profile details. For pending entries you get <strong>Approve / Reject / Delete</strong> buttons. For live/rejected entries you get <strong>Delete</strong> only. Deletion is a hard delete — the record is permanently removed from the database.</P>
        <Note><strong>On the duplicate badge:</strong> If you see ⚠ Possible duplicate, check whether this is genuinely the same person or a different person with the same name. The submitter was warned at submission time — you have the final call.</Note>
      </>
    ),
  },
  {
    id: "profile-requests",
    label: "Profile Requests",
    content: (
      <>
        <P>Leaders already in the database who want to change or remove their profile. Two sub-tabs:</P>
        <H3>Updates</H3>
        <P>Leaders requesting changes to their profile (role, bio, photo, etc.).</P>
        <Ol>
          <Li>Expand the row to read the full change request</Li>
          <Li>Click <strong>Send update link</strong> — emails the leader a magic link to edit their own profile</Li>
          <Li>The row updates to show a <strong>Link sent</strong> status</Li>
          <Li>Once the leader resubmits via the link, it reappears as a new pending entry in <strong>All Entries</strong></Li>
          <Li>Review and approve the updated version as normal</Li>
        </Ol>
        <Note>If the request is spam or irrelevant, click <strong>Dismiss</strong> to close it without sending a link.</Note>
        <H3>Deletes</H3>
        <P>Leaders who want to be removed from the directory.</P>
        <Ol>
          <Li>Expand the row to read the reason for removal (if provided)</Li>
          <Li>Click <strong>Approve deletion</strong> — sets status to <Code>rejected</Code> and removes them from the public directory</Li>
          <Li>Or click <strong>Dismiss</strong> to decline the request</Li>
        </Ol>
        <P>Use <strong>Select all</strong> + <strong>Approve N deletion(s)</strong> to process multiple requests at once.</P>
        <Note>Deletion cannot be undone from the admin console. If a leader was removed in error they must resubmit from scratch.</Note>
      </>
    ),
  },
  {
    id: "nominated",
    label: "Nominated",
    content: (
      <>
        <P>Profiles submitted by a third party nominating a woman leader on her behalf. These are lightweight records — no bio or photo yet.</P>
        <H3>What each row shows</H3>
        <Ul>
          <Li>Nominee name and "Nominated by [name]" credit line</Li>
          <Li>LinkedIn button (if a profile URL was provided)</Li>
        </Ul>
        <H3>Actions</H3>
        <Ul>
          <Li><strong>Approve</strong> — publishes the nomination record (stub profile) with status live</Li>
          <Li><strong>Reject</strong> — removes it from the queue</Li>
        </Ul>
      </>
    ),
  },
  {
    id: "test-results",
    label: "Test Results",
    content: (
      <>
        <P>A live dashboard of QA submissions from the testing sheet. Used during pre-launch testing sprints.</P>
        <Ul>
          <Li>Pass / Fail / Pending summary counts at the top</Li>
          <Li>One card per tester with a colour-coded pass rate progress bar</Li>
          <Li>Expand each tester → results by section (Directory, Analytics, Submit, Admin, etc.)</Li>
          <Li>Expand each section → individual test cases with scenario, priority, status, and notes</Li>
          <Li>Fail rows are tinted red for quick scanning</Li>
        </Ul>
        <P>Results are saved to both the browser's local storage and the database. Returning testers can continue where they left off — the testing sheet loads and merges previous results automatically. The database uses upsert (insert or update) based on tester name + scenario, so re-running a scenario updates its existing row rather than creating a duplicate.</P>
        <H3>Managing results</H3>
        <Ul>
          <Li><strong>Delete a single result</strong> — click the <strong>✕</strong> button on any row to permanently remove that test case</Li>
          <Li><strong>Clear a tester's results</strong> — click the <strong>✕ clear</strong> button on a tester's card to remove all of their results at once</Li>
          <Li>Both actions show a confirmation dialog before deleting</Li>
        </Ul>
        <H3>Filters</H3>
        <Ul>
          <Li>Filter by tester name</Li>
          <Li>Filter by status (Pass / Fail / Pending)</Li>
          <Li>Search by scenario or notes text</Li>
        </Ul>
        <Tip>Results are submitted via the <strong>Testing Sheet</strong> (linked in the nav bar). Testers fill in scenarios and save — the data appears here automatically.</Tip>
      </>
    ),
  },
  {
    id: "test-fixes",
    label: "Test Fixes",
    content: (
      <>
        <P>A reference checklist of 15 known bug items identified during pre-launch QA testing. All items have been fixed and verified in the codebase.</P>
        <Ul>
          <Li>An ID and description of the issue</Li>
          <Li>A priority level (Critical / Important / Nice-to-have)</Li>
          <Li>File references for where the fix was applied</Li>
          <Li>A green ✓ status indicator confirming the fix is in place</Li>
        </Ul>
        <P>These are hardcoded reference items (not database-driven) — use this tab to cross-reference what was addressed before re-testing via the <strong>Testing Sheet</strong>.</P>
      </>
    ),
  },
  {
    id: "common-workflows",
    label: "Common Workflows",
    content: (
      <>
        <H3>Publishing a new leader</H3>
        <Ol>
          <Li>Open <strong>All Entries</strong> — find pending entries by looking for the yellow <strong>pending</strong> status badge</Li>
          <Li>Click the row to expand — read bio, check photo, verify expertise tags</Li>
          <Li>If <strong>⚠ Possible duplicate</strong> appears, search the name to compare against other records</Li>
          <Li>Click <strong>Approve</strong> → confirm → leader goes live instantly</Li>
          <Li>Or use checkboxes + bulk <strong>Approve</strong> to process multiple submissions at once</Li>
        </Ol>
        <H3>Handling a profile update request</H3>
        <Ol>
          <Li>Open <strong>Profile Requests → Updates</strong></Li>
          <Li>Expand the row — read what the leader wants changed</Li>
          <Li>Click <strong>Send update link</strong> — leader receives a magic link by email</Li>
          <Li>Once they resubmit, the updated profile appears as a new pending entry in <strong>All Entries</strong></Li>
          <Li>Approve the updated version</Li>
        </Ol>
        <H3>Removing a leader from the directory</H3>
        <P><strong>If the leader requested removal:</strong></P>
        <Ol>
          <Li>Open <strong>Profile Requests → Deletes</strong></Li>
          <Li>Read the reason → click <strong>Approve deletion</strong></Li>
        </Ol>
        <P><strong>If you need to remove without a request:</strong></P>
        <Ol>
          <Li>Open <strong>All Entries</strong>, find the record</Li>
          <Li>Expand → click <strong>Delete</strong> → confirm</Li>
        </Ol>
        <H3>Reaching out to a nominee</H3>
        <Ol>
          <Li>Open <strong>Nominated</strong>, expand the nominee's row</Li>
          <Li>Note the nominator's email and the nominee's LinkedIn profile</Li>
          <Li>Reach out via your preferred channel (LinkedIn message or email)</Li>
        </Ol>
      </>
    ),
  },
  {
    id: "duplicate-detection",
    label: "Duplicate Detection",
    content: (
      <>
        <P>The platform has two layers of duplicate protection:</P>
        <Table
          headers={["Layer", "Where", "What happens"]}
          rows={[
            [
              "Submission-time warning",
              "Submit Profile — Step 2 (Basic Info)",
              "On blur of the name fields, a live Supabase lookup checks for any existing leader with the same name. An amber warning is shown if a match is found. Submission is not blocked.",
            ],
            [
              "Admin flag",
              "All Entries tab",
              "Any pending submission whose name matches an existing live leader shows a ⚠ Possible duplicate badge next to their name. Admin makes the final call.",
            ],
          ]}
        />
        <Note>Detection is name-based only (case-insensitive). Two different people can share the same name — always check the email address and profile link before rejecting.</Note>
        <H3>Resolving a duplicate</H3>
        <Ol>
          <Li>In <strong>All Entries</strong>, look for the ⚠ Possible duplicate badge on pending rows</Li>
          <Li>Open <strong>All Entries</strong> and search the name to see all records</Li>
          <Li>Compare email addresses and profile details</Li>
          <Li>Approve the correct record and reject the duplicate</Li>
        </Ol>
      </>
    ),
  },
  {
    id: "status-reference",
    label: "Status Reference",
    content: (
      <>
        <Table
          headers={["Status", "Meaning", "Visible in public directory?"]}
          rows={[
            [<Code>live</Code>, "Approved and published", "Yes"],
            [<Code>pending</Code>, "Submitted, awaiting review", "No"],
            [<Code>rejected</Code>, "Declined or removed", "No"],
          ]}
        />
        <Tip>Status changes are instant — approving a record publishes it immediately. There is no scheduled publish.</Tip>
      </>
    ),
  },
  {
    id: "tips-notes",
    label: "Tips & Notes",
    content: (
      <>
        <Ul>
          <Li><strong>Refresh (↻)</strong> in the sidebar header reloads all data from Supabase — use this if you've been on the page a while.</Li>
          <Li><strong>Action messages</strong> (green banner) confirm successful approvals, rejections, or sends. They clear automatically.</Li>
          <Li><strong>Email addresses</strong> in expanded rows are private and never shown in the public directory.</Li>
          <Li><strong>LinkedIn Clicks</strong> in All Entries shows engagement per profile — useful for identifying which leaders drive the most traffic.</Li>
          <Li><strong>Expertise tags</strong> are shown as blue pill/badge chips — hover to see the full text if truncated.</Li>
          <Li>The admin console does not show the site header or footer — it is a standalone internal tool.</Li>
          <Li><strong>Returning testers</strong> can continue where they left off — the testing sheet saves progress to both local storage and Supabase. Re-entering their name loads and merges previous results automatically.</Li>
          <Li><strong>Live auto-refresh:</strong> Data refreshes every 30 seconds while the tab is visible. It also refreshes when the tab regains focus.</Li>
        </Ul>
      </>
    ),
  },
  {
    id: "pre-launch-checklist",
    label: "Pre-Launch Checklist",
    content: (
      <>
        <P>Items to complete before the platform goes live — for the technical team:</P>
        <ul className="list-none ml-0 mb-4">
          <CheckItem>Re-enable the admin auth gate — add auth check in <Code>Admin.jsx</Code> (currently no auth)</CheckItem>
          <CheckItem>Create an admin user in Supabase Auth</CheckItem>
          <CheckItem>Configure SMTP secrets in Supabase — the <Code>send-email</Code> Edge Function is built; set <Code>GOOGLE_SMTP_USER</Code> + <Code>GOOGLE_SMTP_PASS</Code> (or <Code>SENDGRID_API_KEY</Code> / <Code>SMTP_*</Code> fallback)</CheckItem>
          <CheckItem>Add <Code>VITE_SUPABASE_URL</Code> and <Code>VITE_SUPABASE_ANON_KEY</Code> to GitHub Actions secrets</CheckItem>
          <CheckItem>Drop three test-mode RLS policies — <Code>Admin test mode: read all leaders</Code>, <Code>Admin test mode: update leaders</Code>, <Code>Admin test mode: update requests</Code></CheckItem>
          <span className="flex items-start gap-3 mb-2 opacity-60">
            <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 border-green-500 bg-green-500 text-white flex items-center justify-center text-[1.2rem] font-bold">✓</span>
            <span className="text-[1.5rem] text-gray-700 leading-[1.7]">Run <Code>scripts/create-test-results-table.sql</Code> on production — done</span>
          </span>
        </ul>
        <Note>The SMTP function lives at <Code>supabase/functions/send-email/</Code>. It supports Google Workspace SMTP, SendGrid, and generic SMTP fallback. Configure the relevant secrets in the Supabase dashboard before launch. The auth gate currently does not exist — it needs to be built (not just uncommented).</Note>
      </>
    ),
  },
];

// ── Main component ───────────────────────────────────────────────────────────
export default function AdminManual() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);
  const activeSection = SECTIONS[activeIndex];
  const prev = SECTIONS[activeIndex - 1] ?? null;
  const next = SECTIONS[activeIndex + 1] ?? null;

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* TOC sidebar */}
      <nav className="flex flex-col w-[200px] xl:w-[220px] flex-shrink-0 border-r border-gray-200 bg-brand-parchment overflow-y-auto py-6 px-3 gap-0.5">
        <p className="text-[1.1rem] uppercase tracking-widest text-gray-400 font-semibold mb-3 px-2">
          Contents
        </p>
        {SECTIONS.map((s, i) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`text-left text-[1.3rem] px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-brand-navy text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-brand-navy"
              }`}
            >
              <span className={`text-[1.1rem] flex-shrink-0 ${isActive ? "text-white/60" : "text-gray-400"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Section content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Scrollable section body */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {activeSection.content}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex-shrink-0 flex items-center justify-between px-10 py-4 border-t border-gray-100 bg-brand-parchment">
          {prev ? (
            <button
              onClick={() => setActiveId(prev.id)}
              className="flex items-center gap-2 text-[1.4rem] font-medium text-gray-600 hover:text-brand-navy transition-colors cursor-pointer"
            >
              ← {prev.label}
            </button>
          ) : <span />}
          {next ? (
            <button
              onClick={() => setActiveId(next.id)}
              className="flex items-center gap-2 text-[1.4rem] font-medium text-gray-600 hover:text-brand-navy transition-colors cursor-pointer"
            >
              {next.label} →
            </button>
          ) : (
            <span className="text-[1.4rem] text-gray-400 italic">End of manual</span>
          )}
        </div>
      </div>
    </div>
  );
}
