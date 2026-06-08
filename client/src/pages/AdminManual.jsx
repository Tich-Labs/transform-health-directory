import React, { useState } from "react";

// ── Shared primitives ────────────────────────────────────────────────────────
function H3({ children }) {
  return (
    <h3 className="text-[1.6rem] font-semibold text-brand-dark mt-6 mb-2">
      {children}
    </h3>
  );
}
function P({ children }) {
  return (
    <p className="text-[1.5rem] text-gray-700 leading-[1.8] mb-3">{children}</p>
  );
}
function Li({ children }) {
  return (
    <li className="text-[1.5rem] text-gray-700 leading-[1.8] mb-1">
      {children}
    </li>
  );
}
function Ul({ children }) {
  return <ul className="list-disc list-outside ml-6 mb-4">{children}</ul>;
}
function Ol({ children }) {
  return <ol className="list-decimal list-outside ml-6 mb-4">{children}</ol>;
}
function Code({ children }) {
  return (
    <code className="bg-gray-100 text-brand-navy text-[1.3rem] px-1.5 py-0.5 rounded font-mono">
      {children}
    </code>
  );
}
function Note({ children }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-5 py-3 mb-4">
      <p className="text-[1.4rem] text-amber-800 leading-[1.7] m-0">
        {children}
      </p>
    </div>
  );
}
function Tip({ children }) {
  return (
    <div className="bg-brand-blue-tint border-l-4 border-brand-navy rounded-r-lg px-5 py-3 mb-4">
      <p className="text-[1.4rem] text-brand-navy leading-[1.7] m-0">
        {children}
      </p>
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
              <th
                key={h}
                className="text-left px-4 py-2 font-semibold text-brand-navy border border-gray-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-2 border border-gray-200 text-gray-700 leading-[1.6]"
                >
                  {cell}
                </td>
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
      <span className="text-[1.5rem] text-gray-700 leading-[1.7]">
        {children}
      </span>
    </li>
  );
}

function Img({ src, caption }) {
  return (
    <figure className="my-6">
      <img
        src={src}
        alt={caption || ""}
        className="w-full rounded-lg border border-gray-200 shadow-sm"
      />
      {caption && (
        <figcaption className="text-[1.3rem] text-gray-500 italic mt-2 text-center">
          {caption}
        </figcaption>
      )}
      <figcaption className="text-[1.1rem] text-amber-600 mt-1 text-center">
        ⚠ Screenshot may not reflect latest UI — pending update
      </figcaption>
    </figure>
  );
}

// ── Documentation Hub Link Cards ─────────────────────────────────────────────
function DocCard({ title, description, link, icon }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-lg border border-gray-300 bg-white hover:bg-blue-50 hover:border-brand-navy transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-1">{icon}</span>
        <div className="flex-1">
          <h4 className="text-[1.5rem] font-semibold text-brand-navy group-hover:underline mb-1">
            {title}
          </h4>
          <p className="text-[1.4rem] text-gray-600 leading-[1.5]">
            {description}
          </p>
        </div>
      </div>
    </a>
  );
}

