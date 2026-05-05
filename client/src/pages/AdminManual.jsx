import React, { useState } from "react";

const SECTIONS = [
  "Overview",
  "Dashboard Stats",
  "Pending Submissions",
  "Nominated",
  "Profile Requests",
  "All Entries",
  "Test Results",
  "Common Workflows",
  "Duplicate Detection",
  "Status Reference",
  "Tips & Notes",
  "Pre-Launch Checklist",
];

function H1({ children }) {
  return <h1 className="text-[3rem] font-bold text-brand-navy tracking-heading mb-2">{children}</h1>;
}
function H2({ id, children }) {
  return <h2 id={id} className="text-[2rem] font-bold text-brand-navy mt-10 mb-3 pb-2 border-b border-gray-200">{children}</h2>;
}
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
    <div className="overflow-x-auto mb-6">
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

function CheckItem({ done, children }) {
  return (
    <li className="flex items-start gap-3 mb-2">
      <span className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center text-[1rem] ${done ? "bg-green-500 border-green-500 text-white" : "border-gray-300 bg-white"}`}>
        {done && "✓"}
      </span>
      <span className="text-[1.5rem] text-gray-700 leading-[1.7]">{children}</span>
    </li>
  );
}

export default function AdminManual() {
  const [activeSection, setActiveSection] = useState(null);

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* TOC sidebar */}
      <nav className="hidden xl:flex flex-col w-[220px] flex-shrink-0 border-r border-gray-200 bg-brand-parchment overflow-y-auto py-6 px-4 gap-1">
        <p className="text-[1.2rem] uppercase tracking-widest text-gray-400 font-semibold mb-3 px-2">Contents</p>
        {SECTIONS.map((s) => {
          const id = s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          return (
            <button
              key={s}
              onClick={() => scrollTo(id)}
              className={`text-left text-[1.3rem] px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSection === id
                  ? "bg-brand-navy text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-brand-navy"
              }`}
            >
              {s}
            </button>
          );
        })}
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-[860px]">

        <H1>Admin Console — User Manual</H1>
        <p className="text-[1.5rem] text-gray-500 mb-8 leading-[1.7]">
          Internal guide for the Transform Health team. Covers every tab, action, and workflow in the admin console.
        </p>
        <Tip>
          <strong>Access:</strong> Click <strong>Admin</strong> in the top-right of the nav bar — it opens in a new tab. Auth gate is currently disabled for testing and will be re-enabled before launch.
        </Tip>

        {/* ── Overview ── */}
        <H2 id="overview">Overview</H2>
        <P>The Admin Console is the internal tool for managing the Women Leaders in Digital Health Database. From here you can:</P>
        <Ul>
          <Li>Review and publish new profile submissions</Li>
          <Li>Handle update and deletion requests from leaders already in the directory</Li>
          <Li>Manage nominated profiles and send personalised outreach</Li>
          <Li>Browse and audit the full database</Li>
          <Li>Monitor QA test results from the testing team</Li>
        </Ul>
        <P>The sidebar shows live counts next to each tab so you always know what needs attention. Use the <strong>↻ Refresh</strong> button to reload the latest data from Supabase.</P>

        {/* ── Dashboard Stats ── */}
        <H2 id="dashboard-stats">Dashboard Stats</H2>
        <P>Three summary cards are visible at the top of every tab (except Test Results):</P>
        <Table
          headers={["Card", "What it shows"]}
          rows={[
            ["Pending", "All submissions and requests awaiting action"],
            ["Live", "Leaders currently published in the public directory"],
            ["Rejected", "Profiles that have been declined or removed"],
          ]}
        />

        {/* ── Pending Submissions ── */}
        <H2 id="pending-submissions">Pending Submissions</H2>
        <P>Self-submitted profiles waiting for your review before going live in the public directory.</P>
        <H3>What each row shows</H3>
        <Ul>
          <Li>Name, role, organisation, bio preview, primary expertise tag</Li>
          <Li><strong>⚠ Possible duplicate</strong> badge (amber) — appears if the submitted name matches an existing live leader</Li>
        </Ul>
        <H3>Reviewing a submission</H3>
        <Ol>
          <Li>Click any row to expand it</Li>
          <Li>Read the full bio, expertise tags, years of experience, geographical scope, countries of operation, and any notable achievements</Li>
          <Li>Check the email address — it is private and never published</Li>
          <Li>Click <strong>Approve</strong> to publish or <strong>Reject</strong> to decline</Li>
          <Li>Confirm in the modal that appears</Li>
        </Ol>
        <H3>Bulk actions</H3>
        <Ul>
          <Li>Tick checkboxes on multiple rows (or use <strong>Select all</strong>)</Li>
          <Li>Click <strong>Bulk Approve</strong> or <strong>Bulk Reject</strong> — a single confirmation modal covers all selected</Li>
        </Ul>
        <H3>Filtering & sorting</H3>
        <Ul>
          <Li>Search by name, role, org, expertise, country, or bio text</Li>
          <Li>Filter by country or expertise tag</Li>
          <Li>Sort by Name A→Z / Z→A, Newest, Oldest, or Expertise A→Z</Li>
        </Ul>
        <Note>
          <strong>On the duplicate badge:</strong> Check whether this is genuinely the same person or a different person who shares the same name. The submitter was warned at the time — you have the final call.
        </Note>

        {/* ── Nominated ── */}
        <H2 id="nominated">Nominated</H2>
        <P>Profiles submitted by a third party nominating a woman leader on her behalf. These are lightweight records — no bio or photo yet.</P>
        <H3>What each row shows</H3>
        <Ul>
          <Li>Nominee name and "Nominated by [name]" credit line</Li>
          <Li>LinkedIn button (if a profile URL was provided)</Li>
        </Ul>
        <H3>Actions</H3>
        <Ul>
          <Li><strong>Approve</strong> — publishes the nomination record with status live (creates a stub profile)</Li>
          <Li><strong>Reject</strong> — removes it from the queue</Li>
          <Li><strong>Copy Message</strong> — generates a ready-to-send invitation email personalised with the nominee's name, role, and org. Click to copy to clipboard, then paste into your email client</Li>
        </Ul>
        <Tip>The copy message includes who nominated them, a description of the database, and a call to action to submit their full profile.</Tip>

        {/* ── Profile Requests ── */}
        <H2 id="profile-requests">Profile Requests</H2>
        <P>Leaders already in the database who want to change or remove their profile. Two sub-tabs:</P>
        <H3>Updates</H3>
        <P>Leaders requesting changes to their profile (role, bio, photo, etc.).</P>
        <Ol>
          <Li>Expand the row to read the full change request</Li>
          <Li>Click <strong>Send update link</strong> — this emails the leader a magic link to edit their own profile</Li>
          <Li>The row updates to show a <strong>Link sent</strong> status</Li>
          <Li>Once the leader resubmits via the link, it reappears in <strong>Pending Submissions</strong></Li>
          <Li>Review and approve the updated version as normal</Li>
        </Ol>
        <Note>If the request is spam or irrelevant, click <strong>Dismiss</strong> to close it without sending a link.</Note>
        <H3>Deletes</H3>
        <P>Leaders who want to be removed from the directory.</P>
        <Ol>
          <Li>Expand the row to read the reason for removal (if provided)</Li>
          <Li>Click <strong>Approve deletion</strong> — sets the leader's status to <Code>rejected</Code> and removes them from the public directory</Li>
          <Li>Or click <strong>Dismiss</strong> to decline the request</Li>
        </Ol>
        <P>Use <strong>Select all</strong> and <strong>Approve N deletion(s)</strong> to process multiple requests in one go.</P>
        <Note>Deletion cannot be undone from the admin console. If a leader was removed in error, they would need to resubmit their profile from scratch.</Note>

        {/* ── All Entries ── */}
        <H2 id="all-entries">All Entries</H2>
        <P>The full database — every record regardless of status (live, pending, rejected). Use this for auditing and lookups.</P>
        <Table
          headers={["Column", "What it shows"]}
          rows={[
            ["Name", "First and last name"],
            ["Role", "Current role / title"],
            ["Organisation", "Organisation or institution"],
            ["LinkedIn Clicks", "How many times this leader's LinkedIn link has been clicked from their profile card"],
            ["Status", "live / pending / rejected"],
          ]}
        />
        <H3>Filters</H3>
        <Ul>
          <Li>Search: name, org, role, expertise, email, country, or bio</Li>
          <Li>Country dropdown</Li>
          <Li>Expertise tag dropdown</Li>
          <Li>LinkedIn clicks: Most clicked / Least clicked</Li>
        </Ul>
        <H3>Expanding a row</H3>
        <P>Shows full profile details and a <strong>Delete</strong> button. This is a hard delete — the record is permanently removed from the database. Use with care.</P>
        <Tip>Use All Entries for lookups and auditing. Use Pending / Nominated / Requests for day-to-day workflow.</Tip>

        {/* ── Test Results ── */}
        <H2 id="test-results">Test Results</H2>
        <P>A live dashboard of submissions from the QA testing sheet. Used during pre-launch testing sprints.</P>
        <Ul>
          <Li>Pass / Fail / Pending summary counts at the top</Li>
          <Li>One card per tester, with a colour-coded pass rate progress bar</Li>
          <Li>Expand each tester → results by section (Directory, Analytics, Submit, Admin, etc.)</Li>
          <Li>Expand each section → individual test cases with scenario, priority, status, and notes</Li>
          <Li>Fail rows are tinted red for quick scanning</Li>
        </Ul>
        <H3>Filters</H3>
        <Ul>
          <Li>Filter by tester name</Li>
          <Li>Filter by status (Pass / Fail / Pending)</Li>
          <Li>Search by scenario or notes text</Li>
        </Ul>

        {/* ── Common Workflows ── */}
        <H2 id="common-workflows">Common Workflows</H2>

        <H3>Publishing a new leader</H3>
        <Ol>
          <Li>Open <strong>Pending Submissions</strong></Li>
          <Li>Click the row to expand — read bio, check photo, verify expertise tags</Li>
          <Li>If <strong>⚠ Possible duplicate</strong> appears, search the name in <strong>All Entries</strong> to compare</Li>
          <Li>Click <strong>Approve</strong> → confirm → leader goes live instantly in the public directory</Li>
        </Ol>

        <H3>Handling a profile update request</H3>
        <Ol>
          <Li>Open <strong>Profile Requests → Updates</strong></Li>
          <Li>Expand the row — read what the leader wants changed</Li>
          <Li>Click <strong>Send update link</strong> — leader receives a magic link by email</Li>
          <Li>Once they resubmit, the updated profile appears in <strong>Pending Submissions</strong></Li>
          <Li>Approve the updated version</Li>
        </Ol>

        <H3>Removing a leader from the directory</H3>
        <P><strong>If the leader requested removal:</strong></P>
        <Ol>
          <Li>Open <strong>Profile Requests → Deletes</strong></Li>
          <Li>Read the reason, click <strong>Approve deletion</strong></Li>
        </Ol>
        <P><strong>If you need to remove someone without a request:</strong></P>
        <Ol>
          <Li>Open <strong>All Entries</strong>, find the record</Li>
          <Li>Expand and click <strong>Delete</strong> → confirm</Li>
        </Ol>

        <H3>Reaching out to a nominee</H3>
        <Ol>
          <Li>Open <strong>Nominated</strong></Li>
          <Li>Find the nominee, expand their row</Li>
          <Li>Click <strong>Copy Message</strong> — a personalised invitation is copied to your clipboard</Li>
          <Li>Paste into your email client and send to the nominee</Li>
        </Ol>

        <H3>Resolving a duplicate</H3>
        <Ol>
          <Li>Open <strong>Pending Submissions</strong> — look for the ⚠ Possible duplicate badge</Li>
          <Li>Open <strong>All Entries</strong> and search the name to see all records</Li>
          <Li>Compare email addresses and profile details to determine if it's the same person</Li>
          <Li>Approve the correct record and reject the duplicate</Li>
        </Ol>

        {/* ── Duplicate Detection ── */}
        <H2 id="duplicate-detection">Duplicate Detection</H2>
        <P>The platform has two layers of duplicate protection:</P>
        <Table
          headers={["Layer", "Where", "What happens"]}
          rows={[
            ["Submission-time warning", "Submit Profile — Step 2 (Basic Info)", "On blur of first/last name, a live Supabase lookup checks for any existing leader with the same name (live or pending). An amber warning is shown if a match is found. Submission is not blocked."],
            ["Admin flag", "Pending Submissions tab", "Any pending submission whose name matches an existing live leader shows a ⚠ Possible duplicate badge. Admin makes the final call."],
          ]}
        />
        <Note>Duplicate detection is name-based only (case-insensitive). Two different people can share the same name — always check the email address and profile link before rejecting.</Note>

        {/* ── Status Reference ── */}
        <H2 id="status-reference">Status Reference</H2>
        <Table
          headers={["Status", "Meaning", "Visible in public directory?"]}
          rows={[
            [<Code>live</Code>, "Approved and published", "Yes"],
            [<Code>pending</Code>, "Submitted, awaiting review", "No"],
            [<Code>rejected</Code>, "Declined or removed", "No"],
          ]}
        />

        {/* ── Tips & Notes ── */}
        <H2 id="tips--notes">Tips & Notes</H2>
        <Ul>
          <Li><strong>Refresh (↻)</strong> in the sidebar header reloads all data from Supabase — use this if you've been on the page a while.</Li>
          <Li><strong>Action messages</strong> (green banner) confirm successful approvals, rejections, or sends. They clear automatically.</Li>
          <Li><strong>Email addresses</strong> in expanded rows are private and never shown in the public directory.</Li>
          <Li><strong>LinkedIn Clicks</strong> in All Entries shows how many times a leader's LinkedIn link has been clicked — useful for seeing which profiles generate the most engagement.</Li>
          <Li>The admin console does not show the site header or footer — it is a standalone internal tool.</Li>
        </Ul>

        {/* ── Pre-Launch Checklist ── */}
        <H2 id="pre-launch-checklist">Pre-Launch Checklist</H2>
        <P>Items to complete before the platform goes live — for the technical team:</P>
        <ul className="list-none ml-0 mb-6">
          <CheckItem>Re-enable the admin auth gate (one-line change in <Code>Admin.jsx</Code>)</CheckItem>
          <CheckItem>Create an admin user in Supabase Auth</CheckItem>
          <CheckItem>Set up production SMTP for magic link emails (currently Apps Script)</CheckItem>
          <CheckItem>Add <Code>VITE_SUPABASE_URL</Code> and <Code>VITE_SUPABASE_ANON_KEY</Code> to GitHub Actions secrets</CheckItem>
          <CheckItem>Tighten Supabase RLS policies (currently open for testing)</CheckItem>
          <CheckItem>Run <Code>scripts/create-test-results-table.sql</Code> on the production Supabase instance</CheckItem>
        </ul>

        <div className="mt-12 pt-6 border-t border-gray-200 text-[1.3rem] text-gray-400">
          Last updated May 2026 · Transform Health internal documentation
        </div>
      </div>
    </div>
  );
}