// ── Section content definitions ──────────────────────────────────────────────
// Organized by workflow: Quick Start → Understand Product → Daily Tasks → Advanced → Setup → Help

  // ────────────────────────────────────────────────────────────────────────
  // 🚀 SECTION GROUP: GETTING STARTED
  // ────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "quick-start-hub",
    label: "🚀 Quick Start Hub",
    content: (
      <>
        <P>
          Quick access to all documentation. Find answers, understand the product, and learn best practices.
        </P>
        <H3>Core Resources for Admins</H3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DocCard
            icon="🎯"
            title="Data Quality Standards"
            description="Profile approval criteria, field requirements, and what makes a publishable profile."
            link="https://github.com/Tich-Labs/transform-health-directory/blob/main/docs/05-data-quality-standards.md"
          />
          <DocCard
            icon="❓"
            title="Admin FAQ"
            description="Answers to common admin questions about workflows, approvals, and troubleshooting."
            link="https://github.com/Tich-Labs/transform-health-directory/blob/main/docs/04-faq.md#for-everyone"
          />
        </div>

        <H3>Understand the Product</H3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DocCard
            icon="🚀"
            title="Product Overview"
            description="Mission, features, user roles, and business strategy. Read this first to understand the big picture."
            link="https://github.com/Tich-Labs/transform-health-directory/blob/main/docs/01-product-overview.md"
          />
          <DocCard
            icon="📋"
            title="Documentation Index"
            description="Master navigation hub for all documentation organized by audience and task."
            link="https://github.com/Tich-Labs/transform-health-directory/blob/main/docs/00-documentation-index.md"
          />
        </div>

        <H3>For Context: User Guides</H3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DocCard
            icon="👩‍💼"
            title="Submit Profile Guide"
            description="Understand how leaders submit profiles — helps you review with empathy and catch issues early."
            link="https://github.com/Tich-Labs/transform-health-directory/blob/main/docs/02-submit-profile-guide.md"
          />
          <DocCard
            icon="🤝"
            title="Nominator Guide"
            description="How people nominate leaders — understand the nomination workflow and what to expect."
            link="https://github.com/Tich-Labs/transform-health-directory/blob/main/docs/03-nominator-guide.md"
          />
        </div>

        <H3>Legal & Privacy</H3>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <DocCard
            icon="🔒"
            title="Privacy Policy & Data Handling"
            description="GDPR/CCPA compliance, data retention, user rights. Reference when handling sensitive data."
            link="https://github.com/Tich-Labs/transform-health-directory/blob/main/docs/06-privacy-policy.md"
          />
        </div>

        <Tip>
          <strong>Pro tip:</strong> Bookmark the Data Quality Standards — you'll reference it often when reviewing profiles. The FAQ section has common admin questions.
        </Tip>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────────
  // ⭐ SECTION GROUP: DAILY ADMIN TASKS
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "approval-quick-ref",
    label: "✓ Approval Quick Reference",
    content: (
      <>
        <P>
          Use this checklist when reviewing profiles. A profile is ready to approve when all required fields are present and meet quality standards.
        </P>

        <H3>Pre-Approval Checklist</H3>
        <P className="font-semibold text-brand-navy mb-3">
          Check all of these before clicking Approve:
        </P>
        <ul className="list-none ml-0 mb-6 space-y-2">
          <CheckItem>
            <strong>Name:</strong> Real name, proper spelling, no titles
          </CheckItem>
          <CheckItem>
            <strong>Email:</strong> Valid email format, reasonable (not obviously fake)
          </CheckItem>
          <CheckItem>
            <strong>Role:</strong> Specific job title (not vague like "Manager")
          </CheckItem>
          <CheckItem>
            <strong>Organization:</strong> Recognizable, verifiable name
          </CheckItem>
          <CheckItem>
            <strong>Expertise:</strong> 2-5 tags selected, relevant to digital health
          </CheckItem>
          <CheckItem>
            <strong>Bio:</strong> 2-5 sentences, specific, shows impact (not just "I love digital health")
          </CheckItem>
          <CheckItem>
            <strong>Country & Scope:</strong> Valid country + reasonable geographic scope (Local/National/Regional/Global)
          </CheckItem>
          <CheckItem>
            <strong>Digital Health Link:</strong> Profile clearly relates to digital health (not just general healthcare)
          </CheckItem>
        </ul>

        <H3>Common Rejection Reasons</H3>
        <Table
          headers={["Reason", "What to do", "How to respond"]}
          rows={[
            [
              "Missing required fields",
              "Check if bio, expertise, or country is empty",
              "Send back to submitter for completion",
            ],
            [
              "Bio too vague",
              "Bio doesn't show specifics or impact (e.g., 'I work in health')",
              "Request more specific, evidence-based bio with examples",
            ],
            [
              "Role not actually a leader",
              "Entry-level or unclear role",
              "Ask for clarification or suggest they reapply later",
            ],
            [
              "Not digital health",
              "Traditional healthcare with no tech/innovation component",
              "Politely decline — check mission criteria",
            ],
            [
              "Possible duplicate",
              "Name matches existing live leader",
              "Compare emails & LinkedIn — approve one, reject other",
            ],
            [
              "Unverifiable",
              "Role/org claims don't match LinkedIn or web search",
              "Ask to add LinkedIn link or provide verification",
            ],
            [
              "Spam or suspicious",
              "Nonsensical profile or promotional content",
              "Reject immediately and flag",
            ],
          ]}
        />

        <H3>Red Flags During Review</H3>
        <Ul>
          <Li>
            <strong>Bio includes marketing language:</strong> "Disruptive," "Revolutionary," "Game-changing" without specifics
          </Li>
          <Li>
            <strong>Expertise doesn't match role:</strong> Selected tags unrelated to their job description
          </Li>
          <Li>
            <strong>Years of experience doesn't match role:</strong> Senior title but claims 1 year experience (or vice versa)
          </Li>
          <Li>
            <strong>LinkedIn link doesn't work or points to wrong person:</strong> Verify the name matches
          </Li>
          <Li>
            <strong>Email is suspicious:</strong> Generic domains (test@test.test) or temporary email services
          </Li>
          <Li>
            <strong>Photo doesn't look professional:</strong> But this alone isn't grounds to reject
          </Li>
        </Ul>

        <Tip>
          <strong>When in doubt:</strong> Reach out to the submitter with questions rather than rejecting. Most submissions are just incomplete, not problematic.
        </Tip>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────────
  // ❓ SECTION GROUP: HELP & TROUBLESHOOTING
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "admin-faq",
    label: "❓ Admin FAQ & Troubleshooting",
    content: (
      <>
        <P>Answers to common admin questions about workflows and operations.</P>

        <H3>How long should approval take?</H3>
        <P>
          <strong>Goal:</strong> 5–7 business days. This gives time to review thoroughly without
          creating a backlog. If you fall behind, process in batches using bulk approve.
        </P>

        <H3>What do I do if I see a duplicate badge?</H3>
        <P>
          Check the name carefully. Two different people can share the same name. Compare:
        </P>
        <Ul>
          <Li>Email address (primary differentiator)</Li>
          <Li>Organization</Li>
          <Li>LinkedIn profile if provided</Li>
          <Li>Bio details (location, expertise, experience)</Li>
        </Ul>
        <P>
          If genuinely the same person: approve the newest, reject the old one. If different people: approve both.
        </P>

        <H3>Can I verify LinkedIn directly from the admin console?</H3>
        <P>
          No, you'll need to click the link and open LinkedIn in a new tab. Always do this for profiles with red flags — it takes 30 seconds and catches a lot of issues.
        </P>

        <H3>What if I accidentally approve/reject something?</H3>
        <P>
          There's no undo button. If you reject by mistake, the submitter can resubmit. If you approve incorrectly, go to <Code>All Entries</Code>, find the profile, and use the <strong>Delete</strong> button to remove it (hard delete), then ask the team to re-review.
        </P>

        <H3>How do I know if a profile is spam?</H3>
        <P>
          Typical spam signs:
        </P>
        <Ul>
          <Li>Nonsensical name or gibberish text</Li>
          <Li>Promotional/marketing language throughout</Li>
          <Li>Same name/email submitted multiple times</Li>
          <Li>Email is obviously fake (no@no.com, test@test.test)</Li>
          <Li>Bio is a copy-paste from another source</Li>
        </Ul>
        <P>
          When in doubt, ask the team before rejecting. Most submissions are legitimate.
        </P>

        <H3>What's the difference between "Reject" and "Delete"?</H3>
        <Table
          headers={["Action", "What happens", "Can they resubmit?"]}
          rows={[
            [
              "<strong>Reject</strong>",
              "Status changes to 'rejected'. Profile hidden from public. Submitter notified.",
              "Yes — they can resubmit with corrections",
            ],
            [
              "<strong>Delete</strong>",
              "Hard delete — record permanently removed from database. Submitter NOT notified.",
              "No — they'd need to submit fresh (looks like a new entry)",
            ],
          ]}
        />
        <P>
          Use <strong>Reject</strong> for most denials. Use <strong>Delete</strong> only for spam or corrections.
        </P>

        <H3>How do leaders update their profiles?</H3>
        <P>
          Leaders visit the <strong>Manage Profile</strong> page, enter their name and email,
          and receive a magic link.  They can edit or delete their profile directly — 
          no admin action required. Completed changes appear in the{" "}
          <strong>Activity Log</strong> for admin visibility.
        </P>

        <H3>What if the email never sent?</H3>
        <P>
          Check that SMTP is configured (email secrets in Supabase). If configured correctly:
        </P>
        <Ul>
          <Li>Ask the leader to check spam folder</Li>
          <Li>Wait 24 hours and retry</Li>
          <Li>Ask the technical team to check Supabase Function logs</Li>
        </Ul>

        <H3>Can I bulk-approve/reject?</H3>
        <P>
          Yes! In <strong>All Entries</strong>:
        </P>
        <Ol>
          <Li>Check the boxes on pending rows (or use "Select all")</Li>
          <Li>A bulk action bar appears above the table</Li>
          <Li>
            Click <strong>Approve N</strong> or <strong>Reject N</strong>
          </Li>
          <Li>One confirmation covers all selected</Li>
        </Ol>
        <P>This is great for processing a backlog of similar submissions.</P>

        <H3>How do I reach out to a nominee to encourage them to expand their profile?</H3>
        <P>
          Go to <strong>Nominated</strong>, expand the row. You'll see:
        </P>
        <Ul>
          <Li>Nominator's name and email (who nominated them)</Li>
          <Li>Nominee's name and LinkedIn link (if provided)</Li>
        </Ul>
        <P>
          You can send them a personal message via LinkedIn or email introducing the directory and encouraging them to add a full bio/photo.
        </P>

        <H3>What does "Possible duplicate" actually mean?</H3>
        <P>
          It means their name matches an existing live leader exactly (first + last name, case-insensitive). It doesn't mean they're definitely a duplicate — just that you should check before approving.
        </P>

        <H3>Do I need to read every profile in detail?</H3>
        <P>
          Yes, especially bio. Skim everything to catch:
        </P>
        <Ul>
          <Li>Spelling/grammar issues</Li>
          <Li>Vague or marketing language</Li>
          <Li>Claims that don't match their role</Li>
          <Li>Technical issues (broken LinkedIn link, weird formatting)</Li>
        </Ul>
        <P>
          You're the gate-keeper of quality. Spend 2-3 minutes per profile to get it right.
        </P>

        <H3>Can leaders delete their own profiles?</H3>
        <P>
          Yes. They visit the <strong>Manage Profile</strong> page, enter their
          name and email, and choose to delete their profile via a magic link.
          No admin action is required — completed deletions appear in the{" "}
          <strong>Activity Log</strong>.
        </P>

        <H3>What if a profile has no photo?</H3>
        <P>
          That's fine — photos are optional. You can approve a profile without one. However, profiles WITH photos get 2-3x more clicks, so encourage it in rejection reasons if you're asking for changes.
        </P>
      </>
    ),
  },
  {
    id: "overview",
    label: "📋 Overview",
    content: (
      <>
        <P>
          The Admin Console is the internal tool for managing the Women Leaders
          in Digital Health Database. From here you can:
        </P>
        <Ul>
          <Li>Review and publish new profile submissions</Li>
          <Li>
            Handle update and deletion requests from leaders already in the
            directory
          </Li>
          <Li>Manage nominated profiles and send personalised outreach</Li>
          <Li>Browse and audit the full database</Li>
        </Ul>
        <P>
          The sidebar shows live counts next to each tab so you always know what
          needs attention. Use the <strong>↻ Refresh</strong> button to reload
          the latest data from Supabase.
        </P>
        <Tip>
          <strong>Access:</strong> Click <strong>Admin</strong> in the top-right
          of the nav bar — it opens in a new tab. Auth gate is currently
          disabled for testing and will be re-enabled before launch.
        </Tip>
        <Img
          src="screenshots/admin-manual/01-overview.png"
          caption="Admin console: sidebar navigation with live counts"
        />
      </>
    ),
  },
  {
    id: "dashboard-stats",
    label: "📊 Dashboard Stats",
    content: (
      <>
        <P>
          Three summary cards are visible at the top of the All Entries, Profile
          Requests, and Nominated tabs:
        </P>
        <Table
          headers={["Card", "What it shows"]}
          rows={[
            ["Pending", "All submissions and requests awaiting action"],
            ["Live", "Leaders currently published in the public directory"],
            ["Rejected", "Profiles that have been declined or removed"],
          ]}
        />
        <Tip>
          These counts update each time you refresh. Use the <strong>↻</strong>{" "}
          button in the sidebar header to force a reload.
        </Tip>
        <Img
          src="screenshots/admin-manual/02-dashboard-stats.png"
          caption="Summary cards: Pending, Live, and Rejected counts"
        />
      </>
    ),
  },
  {
    id: "all-entries",
    label: "📝 All Entries",
    content: (
      <>
        <P>
          The full database — every record regardless of status (
          <Code>live</Code>, <Code>pending</Code>, <Code>rejected</Code>). This
          is also where you review and approve pending submissions.
        </P>
        <H3>Table columns</H3>
        <Table
          headers={["Column", "What it shows"]}
          rows={[
            ["Checkbox", "Appears on pending rows only — use for bulk actions"],
            [
              "Name",
              "First and last name; shows ⚠ Possible duplicate badge if name matches an existing live leader",
            ],
            ["Role", "Current role / title"],
            ["Organisation", "Organisation or institution"],
            [
              "LinkedIn Clicks",
              "How many times this leader's LinkedIn link has been clicked",
            ],
            ["Status", "live / pending / rejected (colour-coded badge)"],
            [
              "View",
              "Button to expand the row — toggles to Hide when open. Shows full profile details with Approve / Reject / Delete actions",
            ],
          ]}
        />
        <Img
          src="screenshots/admin-manual/03-all-entries.png"
          caption="All Entries table with filters, status badges, and search"
        />
        <H3>Reviewing a pending submission</H3>
        <Ol>
          <Li>
            Click any row to expand it — look for the yellow{" "}
            <strong>pending</strong> badge to identify entries needing review
          </Li>
          <Li>
            Read the full bio, expertise tags, years of experience, geographical
            scope, countries of operation, and any notable achievements
          </Li>
          <Li>Check the email address — it is private and never published</Li>
          <Li>
            Click <strong>Approve</strong> to publish or <strong>Reject</strong>{" "}
            to decline
          </Li>
          <Li>Confirm in the modal that appears</Li>
        </Ol>
        <H3>Bulk actions</H3>
        <Ol>
          <Li>
            Tick checkboxes on multiple pending rows (or use{" "}
            <strong>Select all</strong>)
          </Li>
          <Li>A bulk action bar appears above the table</Li>
          <Li>
            Click <strong>Approve N</strong> or <strong>Reject N</strong> — a
            single confirmation covers all selected
          </Li>
        </Ol>
        <H3>Filters</H3>
        <Ul>
          <Li>Search: name, org, role, expertise, email, country, or bio</Li>
          <Li>Status: All statuses / Pending / Live / Rejected (All Entries only)</Li>
          <Li>Country dropdown</Li>
          <Li>Expertise tag dropdown</Li>
          <Li>LinkedIn clicks: Most clicked / Least clicked (All Entries only)</Li>
        </Ul>
        <H3>Expanding a row</H3>
        <P>
          Shows full profile details. For pending entries you get{" "}
          <strong>Approve / Reject / Delete</strong> buttons. For live/rejected
          entries you get <strong>Delete</strong> only. Deletion is a hard
          delete — the record is permanently removed from the database.
        </P>
        <Note>
          <strong>On the duplicate badge:</strong> If you see ⚠ Possible
          duplicate, check whether this is genuinely the same person or a
          different person with the same name. The submitter was warned at
          submission time — you have the final call.
        </Note>
        <Img
          src="screenshots/admin-manual/10-all-entries-expanded.png"
          caption="Expanded row showing full profile details with Approve / Reject / Delete buttons"
        />
      </>
    ),
  },
  {
    id: "profile-requests",
    label: "✉️ Profile Requests",
    content: (
      <>
        <P>
          New profile submissions awaiting admin review. Update and deletion
          requests are now handled directly by leaders via the{" "}
          <strong>Manage Profile</strong> page — completed actions appear in the{" "}
          <strong>Activity Log</strong> tab.
        </P>
        <H3>New</H3>
        <P>
          Self-submitted profiles awaiting admin review. This is where you
          approve or reject new leaders.
        </P>
        <Ol>
          <Li>
            Click a row to expand it — shows all fields the leader filled in
            (personal details, expertise as pill tags, bio, notable items,
            LinkedIn)
          </Li>
          <Li>Read through the full profile before deciding</Li>
          <Li>
            Click <strong>Approve</strong> to publish the leader to the public
            directory, or <strong>Reject</strong> to decline
          </Li>
          <Li>Confirm in the modal that appears</Li>
        </Ol>
        <Note>
          New submissions are the same records that appear as{" "}
          <Code>pending</Code> in All Entries. Approving or rejecting here
          updates them everywhere.
        </Note>
        <Img
          src="screenshots/admin-manual/04-profile-requests-new.png"
          caption="Profile Requests > New sub-tab with pending submissions"
        />
        <H3>Updates</H3>
        <P>
          Leaders can now update their own profiles directly via the{" "}
          <strong>Manage Profile</strong> page with a magic link — no admin
          action required. Completed updates are logged in the{" "}
          <strong>Activity Log</strong> tab for admin visibility.
        </P>
        <Img
          src="screenshots/admin-manual/05-profile-requests-updates.png"
          caption="Profile Requests > Updates sub-tab (self-service — no admin action needed)"
        />
        <H3>Deletes</H3>
        <P>
          Leaders can remove themselves from the directory via the{" "}
          <strong>Manage Profile</strong> page with a magic link — no admin
          action required. Completed deletions are logged in the{" "}
          <strong>Activity Log</strong> tab for admin visibility.
        </P>
        <Img
          src="screenshots/admin-manual/06-profile-requests-deletes.png"
          caption="Profile Requests > Deletes sub-tab (self-service — no admin action needed)"
        />
      </>
    ),
  },
  {
    id: "nominated",
    label: "🤝 Nominated Leaders",
    content: (
      <>
        <P>
          Profiles submitted by a third party nominating a woman leader on her
          behalf. These are lightweight records — no bio or photo yet.
        </P>
        <H3>What each row shows</H3>
        <Ul>
          <Li>Nominee name and "Nominated by [name]" credit line</Li>
          <Li>LinkedIn button (if a profile URL was provided)</Li>
        </Ul>
        <H3>Actions</H3>
        <Ul>
          <Li>
            <strong>Approve</strong> — publishes the nomination record (stub
            profile) with status live
          </Li>
          <Li>
            <strong>Reject</strong> — removes it from the queue
          </Li>
        </Ul>
        <Img
          src="screenshots/admin-manual/07-nominated.png"
          caption="Nominated tab showing third-party nomination records"
        />
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────────
  // ACTIVITY LOG
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "activity-log",
    label: "📋 Activity Log",
    content: (
      <>
        <P>
          Tracks all self-service profile updates and deletions performed by
          leaders via the <strong>Manage Profile</strong> page. No admin action
          required — the log is automatically populated.
        </P>
        <H3>What's logged</H3>
        <Ul>
          <Li>
            <strong>Updates</strong> — leader name, timestamp, and the specific
            fields changed (role, organisation, LinkedIn, etc.) with old → new
            values
          </Li>
          <Li>
            <strong>Deletions</strong> — leader name, timestamp, and the reason
            they gave for removal
          </Li>
        </Ul>
        <H3>Filters</H3>
        <Ul>
          <Li>
            <strong>Action type</strong> — All actions / Updates / Deletes
          </Li>
          <Li>
            <strong>Date range</strong> — All time / Last 7 days / Last 14 days
            / Last 30 days / Custom range (from/to date pickers)
          </Li>
          <Li>
            <strong>Search</strong> — filter by leader name
          </Li>
          <Li>
            Use <strong>Clear all</strong> to reset all filters at once
          </Li>
        </Ul>
        <Note>
          The Activity Log uses its own filter bar at the top of the page —
          the general search/country/expertise filters from other tabs do not
          appear here.
        </Note>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────────
  // ⚙️ SECTION GROUP: ADVANCED WORKFLOWS & SETUP
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "email-setup",
    label: "📧 Email & Magic Links",
    content: (
      <>
        <P>
          Magic-link emails let leaders update their own profiles with no
          account or password. The flow uses a Supabase Edge Function (
          <Code>send-email</Code>).
        </P>
        <H3>How the magic link flow works</H3>
        <Ol>
          <Li>
            Leader visits the <strong>Manage Profile</strong> page and enters their
            name and email
          </Li>
          <Li>
            The system matches their profile by email and sends a magic link
            directly — no admin action required
          </Li>
          <Li>Leader clicks the link → lands on a pre-filled update form</Li>
          <Li>
            Leader can edit their details or delete their profile — all
            self-service, no account, no password, no login needed
          </Li>
          <Li>
            Completed actions appear in the{" "}
            <strong>Activity Log</strong> tab for admin visibility
          </Li>
        </Ol>
        <H3>Setup: Google Workspace (Recommended)</H3>
        <P>Ask the client to:</P>
        <Ol>
          <Li>
            Log into the Workspace admin account (e.g.{" "}
            <Code>noreply@transformhealthcoalition.org</Code>)
          </Li>
          <Li>
            Go to{" "}
            <strong>
              Google Account → Security → 2-Step Verification → App Passwords
            </strong>
          </Li>
          <Li>
            Generate a <strong>16-character app password</strong> for{" "}
            <strong>"Mail"</strong>
          </Li>
          <Li>Share the app password with the technical team</Li>
        </Ol>
        <P>
          Then configure in Supabase dashboard → Settings → Functions → Secrets:
        </P>
        <Table
          headers={["Secret", "Value"]}
          rows={[
            ["<Code>GOOGLE_SMTP_USER</Code>", "The Workspace email address"],
            ["<Code>GOOGLE_SMTP_PASS</Code>", "The 16-character app password"],
          ]}
        />
        <H3>Alternative providers</H3>
        <Ul>
          <Li>
            <strong>SendGrid:</strong> Configure <Code>SENDGRID_API_KEY</Code>
          </Li>
          <Li>
            <strong>Generic SMTP:</strong> Configure <Code>SMTP_HOST</Code>,{" "}
            <Code>SMTP_PORT</Code>, <Code>SMTP_USERNAME</Code>,{" "}
            <Code>SMTP_PASSWORD</Code>
          </Li>
        </Ul>
        <Tip>
          The <Code>send-email</Code> function tries providers in order: Google
          Workspace → SendGrid → Generic SMTP. It is already deployed — only
          secrets need to be configured.
        </Tip>
      </>
    ),
  },
  {
    id: "common-workflows",
    label: "⚙️ Common Workflows",
    content: (
      <>
        <H3>Publishing a new leader</H3>
        <Ol>
          <Li>
            Open <strong>Profile Requests → New</strong> to see all pending
            self-submissions in one place
          </Li>
          <Li>
            Click a row to expand — full profile details shown (personal info,
            expertise pills, bio, notable items, LinkedIn)
          </Li>
          <Li>
            If the leader's name matches an existing live record, a{" "}
            <strong>⚠ Possible duplicate</strong> badge appears — check before
            approving
          </Li>
          <Li>
            Click <strong>Approve</strong> → confirm → leader goes live
            instantly
          </Li>
          <Li>
            Or use <strong>All Entries</strong> with checkboxes + bulk{" "}
            <strong>Approve</strong> to process multiple at once
          </Li>
        </Ol>
        <H3>Profile updates and deletions</H3>
        <P>
          Leaders manage their own profiles via the{" "}
          <strong>Manage Profile</strong> page using a magic link — no admin
          action is required for updates or deletions. All completed actions are
          recorded in the <strong>Activity Log</strong> tab.
        </P>
        <P>
          <strong>If you need to remove a leader manually:</strong>
        </P>
        <Ol>
          <Li>
            Open <strong>All Entries</strong>, find the record
          </Li>
          <Li>
            Expand → click <strong>Delete</strong> → confirm
          </Li>
        </Ol>
        <H3>Reaching out to a nominee</H3>
        <Ol>
          <Li>
            Open <strong>Nominated</strong>, expand the nominee's row
          </Li>
          <Li>Note the nominator's email and the nominee's LinkedIn profile</Li>
          <Li>
            Reach out via your preferred channel (LinkedIn message or email)
          </Li>
        </Ol>
      </>
    ),
  },
  {
    id: "duplicate-detection",
    label: "🔄 Duplicate Detection",
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
        <Note>
          Detection is name-based only (case-insensitive). Two different people
          can share the same name — always check the email address and profile
          link before rejecting.
        </Note>
        <H3>Resolving a duplicate</H3>
        <Ol>
          <Li>
            In <strong>All Entries</strong>, look for the ⚠ Possible duplicate
            badge on pending rows
          </Li>
          <Li>
            Open <strong>All Entries</strong> and search the name to see all
            records
          </Li>
          <Li>Compare email addresses and profile details</Li>
          <Li>Approve the correct record and reject the duplicate</Li>
        </Ol>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────────
  // 📚 SECTION GROUP: REFERENCE & CHECKLISTS
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "status-reference",
    label: "📍 Status Reference",
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
        <Tip>
          Status changes are instant — approving a record publishes it
          immediately. There is no scheduled publish.
        </Tip>
      </>
    ),
  },
  {
    id: "tips-notes",
    label: "💡 Pro Tips & Notes",
    content: (
      <>
        <Ul>
          <Li>
            <strong>Refresh (↻)</strong> in the sidebar header reloads all data
            from Supabase — use this if you've been on the page a while.
          </Li>
          <Li>
            <strong>Action messages</strong> (green banner) confirm successful
            approvals, rejections, or sends. They clear automatically.
          </Li>
          <Li>
            <strong>Email addresses</strong> in expanded rows are private and
            never shown in the public directory.
          </Li>
          <Li>
            <strong>LinkedIn Clicks</strong> in All Entries shows engagement per
            profile — useful for identifying which leaders drive the most
            traffic.
          </Li>
          <Li>
            <strong>Expertise tags</strong> are shown as blue pill/badge chips —
            hover to see the full text if truncated.
          </Li>
          <Li>
            <strong>Submission review step</strong> — self-submitters now see a
            profile preview before final submission, with section-level Edit
            buttons to jump back to any step. Custom expertise ("Other") is
            limited to 3 words.
          </Li>
          <Li>
            The admin console does not show the site header or footer — it is a
            standalone internal tool.
          </Li>
          <Li>
            <strong>Live auto-refresh:</strong> Data refreshes every 30 seconds
            while the tab is visible. It also refreshes when the tab regains
            focus.
          </Li>
          <Li>
            <strong>Photo review:</strong> Profile photos are not displayed in
            the admin expanded view. To verify a photo, check the public
            directory after approval or inspect Supabase Storage directly.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: "pre-launch-checklist",
    label: "✅ Pre-Launch Checklist",
    content: (
      <>
        <P>
          Items to complete before the platform goes live — for the technical
          team:
        </P>
        <ul className="list-none ml-0 mb-4">
          <CheckItem>
            Re-enable the admin auth gate — add auth check in{" "}
            <Code>Admin.jsx</Code> (currently no auth)
          </CheckItem>
          <CheckItem>Create an admin user in Supabase Auth</CheckItem>
          <CheckItem>
            Configure SMTP secrets in Supabase — the <Code>send-email</Code>{" "}
            Edge Function is built; set <Code>GOOGLE_SMTP_USER</Code> +{" "}
            <Code>GOOGLE_SMTP_PASS</Code> (or <Code>SENDGRID_API_KEY</Code> /{" "}
            <Code>SMTP_*</Code> fallback)
          </CheckItem>
          <CheckItem>
            Add <Code>VITE_SUPABASE_URL</Code> and{" "}
            <Code>VITE_SUPABASE_ANON_KEY</Code> to GitHub Actions secrets
          </CheckItem>
          <CheckItem>
            Drop three test-mode RLS policies —{" "}
            <Code>Admin test mode: read all leaders</Code>,{" "}
            <Code>Admin test mode: update leaders</Code>,{" "}
            <Code>Admin test mode: update requests</Code>
          </CheckItem>
        </ul>
        <Note>
          The SMTP function lives at <Code>supabase/functions/send-email/</Code>
          . It supports Google Workspace SMTP, SendGrid, and generic SMTP
          fallback. Configure the relevant secrets in the Supabase dashboard
          before launch. The auth gate currently does not exist — it needs to be
          built (not just uncommented).
        </Note>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────────
  // 👥 SECTION GROUP: UNDERSTANDING THE USERS & PRODUCT
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "directory-features",
    label: "📖 Directory Features",
    content: (
      <>
        <P>
          The public directory is where users discover and browse women leaders. Understanding the user experience helps you approve profiles that work well in the directory.
        </P>

        <H3>How the Directory Works</H3>
        <P>
          Users land on the directory homepage and can:
        </P>
        <Ul>
          <Li><strong>Search:</strong> By name, organization, role, expertise, country, or bio text</Li>
          <Li><strong>Filter by Continent:</strong> Africa, Asia, Europe, North America, South America, Oceania</Li>
          <Li><strong>Filter by Country:</strong> Dependent on continent selection</Li>
          <Li><strong>Filter by Expertise:</strong> AI, Digital health, Health financing, Health systems strengthening, mHealth, Telemedicine, Research, and others</Li>
          <Li><strong>Sort:</strong> By relevance, newest, or most clicks on LinkedIn</Li>
        </Ul>

        <H3>Profile Card Display</H3>
        <P>
          Each leader appears as a card showing:
        </P>
        <Table
          headers={["Field", "What users see"]}
          rows={[
            ["Name", "Full name in readable format"],
            ["Role", "Job title (e.g., 'Digital Health Director')"],
            ["Organization", "Company/institution name"],
            ["Expertise Tags", "Blue pills showing their areas of expertise"],
            ["Bio Preview", "First 2-3 sentences of their bio"],
            ["Profile Photo", "Headshot (if uploaded and approved)"],
            ["LinkedIn Button", "Icon that links to their LinkedIn profile"],
          ]}
        />
        <Img
          src="screenshots/admin-manual/08-directory-cards.png"
          caption="Public directory showing leader profile cards with search filters"
        />
        <Tip>
          <strong>Pro tip:</strong> Visit the public directory yourself to see what users experience. Browse profiles, use filters, and test search — this gives you the user perspective when reviewing approvals.
        </Tip>

        <H3>What Makes a Good Directory Profile</H3>
        <P>
          When reviewing submissions, keep the user experience in mind:
        </P>
        <Ul>
          <Li><strong>Clear role:</strong> Users scan directory cards quickly — job titles must be specific (not 'Senior Manager' alone)</Li>
          <Li><strong>Relevant expertise:</strong> 2-5 tags that match actual experience — users filter by these</Li>
          <Li><strong>Compelling bio:</strong> First 2 sentences matter most (they show in card preview) — must hook interest</Li>
          <Li><strong>Photo quality:</strong> Professional headshot is important — consider photo when approving</Li>
          <Li><strong>Geographic metadata:</strong> Correct country + reasonable scope (Local/National/Regional/Global) improves discovery</Li>
        </Ul>

        <Tip>
          When you see a vague bio ("I work in health tech"), imagine it on a directory card. Is it compelling enough to click? If not, ask the submitter to improve it before approval.
        </Tip>

        <H3>LinkedIn Clicks Metric</H3>
        <P>
          The directory tracks how often each profile's LinkedIn link is clicked. This metric appears in the admin console's "All Entries" tab under the LinkedIn Clicks column. You can filter by "Most Clicked" to see which profiles generate the most engagement.
        </P>
        <Note>
          High LinkedIn clicks indicate profiles that are discoverable and interesting to directory users — useful for identifying successful profiles to use as examples when coaching other submitters on bio quality.
        </Note>
      </>
    ),
  },
  {
    id: "analytics-dashboard",
    label: "📊 Analytics Dashboard",
    content: (
      <>
        <P>
          The Analytics page provides insights into directory usage, geographic coverage, and expertise distribution. This is useful for understanding who is in your directory and where gaps might exist.
        </P>

        <H3>Key Analytics Views</H3>
        <Table
          headers={["View", "What it shows", "Useful for"]}
          rows={[
            ["Map Visualization", "World map with leaders highlighted by region. Click regions to drill down.", "Understanding geographic coverage and identifying underrepresented areas"],
            ["Regional Breakdown", "Bar chart showing expertise distribution for selected region", "Seeing expertise gaps in specific regions (e.g., Africa has few AI specialists)"],
            ["Total Stats", "Total leader count and total organizations represented", "High-level directory growth tracking"],
            ["Expertise Distribution", "All expertise tags ranked by frequency across directory", "Understanding which skills are most common (helps guide recruitment)"],
          ]}
        />
        <Img
          src="screenshots/admin-manual/09-analytics-dashboard.png"
          caption="Analytics dashboard with world map, regional breakdown, and expertise distribution charts"
        />

        <H3>How to Use Analytics</H3>
        <Ol>
          <Li>
            <strong>Regional Review:</strong> Click each continent to see expertise breakdown. Are there gaps? This helps identify recruitment targets.
          </Li>
          <Li>
            <strong>Trend Tracking:</strong> Monitor total leader count over time to measure growth.
          </Li>
          <Li>
            <strong>Expertise Balance:</strong> If "AI" is 40% of all expertise tags, you may be skewed toward tech. Consider recruiting more health systems or policy experts.
          </Li>
          <Li>
            <strong>Organization Diversity:</strong> Compare total leaders vs. total organizations. If 80 leaders work for 40 orgs, many orgs are overrepresented.
          </Li>
        </Ol>

        <H3>What Analytics Can't Show</H3>
        <Ul>
          <Li>Individual profile quality (analytics only show count, not content review)</Li>
          <Li>Engagement with profiles (that's LinkedIn clicks, tracked separately in All Entries tab)</Li>
          <Li>Duplicate profiles or inactive leaders (you review those manually)</Li>
          <Li>Real-time data — analytics refresh when you load the page</Li>
        </Ul>

        <Tip>
          Use analytics to identify recruitment focus areas. For example: "Asia has 30 leaders but only 5 in Health Systems Strengthening — we should target that expertise in Asia recruitment."
        </Tip>
      </>
    ),
  },
  {
    id: "submit-profile-flow",
    label: "✍️ Submit Profile User Flow",
    content: (
      <>
        <P>
          Understanding how leaders submit profiles helps you anticipate common mistakes and provide better feedback during the review process.
        </P>

        <H3>Two Submission Paths</H3>
        <Table
          headers={["Path", "Who uses it", "How it works"]}
          rows={[
            [
              "Self-Submit",
              "Women leaders directly",
              "6-step form: Consent → Basic Info → Profile → Links → Review → Submit",
            ],
            [
              "Nomination",
              "Anyone nominating a leader",
              "Different form: Nominator info → Nominee name → Choice to have nominee fill out profile or auto-populate some fields",
            ],
          ]}
        />

        <H3>Self-Submission Steps (What Users Experience)</H3>
        <Ol>
          <Li>
            <strong>Step 0 - Start:</strong> User chooses "Submit My Profile" or "Nominate Someone"
          </Li>
          <Li>
            <strong>Step 1 - Consent:</strong> Agrees to privacy terms and that profile will be public
          </Li>
          <Li>
            <strong>Step 2 - Basic Info:</strong> Name, email, role, organization. Email is used for follow-up if profile is rejected.
          </Li>
          <Li>
            <strong>Step 3 - Profile Details:</strong> Expertise tags (checkboxes), bio, photo upload, years of experience, country, geographic scope, and country list if scope is regional/global
          </Li>
          <Li>
            <strong>Step 4 - Links:</strong> LinkedIn URL (optional but encouraged), and notable achievements can be added as bullet points
          </Li>
          <Li>
            <strong>Step 5 - Review:</strong> User sees full profile preview before final submission. Edit buttons appear on each section to jump back and fix issues.
          </Li>
          <Li>
            <strong>Submit:</strong> Profile is created with status = "pending" and appears in your admin console
          </Li>
        </Ol>
        <Img
          src="screenshots/admin-manual/11-submit-profile-flow.png"
          caption="Multi-step submission form showing one of the profile data entry steps"
        />

        <H3>Smart Features in the Form</H3>
        <Ul>
          <Li><strong>Draft Auto-Save:</strong> Form data is saved to browser LocalStorage after each step — users can close the tab and return to their draft later</Li>
          <Li><strong>Duplicate Detection:</strong> If name matches an existing published leader, submitter sees a warning before final submission</Li>
          <Li><strong>Photo Compression:</strong> Images are automatically resized to reduce file size, so uploads stay fast</Li>
          <Li><strong>Expertise Customization:</strong> Pre-defined expertise list with "Other: [custom]" option for unique skills (limited to 3 words)</Li>
          <Li><strong>Step-by-Step Progress:</strong> User sees which step they're on and can jump between steps in the Review section</Li>
        </Ul>

        <H3>Common Submission Issues (Why Profiles Get Rejected)</H3>
        <Table
          headers={["Issue", "Why it happens", "How to guide submitter"]}
          rows={[
            [
              "Vague bio",
              "User rushes and writes 1-2 generic sentences",
              "Reject with feedback: 'Please provide 3-4 sentences showing your specific impact, e.g., projects led or outcomes achieved'",
            ],
            [
              "Missing expertise tags",
              "User unchecks all tags accidentally or leaves blank",
              "Request resubmission: 'Please select at least 2 expertise areas'",
            ],
            [
              "No LinkedIn link",
              "User thinks it's optional (it is, but encouraged)",
              "Approve but suggest adding LinkedIn in follow-up for future credibility",
            ],
            [
              "Wrong country or scope",
              "User doesn't understand 'regional' vs 'global' scope",
              "Send back with example: 'If you work in 3 countries, select Regional and list those 3 countries'",
            ],
            [
              "Professional photo issues",
              "Low-quality, casual, or blurry photo",
              "Reject or approve but suggest professional headshot: 'Photo must be professional headshot (shoulders up, professional attire)'",
            ],
          ]}
        />

        <H3>After Submission</H3>
        <P>
          When you approve a profile:
        </P>
        <Ul>
          <Li>Status changes to "live" immediately — profile is published to the public directory</Li>
          <Li>User does NOT receive a confirmation email (email workflow not yet enabled)</Li>
          <Li>Profile is searchable and discoverable in the directory</Li>
        </Ul>
        <P>
          When you reject a profile:
        </P>
        <Ul>
          <Li>Status changes to "rejected"</Li>
          <Li>User sees rejection reason in the Profile Requests section (if you add comments)</Li>
          <Li>User can resubmit after making fixes</Li>
          <Li>Currently, no rejection email is sent — consider adding one in future versions</Li>
        </Ul>

        <Tip>
          When rejecting, always include actionable feedback in the Comments field. Users need to know exactly what to fix, not just "bio too vague" — tell them specifically what to add or improve.
        </Tip>
      </>
    ),
  },
];

// ── Category grouping for better sidebar organization ────────────────────────
const CATEGORIES = [
  {
    icon: "🚀",
    title: "Getting Started",
    sections: ["quick-start-hub", "overview"],
  },
  {
    icon: "⭐",
    title: "Daily Admin Tasks",
    sections: [
      "approval-quick-ref",
      "dashboard-stats",
      "all-entries",
      "profile-requests",
      "nominated",
    ],
  },
  {
    icon: "👥",
    title: "Understanding Users & Product",
    sections: ["directory-features", "submit-profile-flow", "analytics-dashboard"],
  },
  {
    icon: "⚙️",
    title: "Advanced Workflows & Setup",
    sections: ["email-setup", "common-workflows", "duplicate-detection"],
  },
  {
    icon: "📚",
    title: "Reference & Checklists",
    sections: ["status-reference", "tips-notes", "pre-launch-checklist"],
  },
  {
    icon: "❓",
    title: "Help & Troubleshooting",
    sections: ["admin-faq"],
  },
];

// ── Main component ───────────────────────────────────────────────────────────
export default function AdminManual({ onBackToAdmin }) {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [pdfLoading, setPdfLoading] = useState(false);

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);
  const activeSection = SECTIONS[activeIndex];
  const prev = SECTIONS[activeIndex - 1] ?? null;
  const next = SECTIONS[activeIndex + 1] ?? null;

  const downloadPdf = () => {
    setPdfLoading(true);

    // Collect all compiled stylesheets (skip cross-origin)
    let css = "";
    for (const sheet of document.styleSheets) {
      try {
        if (sheet.cssRules) {
          for (const rule of sheet.cssRules) css += rule.cssText;
        }
      } catch {}
    }

    // Clone the print-only container's rendered HTML
    const printEl = document.querySelector(".print-only");
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>${css}
body{margin:0;padding:15mm;font-family:system-ui,sans-serif;background:#fff}
.print-section{page-break-before:always}
.print-section:first-of-type{page-break-before:auto}
.print-cover{page-break-after:always;text-align:center;padding-top:80mm}
.print-cover h1{font-size:26pt;font-weight:700;color:#1a365d;margin:0}
.print-cover p{font-size:14pt;color:#4a5568;margin-top:8pt}
.print-cover .date{font-size:11pt;color:#718096;margin-top:20pt}
.print-body{font-size:11pt;line-height:1.6;color:#2d3748}
.print-body h2{font-size:18pt;font-weight:700;color:#1a365d;border-bottom:2px solid #2b6cb0;padding-bottom:4pt;margin-bottom:10pt}
</style></head><body>${printEl.innerHTML}</body></html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;left:-9999px;width:210mm;border:0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          setPdfLoading(false);
        }, 1000);
      }, 500);
    };
  };

  return (
    <>
      <style>{".print-only{display:none}"}</style>
      <div className="flex h-full overflow-hidden bg-white no-print">
        {/* TOC sidebar */}
        <nav className="flex flex-col w-[200px] xl:w-[220px] flex-shrink-0 border-r border-gray-200 bg-brand-parchment overflow-y-auto py-6 px-3 gap-0.5">
          <p className="text-[1.3rem] uppercase tracking-widest text-gray-400 font-semibold mb-3 px-2">
            Contents
          </p>
          <button
            onClick={downloadPdf}
            disabled={pdfLoading}
            className="mx-2 mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[1.3rem] font-medium bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {pdfLoading ? "Generating PDF…" : "Download PDF"}
          </button>
          <button
            onClick={onBackToAdmin}
            className="mx-2 mb-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[1.3rem] font-medium bg-brand-pink text-white hover:bg-brand-pink/90 transition-colors cursor-pointer"
          >
            ← Back to Admin
          </button>
          {/* Render sections organized by category */}
          {CATEGORIES.map((category, catIndex) => (
            <div key={catIndex} className="mb-4">
              {/* Category header */}
              <p className="text-[1.2rem] font-bold text-brand-navy px-2 py-2 mb-2">
                {category.icon} {category.title}
              </p>
              {/* Category sections */}
              {category.sections.map((sectionId, sIdx) => {
                const section = SECTIONS.find((s) => s.id === sectionId);
                if (!section) return null;
                const isActive = sectionId === activeId;
                return (
                  <button
                    key={sectionId}
                    onClick={() => setActiveId(sectionId)}
                    className={`text-left text-[1.3rem] px-4 py-2 rounded-lg transition-colors cursor-pointer ml-2 flex items-start gap-2 w-[calc(100%-8px)] ${
                      isActive
                        ? "bg-brand-navy text-white font-semibold"
                        : "text-gray-600 hover:bg-gray-100 hover:text-brand-navy"
                    }`}
                  >
                    <span className="text-[1.1rem] flex-shrink-0 mt-0.5">•</span>
                    <span className="break-words flex-1">{section.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Section content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with back button */}
          <div className="flex-shrink-0 flex items-center justify-between px-10 py-4 border-b border-gray-200 bg-white">
            <button
              onClick={onBackToAdmin}
              className="flex items-center gap-2 text-[1.4rem] font-medium text-brand-pink hover:text-brand-navy transition-colors cursor-pointer"
            >
              ← Back to Admin Console
            </button>
            <span className="text-[1.4rem] font-semibold text-brand-navy">
              {activeSection?.label}
            </span>
            <div />
          </div>
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
            ) : (
              <span />
            )}
            {next ? (
              <button
                onClick={() => setActiveId(next.id)}
                className="flex items-center gap-2 text-[1.4rem] font-medium text-gray-600 hover:text-brand-navy transition-colors cursor-pointer"
              >
                {next.label} →
              </button>
            ) : (
              <span className="text-[1.4rem] text-gray-400 italic">
                End of manual
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Print-only container — rendered when user chooses Save as PDF */}
      <div
        className="print-only"
        style={{
          display: "none",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
        }}
      >
        <div className="print-cover">
          <h1>Admin Console User Manual</h1>
          <p>Transform Health — Women Leaders in Digital Health Database</p>
          <p className="date">
            Generated{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={s.id} className="print-section">
            <h2>
              {String(i + 1).padStart(2, "0")}. {s.label}
            </h2>
            <div className="print-body">{s.content}</div>
          </div>
        ))}
      </div>
    </>
  );
}
