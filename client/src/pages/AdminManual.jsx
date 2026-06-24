import React, { useState, useEffect } from "react";

// ── Shared primitives ────────────────────────────────────────────────────────
function H3({ children }) {
  return (
    <h3 className="text-[1.8rem] font-bold text-brand-navy mt-8 mb-3 pb-1 border-b-2 border-brand-pink/30">
      {children}
    </h3>
  );
}
function H4({ children }) {
  return (
    <h4 className="text-[1.6rem] font-semibold text-brand-dark mt-6 mb-2">
      {children}
    </h4>
  );
}
function P({ children }) {
  return (
    <p className="text-[1.4rem] text-gray-700 leading-[1.8] mb-3">{children}</p>
  );
}
function Li({ children }) {
  return (
    <li className="text-[1.4rem] text-gray-700 leading-[1.8] mb-1">
      {children}
    </li>
  );
}
function Ul({ children }) {
  return <ul className="list-disc list-outside ml-6 mb-4">{children}</ul>;
}
function Ol({ start, children }) {
  return <ol start={start} className="list-decimal list-outside ml-6 mb-4">{children}</ol>;
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
      <div className="text-[1.35rem] text-amber-800 leading-[1.7] m-0">
        {children}
      </div>
    </div>
  );
}
function Tip({ children }) {
  return (
    <div className="bg-brand-blue-tint border-l-4 border-brand-navy rounded-r-lg px-5 py-3 mb-4">
      <div className="text-[1.35rem] text-brand-navy leading-[1.7] m-0">
        {children}
      </div>
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
function CheckItem({ checked, children }) {
  return (
    <li className="flex items-start gap-3 mb-2">
      <span className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center text-[1.2rem] ${
        checked
          ? "bg-green-500 border-green-500 text-white"
          : "border-gray-300 bg-white"
      }`}>
        {checked ? "✓" : ""}
      </span>
      <span className={`text-[1.5rem] leading-[1.7] ${
        checked ? "text-gray-500 line-through" : "text-gray-700"
      }`}>
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
          Quick access to all project documentation. Each card below opens a document on <strong>GitHub</strong> — this is where the full written guides are stored. GitHub renders them as clean, readable pages (no coding knowledge needed — just click and read).
        </P>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-4 mb-6 text-[1.35rem] text-blue-800 leading-relaxed">
          <strong>📂 About these links:</strong> All documentation is stored in the project's GitHub repository. When you click a card, GitHub opens the document as a formatted page. You do not need a GitHub account to read them.
        </div>

        <H3>Start Here — Admin Essentials</H3>
        <P>If you're new to the admin console, read these two first.</P>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DocCard
            icon="🎯"
            title="Data Quality Standards"
            description="Profile approval criteria, field requirements, and what makes a publishable profile. You'll use this every time you review a submission."
            link="https://github.com/Transform-Health-2/Women-leaders-database/blob/main/docs/05-data-quality-standards.md"
          />
          <DocCard
            icon="❓"
            title="Admin FAQ"
            description="Answers to common admin questions about workflows, approvals, and troubleshooting."
            link="https://github.com/Transform-Health-2/Women-leaders-database/blob/main/docs/04-faq.md#for-everyone"
          />
        </div>

        <H3>Understand the Product</H3>
        <P>Background reading to understand what you're managing and why it was built this way.</P>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DocCard
            icon="🚀"
            title="Product Overview"
            description="Mission, features, user roles, and business strategy. Read this first to understand the big picture."
            link="https://github.com/Transform-Health-2/Women-leaders-database/blob/main/docs/01-product-overview.md"
          />
          <DocCard
            icon="📋"
            title="Full Documentation Index"
            description="Master list of all documents organised by audience and task — useful if you're looking for something specific."
            link="https://github.com/Transform-Health-2/Women-leaders-database/blob/main/docs/00-documentation-index.md"
          />
        </div>

        <H3>User Guides (for Admin Context)</H3>
        <P>These are written for leaders and nominators, but reading them helps you understand what submitters experience — useful when reviewing or troubleshooting.</P>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DocCard
            icon="👩‍💼"
            title="Submit Profile Guide"
            description="The step-by-step journey a leader goes through to submit their profile."
            link="https://github.com/Transform-Health-2/Women-leaders-database/blob/main/docs/02-submit-profile-guide.md"
          />
          <DocCard
            icon="🤝"
            title="Nominator Guide"
            description="How someone nominates a leader — understand the nomination workflow and what to expect on your end."
            link="https://github.com/Transform-Health-2/Women-leaders-database/blob/main/docs/03-nominator-guide.md"
          />
        </div>

        <H3>Legal & Privacy</H3>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <DocCard
            icon="🔒"
            title="Privacy Policy & Data Handling"
            description="GDPR/CCPA compliance, data retention, and user rights. Reference this when handling sensitive data or responding to data requests."
            link="https://github.com/Transform-Health-2/Women-leaders-database/blob/main/docs/06-privacy-policy.md"
          />
        </div>

        <H3>What's New</H3>
        <Ul>
          <Li>
            <strong>Activity Log</strong> — track all self-service profile updates
            and deletions with filters by action type, date range, and name
          </Li>
          <Li>
            <strong>View button</strong> — expand any row in All Entries with a
            dedicated View / Hide button in its own column
          </Li>
          <Li>
            <strong>Smarter filters</strong> — click count and status filters only
            appear on tabs where they apply
          </Li>
          <Li>
            <strong>Tooltips</strong> — hover over any sidebar tab to see its full label
          </Li>
        </Ul>

        <Tip>
          <strong>Pro tip:</strong> Bookmark the Data Quality Standards — you'll reference it every time you review a profile.
        </Tip>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────────
  // ⭐ SECTION GROUP: DAILY ADMIN TASKS
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "approval-quick-ref",
    label: "✓ Approval Checklist",
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
        <Img
          src="screenshots/admin-manual/pending_submission_expanded.png"
          caption="Expanded pending submission — read the full profile before clicking Approve or Reject"
        />
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────────
  // ❓ SECTION GROUP: HELP & TROUBLESHOOTING
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "admin-faq",
    label: "❓ FAQ & Troubleshooting",
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
        <P>It's fully self-service — no admin action required.</P>
        <Ol>
          <Li>
            Leader clicks <strong>"Already in the directory? Manage or remove your
            profile"</strong> at the bottom of any Database or Analytics page
          </Li>
          <Li>
            Manage Profile modal opens — they add their email and click{" "}
            <strong>Find my profile</strong> (name and LinkedIn are pre-filled
            from their profile card)
          </Li>
          <Li>
            System sends a magic link to their email — no password needed
          </Li>
          <Li>
            Clicking the link opens a pre-filled form covering every field: name,
            role, organisation, photo, bio, LinkedIn, expertise, country, years
            of experience, geographical scope, countries of work, and notable
            items (publications, projects, awards)
          </Li>
          <Li>
            Empty fields show an amber <strong>Missing</strong> badge — leaders
            know exactly what to complete
          </Li>
          <Li>
            Changes save instantly to the database. Completed actions appear in
            the <strong>Activity Log</strong> for admin visibility
          </Li>
        </Ol>

        <H3>What if the email never sent?</H3>
        <P>
          Check that the <Code>self-service</Code> Supabase function is deployed and{" "}
          <Code>APPS_SCRIPT_URL</Code> is configured. If configured correctly:
        </P>
        <Ul>
          <Li>Ask the leader to check spam folder</Li>
          <Li>Magic links expire after 48 hours — request a new one if expired</Li>
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

        <H3>How do I add or remove an admin user?</H3>
        <P>
          Only <strong>super admins</strong> can manage admin users. Open the{" "}
          <strong>Manage Admins</strong> tab in the sidebar, then:
        </P>
        <Ol>
          <Li>
            To <strong>add</strong>: enter the user's email, select a role
            (Editor / Admin / Super Admin), and click Add
          </Li>
          <Li>
            To <strong>remove</strong>: find the user in the list and click
            Remove (super admins cannot be removed via the console to prevent
            lockout)
          </Li>
        </Ol>
        <P>
          All changes are logged in the admin activity log. See the{" "}
          <strong>Manage Admin Users</strong> section for full role
          descriptions.
        </P>
      </>
    ),
  },
  {
    id: "overview",
    label: "📋 Console Overview",
    content: (
      <>
        <P>
          The Admin Console is the internal tool for managing the Women Leaders
          in Digital Health Database. It is organised into tabs in the sidebar,
          each with a live count badge:
        </P>
        <Ul>
          <Li>
            <strong>All Entries</strong> — the full database: browse, search,
            filter, sort, and approve/reject pending submissions
          </Li>
          <Li>
            <strong>Profile Requests</strong> — self-service update and deletion
            requests submitted by leaders
          </Li>
          <Li>
            <strong>Nominated</strong> — profiles submitted on behalf of someone
            else, ready for admin outreach
          </Li>
          <Li>
            <strong>Activity Log</strong> — a record of every self-service update
            and deletion, filterable by action type, date range, and name
          </Li>
          <Li>
            <strong>Documentation</strong> — this manual, including the
            <strong> Product Report</strong> covering technical architecture,
            cost, licensing, dependencies, and the handover checklist
          </Li>
        </Ul>
        <P>
          The sidebar shows live counts next to each tab so you always know what
          needs attention. Hover over any tab for a tooltip. Use the{" "}
          <strong>↻ Refresh</strong> button to reload the latest data from Supabase.
          The admin auto-refreshes every 30 seconds and on tab visibility change.
        </P>
        <P>
          <strong>Non-technical content management:</strong> Leaders manage their
          own profiles entirely without admin intervention via the self-service
          magic link flow — they find their profile, request a magic link by email,
          and edit or delete their data directly. The admin only needs to review
          new submissions and nominations.
        </P>
        <P>
          A detailed <strong>Product Report</strong> is available in the Documentation
          section (<code>Reference &amp; Checklists → Product Report</code>) covering
          the full technical architecture, platform assessment, cost/licensing
          breakdown, accessibility features, and the handover checklist for
          transferring the codebase to Transform Health.
        </P>
        <Tip>
          <strong>Access:</strong> Scroll to the bottom of any public page and
          click the discreet <strong>shield icon (🛡)</strong> in the footer.
          Sign in with your admin email and password when prompted. The page
          shows a loading spinner while data is fetched, and each tab loads its
          data lazily when selected.
        </Tip>
        <Img
          src="screenshots/admin-manual/shield-icon-detail.png"
          caption="The discreet shield icon in the site footer — click to access the admin login"
        />
        <Img
          src="screenshots/admin-manual/admin-login.png"
          caption="Admin login screen — sign in with your Supabase Auth email and password"
        />
        <Img
          src="screenshots/admin-manual/01-overview.png"
          caption="Admin Console — All Entries tab showing the full sidebar and leader table"
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
          Three summary cards are visible at the top of the{" "}
          <strong>All Entries</strong> tab: Pending, Live, and Rejected.
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
          src="screenshots/admin-manual/01-overview.png"
          caption="All Entries — Pending, Live, and Rejected stat cards visible at the top"
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
          src="screenshots/admin-manual/pending_submission_expanded.png"
          caption="Expanded pending submission — full profile details with Approve / Reject / Delete buttons"
        />

        <H3>Filling missing profile fields (Enrichment)</H3>
        <P>
          For live leaders with incomplete profiles (missing bio, photo, country,
          etc.), you can send them a magic link directly from the expanded row.
          Enter their email in the input box and click <strong>Send magic link</strong>
          — they'll receive a link to fill in their missing fields themselves.
        </P>
        <Img
          src="screenshots/admin-manual/profile-with-missing-fields.png"
          caption="Expanded leader row showing missing fields with enrichment input box to send a magic link"
        />

        <H3>Rejection Modal</H3>
        <P>
          When you click <strong>Reject</strong> on a pending entry, a confirmation
          modal appears asking you to confirm. The profile status changes to{" "}
          <strong>rejected</strong> — it is hidden from the public directory and
          removed from the pending queue. The submitter can resubmit with corrections.
        </P>
        <P>
          There is no undo button. If you reject by mistake, the submitter can
          resubmit. If you approve incorrectly, use <strong>Delete</strong> to
          permanently remove the record.
        </P>
        <Img
          src="screenshots/admin-manual/profile_rejection_modal.png"
          caption="Rejection confirmation modal — confirm to move profile to rejected"
        />

        <H3>Rejected Submission List</H3>
        <P>
          Rejected profiles remain in the database and are visible in{" "}
          <strong>All Entries</strong> when you filter by status{" "}
          <strong>Rejected</strong>. This lets you review past decisions if needed.
          Rejected entries can be:
        </P>
        <Ul>
          <Li>Viewed — full profile details are still accessible</Li>
          <Li>Deleted — hard delete, permanently removes the record</Li>
          <Li>Re-approved — not possible directly; the submitter must resubmit</Li>
        </Ul>
        <P>
          The <strong>Rejected</strong> stat card at the top of All Entries shows
          the total count. Filter by Rejected status to see all declined profiles.
        </P>
      </>
    ),
  },
  {
    id: "profile-requests",
    label: "✉️ Submissions",
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

        <H3>Pending Profile Requests</H3>
        <P>
          All unprocessed submissions appear under the <strong>New</strong> tab
          with a <strong>pending</strong> status badge. Each row shows the
          submitter's name, organisation, country, and submission date. Click a
          row to expand it and review the full profile before approving or rejecting.
        </P>
        <P>
          The pending queue includes both self-submitted profiles and nominated
          leaders awaiting review. The <strong>Pending</strong> count at the top
          of the Submissions section shows how many profiles need your attention.
        </P>
        <Img
          src="screenshots/admin-manual/profile_request.png"
          caption="Pending profile request — expand to review and approve/reject"
        />

        <H3>Rejected Submissions</H3>
        <P>
          Rejected profiles are still visible in the Submissions section — they
          are moved to a separate view within the same tab. You can review why
          a profile was rejected and, if needed, delete it permanently. Rejected
          submitters can resubmit with corrections, which creates a new pending
          entry.
        </P>
        <Img
          src="screenshots/admin-manual/rejected_submissions.png"
          caption="Rejected submissions list — review past decisions or permanently delete"
        />

        <H3>Updates &amp; Deletions</H3>
        <P>
          Leaders update and remove their own profiles directly via the{" "}
          <strong>Manage Profile</strong> page using a magic link — no admin
          action required. All completed changes are automatically recorded in
          the <strong>Activity Log</strong> tab for admin visibility.
        </P>
        <P>
          The edit form covers every field from the original submission: name,
          role, organisation, photo, bio, LinkedIn, expertise tags, country,
          years of experience, geographical scope, countries of work, and
          notable items. Fields that are still empty are highlighted with an
          amber           <strong>Missing</strong> badge so the leader knows exactly what
          to complete.
        </P>
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
        <Img
          src="screenshots/admin-manual/nominated_list_view.png"
          caption="Nominated leaders list — lightweight profiles submitted by third parties"
        />
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
          src="screenshots/admin-manual/nominated.png"
          caption="Expanded nominated leader — review and approve or reject"
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

  {
    id: "manage-admin-users",
    label: "👥 Manage Admin Users",
    content: (
      <>
        <P>
          The <strong>Manage Admin Users</strong> tab is visible only to{" "}
          <strong>super admins</strong>. It controls who can access the admin
          console and what they can do. All changes are recorded in the Admin
          activity log at the bottom of that tab.
        </P>

        <H3>Roles</H3>
        <P>
          There are three roles. Each is a strict subset of the one above it —
          an editor cannot do anything an admin can, and an admin cannot manage
          other admin users.
        </P>
        <Table
          headers={["Role", "Who it's for", "What they can do", "What they cannot do"]}
          rows={[
            [
              "Super admin",
              "Platform owner / technical lead",
              "Everything admin can do + add and remove other admin users",
              "Cannot be removed via the console (prevents lockout)",
            ],
            [
              "Admin",
              "Core team members managing the directory",
              "Approve and reject submissions, delete leaders, send enrichment magic links, view all profile data and gaps",
              "Cannot add or remove other admin users",
            ],
            [
              "Editor",
              "Reviewers or observers who need read access",
              "View all entries and profile data, see which fields are missing from any profile, send enrichment magic links to leaders",
              "Cannot approve, reject, delete, or manage admin users",
            ],
          ]}
        />
        <Tip>
          Use <strong>Editor</strong> for team members who need visibility and
          can reach out to leaders via magic link, but should not approve or
          remove entries. Promote to <strong>Admin</strong> when they need
          full action rights.
        </Tip>

        <Img
          src="screenshots/admin-manual/12-manage-admin.png"
          caption="Manage Admin Users tab — add users, assign roles, and view the activity log"
        />

        <H3>Adding a new user</H3>
        <Ol>
          <Li>Open the <strong>Manage Admin Users</strong> tab (super admin only).</Li>
          <Li>Enter the person's email address in the input field.</Li>
          <Li>Select their role from the dropdown.</Li>
          <Li>Click <strong>Add user</strong>.</Li>
        </Ol>
        <P>
          The system will create a Supabase Auth account for that email if one
          does not already exist, assign the role, and send an invitation email
          with a link to the admin console. The new user should click{" "}
          <strong>Forgot password?</strong> on the login page to set their
          password on first sign-in.
        </P>
        <Note>
          If the person already has a Supabase Auth account (e.g. they
          previously submitted a leader profile), the system assigns the role to
          their existing account — no duplicate is created.
        </Note>

        <H3>Removing a user</H3>
        <P>
          Click the <strong>✕</strong> button next to any non-super-admin user
          and confirm the prompt. Access is revoked immediately. Super admins
          cannot be removed through the console.
        </P>

        <H3>Admin activity log</H3>
        <P>
          Every add and remove action is recorded at the bottom of the Manage
          Admin Users tab. Each entry shows what happened, who performed the
          action, and when. The log is read-only.
        </P>
        <Note>
          The admin activity log requires the <Code>admin_activity_log</Code>{" "}
          table to exist in Supabase. Run{" "}
          <Code>scripts/create-admin-activity-log.sql</Code> in the Supabase SQL
          Editor if it has not been set up yet.
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
          Magic-link emails let leaders update or delete their own profiles
          without an account or password. The leader flow is covered in the{" "}
          <strong>Manage Profile User Flow</strong> section — this section
          covers the technical setup.
        </P>
        <H3>Email setup: Google Apps Script relay</H3>
        <P>
          Magic link emails are sent via a Google Apps Script web app that relays
          through Google Workspace's built-in mailing. No SMTP credentials needed.
        </P>
        <P>To set up or replace:</P>
        <Ol>
          <Li>
            Go to <strong>script.google.com</strong> → New project → paste the
            code from <Code>apps-script/Code.gs</Code>
          </Li>
          <Li>
            Deploy → New deployment → Web app (Execute as: <strong>Me</strong>,
            Who has access: <strong>Anyone</strong>)
          </Li>
          <Li>
            Authorize the script to send emails when prompted
          </Li>
          <Li>
            Copy the deployment URL and set it as the{" "}
            <Code>APPS_SCRIPT_URL</Code> secret on the{" "}
            <Code>self-service</Code> Supabase Edge Function (Supabase Dashboard
            → Settings → Edge Functions → Secrets)
          </Li>
        </Ol>
        <Note>
          The <Code>self-service</Code> function must be deployed to the Supabase
          project with <Code>APPS_SCRIPT_URL</Code>, <Code>MAGIC_LINK_SECRET</Code>,
          and <Code>ADMIN_NOTIFY_EMAIL</Code> configured. It handles token
          generation, token verification, and email sending — the project uses
          exactly 2 Edge Functions (<Code>self-service</Code> +{" "}
          <Code>manage-admin</Code>) to stay within the Supabase free tier limit.
        </Note>

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
    label: "📍 Status & Tips",
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
  
  // ────────────────────────────────────────────────────────────────────────
  // 👥 SECTION GROUP: UNDERSTANDING THE USERS & PRODUCT
  // ────────────────────────────────────────────────────────────────────────

  {
    id: "directory-features",
    label: "📖 Directory & Search",
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
          src="screenshots/01-database-grid.png"
          caption="Public directory — leader profile cards grid with search and filters"
        />
        <Img
          src="screenshots/02-database-profile-modal.png"
          caption="Profile modal — full leader details including bio, expertise tags, and LinkedIn"
        />
        <Img
          src="screenshots/03-database-search.png"
          caption="Directory search in action — filtering by expertise, continent, and keyword"
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
    label: "📊 Analytics",
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
          src="screenshots/04-analytics-overview.png"
          caption="Analytics page — world map with regional highlights and expertise distribution panel"
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
    label: "✍️ Submit Profile Flow",
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
            <strong>Step 0 - Start:</strong> User chooses "I am nominating myself" or "I am nominating someone else"
          </Li>
        </Ol>
        <Img
          src="screenshots/05-submit-step0-self.png"
          caption="Step 0 (self-submit path) — consent notice and path selection"
        />
        <Img
          src="screenshots/06-submit-step0-nominate.png"
          caption="Step 0 (nominate path) — nominating a leader on their behalf"
        />
        <Ol start={2}>
          <Li>
            <strong>Step 1 - Consent:</strong> Agrees to privacy terms and that profile will be public
          </Li>
        </Ol>
        <Img
          src="screenshots/07-submit-step1-consent.png"
          caption="Step 1 — Consent to privacy terms before submitting"
        />
        <Ol start={3}>
          <Li>
            <strong>Step 2 - Basic Info:</strong> Name, email, role, organization. Email is used for follow-up if profile is rejected.
          </Li>
        </Ol>
        <Img
          src="screenshots/08-submit-step2-basicinfo.png"
          caption="Step 2 — Basic information: name, email, role, and organisation"
        />
        <Ol start={4}>
          <Li>
            <strong>Step 3 - Profile Details:</strong> Expertise tags (checkboxes), bio, photo upload, years of experience, country, geographic scope, and country list if scope is regional/global
          </Li>
        </Ol>
        <Img
          src="screenshots/09-submit-step3-profile.png"
          caption="Step 3 — Profile details: expertise tags, bio, photo, experience, and geography"
        />
        <Ol start={5}>
          <Li>
            <strong>Step 4 - Links:</strong> LinkedIn URL (optional but encouraged), and notable achievements can be added as bullet points
          </Li>
        </Ol>
        <Img
          src="screenshots/10-submit-step4-links.png"
          caption="Step 4 — Links and notable achievements"
        />
        <Ol start={6}>
          <Li>
            <strong>Step 5 - Review:</strong> User sees full profile preview before final submission. Edit buttons appear on each section to jump back and fix issues.
          </Li>
          <Li>
            <strong>Submit:</strong> Profile is created with status = "pending" and appears in your admin console
          </Li>
        </Ol>
        <Img
          src="screenshots/11-submit-step5-review.png"
          caption="Step 5 — Review full profile preview with Edit buttons per section before submitting"
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
  {
    id: "manage-profile-flow",
    label: "🔐 Manage Profile Flow",
    content: (
      <>
        <P>
          Leaders can update or delete their own profiles without an account or
          password using the self-service magic link flow. Understanding how this
          works helps you answer leader questions and know what to expect in the
          Activity Log.
        </P>

        <H3>Two Self-Service Actions</H3>
        <Table
          headers={["Action", "How it works", "Admin involvement"]}
          rows={[
            [
              "Update profile",
              "Leader receives a magic link → edits their name, photo, bio, expertise, country, and more directly",
              "None — changes are saved instantly and logged in Activity Log",
            ],
            [
              "Delete profile",
              "Leader requests removal → confirms via magic link → status set to rejected",
              "None — admin receives a notification email",
            ],
          ]}
        />

        <H3>How Leaders Access the Manage Profile Page</H3>
        <Ol>
          <Li>
            Click <strong>"Manage or remove your profile"</strong> on any
            profile card or in the site footer
          </Li>
        </Ol>
        <Img
          src="screenshots/full-profile-modal-open.png"
          caption="Profile modal with 'Manage or remove your profile' link at the bottom"
        />
        <Ol start={2}>
          <Li>
            Add email and click <strong>Find my profile</strong> — name and
            LinkedIn are pre-filled from the card
          </Li>
        </Ol>
        <Img
          src="screenshots/manage-profile-modal-open.png"
          caption="Manage Profile modal — name pre-filled, leader adds their email"
        />
        <Img
          src="screenshots/manage-profile-modal-with-email-input.png"
          caption="Manage Profile modal — email entered, ready to click Find my profile"
        />
        <Ol start={3}>
          <Li>
            Profile found — choose <strong>Update</strong> or{" "}
            <strong>Remove</strong>
          </Li>
        </Ol>
        <Img
          src="screenshots/manage-profile-with-update-remove-button.png"
          caption="Profile found — leader chooses to update or remove their profile"
        />

        <H3>Update Flow (What Leaders Experience)</H3>
        <Ol>
          <Li>
            <strong>Request:</strong> Leader chooses "Update my profile" and
            enters their details
          </Li>
          <Li>
            <strong>Send link:</strong> Leader confirms and clicks{" "}
            <strong>Send magic link</strong>
          </Li>
        </Ol>
        <Img
          src="screenshots/update-profile-send-link.png"
          caption="Update confirmation — leader clicks Send magic link to receive their profile edit link"
        />
        <Ol start={3}>
          <Li>
            <strong>Magic link email:</strong> They receive an email with a
            unique magic link (secure, valid for 48 hours)
          </Li>
        </Ol>
        <Img
          src="screenshots/update-profile-email.png"
          caption="Update magic link email — leader receives a link to edit their profile (valid for 48 hours)"
        />
        <Ol start={4}>
          <Li>
            <strong>Edit form:</strong> Clicking the link opens a pre-filled form
            with all their existing data. Every field is editable — name,
            photo, bio, expertise, country, and more. Empty fields show a{" "}
            <strong>Missing</strong> badge as a reminder
          </Li>
          <Li>
            <strong>Save:</strong> Changes are saved directly to the database —
            no admin approval needed
          </Li>
        </Ol>

        <H3>Delete Flow (What Leaders Experience)</H3>
        <Ol>
          <Li>
            <strong>Request:</strong> Leader chooses "Remove my profile" and
            confirms their intent
          </Li>
          <Li>
            <strong>Send link:</strong> Leader confirms and clicks{" "}
            <strong>Send magic link</strong>
          </Li>
        </Ol>
        <Img
          src="screenshots/delete-profile-send-link.png"
          caption="Delete confirmation — leader clicks Send magic link to receive their removal link"
        />
        <Ol start={3}>
          <Li>
            <strong>Magic link email:</strong> They receive a removal
            confirmation link (secure, valid for 48 hours)
          </Li>
        </Ol>
        <Img
          src="screenshots/delete-profile-email.png"
          caption="Delete magic link email — leader receives a link to confirm profile removal"
        />
        <Ol start={3}>
          <Li>
            <strong>Confirm delete:</strong> Clicking the link shows a "Remove
            your profile" screen with "Are you sure?" and a red delete button
          </Li>
          <Li>
            <strong>Removed:</strong> After confirming, a checkmark screen
            says "Profile removed — your profile has been removed from the
            directory"
          </Li>
        </Ol>

        <Tip>
          All self-service actions are logged in the{" "}
          <strong>Activity Log</strong> tab. Admin receives a notification email
          whenever a leader updates or deletes their profile.
        </Tip>
      </>
    ),
  },
  {
    id: "product-report",
    label: "📋 Product Report",
    content: (
      <>
        <P>
          This report documents the technical approach, design decisions, and deliverables for the
          Women Leaders in Digital Health Database. It responds to each of the three workstreams
          defined in the scope of work.
        </P>

        <H3>A. Technical &amp; Visualisation Approach</H3>

        <H4>Platform Assessment</H4>
        <P>
          Several platforms were evaluated for building and hosting the database. The assessment
          considered cost, licensing, maintenance overhead, scalability, and the ability to deliver
          an interactive, searchable directory without ongoing licensing fees.
        </P>
        <Ul>
          <Li><strong>Google Sheets + Apps Script</strong> — Used in the initial prototype. Functional for small datasets but lacks proper querying, has a 6-minute execution limit, requires manual redeploy on every code change, and cannot handle photo uploads. <strong>Rejected.</strong></Li>
          <Li><strong>Tableau / Power BI</strong> — Strong visualisation tools but designed for dashboards and reporting, not for interactive profile browsing with CRUD operations. Require per-user licensing. <strong>Rejected.</strong></Li>
          <Li><strong>Supabase (chosen)</strong> — Open-source platform providing PostgreSQL, file storage, authentication, and edge functions in a single platform. Generous free tier, no per-user licensing. <strong>Selected.</strong></Li>
          <Li><strong>React + Vite (frontend)</strong> — Modern component-based framework with Tailwind CSS for brand-consistent styling. No licensing cost. <strong>Selected.</strong></Li>
        </Ul>

        <H4>Recommended Architecture</H4>
        <Note>
          <strong>Stack:</strong> React 18 + Vite (frontend) → Supabase PostgreSQL (database) + Supabase Storage (photos) + Supabase Auth (admin login) + Supabase Edge Functions (email). Hosted on GitHub Pages via CI/CD.
        </Note>
        <P>
          The frontend is a static site deployed to GitHub Pages — no server to maintain, no hosting cost.
          Supabase handles all backend concerns with Row Level Security enforcing data access rules.
        </P>

        <H4>Cost and Licensing</H4>
        <P>All dependencies are open source with permissive licences (MIT, Apache 2.0, SIL OFL). Total operating cost: <strong>$0/month</strong> on the Supabase free tier.</P>
        <Ul>
          <Li>React 18 — MIT — Free</Li>
          <Li>Vite — MIT — Free</Li>
          <Li>Tailwind CSS — MIT — Free</Li>
          <Li>Supabase — Apache 2.0 — Free tier (500 MB database, 1 GB storage, 2 GB bandwidth)</Li>
          <Li>GitHub Pages — Free</Li>
          <Li>GitHub Actions — Free</Li>
          <Li>react-simple-maps — MIT — Free</Li>
        </Ul>
        <Note>
          Supabase paid tier starts at $25/month (Pro) when project scales beyond free-tier limits.
        </Note>

        <H4>Accessibility</H4>
        <Ul>
          <Li>Colour contrast meets WCAG AA</Li>
          <Li>Visible focus indicators on all interactive elements</Li>
          <Li>Reduced motion preference respected</Li>
          <Li>Skip to main content link on every page</Li>
          <Li>Responsive from 320px to desktop</Li>
        </Ul>

        <H4>Embedding Within the Transform Health Website</H4>
        <P>
          The database is designed to be embedded as a page on the Transform
          Health WordPress site. The site header and footer now match the
          Transform Health branding (white navbar with dropdown navigation,
          multi-column navy footer with social links and CTAs). A{" "}
          <strong>"Chrome toggle"</strong> (eye icon) can hide the header and
          footer if visual duplication occurs. All brand assets are hotlinked
          from the Transform Health WordPress site for visual consistency.
        </P>

        <H3>B. Design and Development of Interactive Database</H3>

        <H4>Filters and Search</H4>
        <Ul>
          <Li>Dropdown filters for continent, country, and expertise — dynamically populated</Li>
          <Li>Free-text search across name, role, organisation, bio, expertise, and country</Li>
          <Li>Sort by Latest / A-Z / Expertise</Li>
          <Li>Analytics page with interactive world map and simultaneous region + specialisation filtering</Li>
        </Ul>

        <H4>Profile Presentation</H4>
        <P>
          Card grid layout showing photo, name, role, organisation, location, and expertise tags.
          Click opens a modal with full bio, years of experience, countries, achievements, and LinkedIn.
          Email never shown publicly. "Load more" pagination.
        </P>

        <H4>Desktop and Mobile</H4>
        <Ul>
          <Li>Responsive: multi-column grid on desktop, single-column on mobile</Li>
          <Li>Filters: inline on desktop, stacked full-width on mobile</Li>
          <Li>Modal: bottom-sheet on mobile, centered overlay on desktop</Li>
          <Li>Touch-friendly interactive elements throughout</Li>
        </Ul>

        <H4>User Roles</H4>
        <Ul>
          <Li><strong>Public Visitor:</strong> Search, filter, browse. No login.</Li>
          <Li><strong>Leader (self-submit):</strong> 5-step form → pending → admin approval</Li>
          <Li><strong>Leader (manage):</strong> Magic link → edit/delete own profile. No admin needed.</Li>
          <Li><strong>Nominator:</strong> Submit someone else → admin outreach</Li>
          <Li><strong>Admin:</strong> Full console — submissions, requests, analytics, test results</Li>
        </Ul>

        <H3>C. Handover and Documentation</H3>

        <H4>Maintenance</H4>
        <Ul>
          <Li>New leaders: self-submit → admin approve in console</Li>
          <Li>Updates: self-service magic link or admin via All Entries</Li>
          <Li>Removals: self-service "Remove profile" or admin delete</Li>
          <Li>Email: Supabase Edge Function → Google Apps Script → Google Workspace</Li>
        </Ul>

        <H4>Dependencies and Licences</H4>
        <Ul>
          <Li>React 18 (MIT), Vite (MIT), Tailwind CSS (MIT)</Li>
          <Li>react-simple-maps (MIT), @supabase/supabase-js (MIT/Apache 2.0)</Li>
          <Li>Supabase platform (Apache 2.0), GitHub Pages, GitHub Actions</Li>
          <Li>Google Fonts (SIL OFL), Google Apps Script</Li>
        </Ul>
        <Note>All open source, no commercial licences required.</Note>

        <H4>Infrastructure</H4>
        <Ul>
          <Li><strong>Production:</strong> <code>https://transform-health-2.github.io/Women-leaders-database/</code> — repo: <code>Transform-Health-2/Women-leaders-database</code></Li>
          <Li><strong>Staging:</strong> <code>https://tich-labs.github.io/transform-health-directory/</code> — repo: <code>Tich-Labs/transform-health-directory</code></Li>
          <Li>Production Supabase: <code>qglymhpdsjzkmdvzizdu</code></Li>
          <Li>Staging Supabase: <code>mphzkizjaqxhrzhpdhst</code></Li>
          <Li>Tables: leaders, requests, test_results</Li>
          <Li>Storage: profile-photos bucket</Li>
          <Li>CI/CD: auto-deploys on push to main (both repos)</Li>
        </Ul>

        <H4>Handover Checklist</H4>
        <Note>
          Required before Transform Health can fully own the system. Full details in <code>docs/TRANSFER_CHECKLIST.md</code>.
        </Note>

        <H4>1. GitHub Repo &amp; Secrets</H4>
        <Ul>
          <Li>Transfer production repo ownership from <code>Transform-Health-2/Women-leaders-database</code> to Transform Health's GitHub org, or add team members as Admin collaborators</Li>
          <Li>Set GitHub Actions secrets in the new repo: <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code></Li>
          <Li>Remove any stale secrets (legacy Apps Script vars)</Li>
          <Li>Verify CI/CD works — push to <code>main</code> triggers auto-deploy</Li>
        </Ul>

        <H4>2. Supabase Access, RLS, Storage, Backup</H4>
        <Ul>
          <Li>Grant team access to production Supabase project <code>qglymhpdsjzkmdvzizdu</code></Li>
          <Li>Verify Edge Function secret: <code>APPS_SCRIPT_URL</code></Li>
          <Li>Confirm RLS: anon reads only <code>live</code> leaders; auth required for writes</Li>
          <Li>Verify <code>profile-photos</code> storage bucket is public-read</Li>
          <Li>Export SQL dump of all tables (<code>leaders</code>, <code>requests</code>, <code>test_results</code>)</Li>
        </Ul>

        <H4>3. Email — Apps Script relay</H4>
        <Ul>
          <Li>Confirm access to the Google account owning the Apps Script Web App, or deploy a fresh copy from <code>apps-script/Code.gs</code></Li>
          <Li>Confirm <Code>noreply@transformhealthcoalition.org</Code> is accessible</Li>
          <Li>Deploy <Code>self-service</Code> Edge Function (<code>supabase/functions/self-service/</code>) and configure secrets: <Code>APPS_SCRIPT_URL</Code>, <Code>MAGIC_LINK_SECRET</Code>, <Code>ADMIN_NOTIFY_EMAIL</Code></Li>
          <Li>Note: project uses exactly 2 Edge Functions (<Code>self-service</Code> + <Code>manage-admin</Code>) — within Supabase free tier limit of 2</Li>
        </Ul>



        <H4>5. Assets &amp; Branding</H4>
        <Ul>
          <Li>Brand colours are defined in <code>tailwind.config.cjs</code> under <code>brand:</code> — verify against current guidelines</Li>
        </Ul>

        <H4>6. Documentation</H4>
        <Ul>
          <Li><code>docs/admin-manual.md</code> — markdown source for the in-app Admin Manual</Li>
          <Li><code>docs/TRANSFER_CHECKLIST.md</code> — this checklist in standalone form</Li>
          <Li>In-app Product Report — accessible at <code>/admin?tab=documentation&amp;section=product-report</code></Li>
          <Li><code>README.md</code> — updated to reflect current codebase state</Li>
          <Li>Admin Manual PDF — can be generated from the in-app "Download PDF" button</Li>
          <Li>Screenshots / video walkthrough — being prepared by the current team</Li>
        </Ul>

        <H4>7. Pre-Launch Tasks</H4>
        <Ul>
          <Li>Admin auth gate is now live — uses <code>supabase.auth.signInWithPassword()</code></Li>
          <Li>Create admin user in Supabase Auth dashboard (email/password)</Li>
          <Li>Add analytics (GA4 or Plausible) if desired</Li>
          <Li>Test end-to-end: submit → approve → directory → magic link → edit → notification</Li>
        </Ul>

        <H4>8. Quick Reference</H4>
        <Ul>
          <Li>Production URL: <code>https://transform-health-2.github.io/Women-leaders-database/</code></Li>
          <Li>Staging URL: <code>https://tich-labs.github.io/transform-health-directory/</code></Li>
          <Li>Production Supabase Project: <code>qglymhpdsjzkmdvzizdu</code></Li>
          <Li>Staging Supabase Project: <code>mphzkizjaqxhrzhpdhst</code></Li>
          <Li>Database: PostgreSQL — tables: <code>leaders</code>, <code>requests</code>, <code>test_results</code></Li>
          <Li>Storage: <code>profile-photos</code> bucket</Li>
          <Li>Auth: Supabase Auth — email/password (login required for admin)</Li>
          <Li>CI/CD: <code>.github/workflows/deploy.yml</code> — auto-deploys on push to <code>main</code></Li>
          <Li>Email: Supabase Edge Function → Google Apps Script → Google Workspace</Li>
          <Li>Sender: <code>noreply@transformhealthcoalition.org</code></Li>
        </Ul>

        <H4>Limitations and Future Expansion</H4>
        <P><strong>Current limitations:</strong></P>
        <Ul>
          <Li>Admin auth gate implemented — uses Supabase Auth email/password</Li>
          <Li>Email via Google Apps Script</Li>
          <Li>No analytics (GA4/Plausible) configured</Li>
          <Li>Map supports region-level only, not country drilldown</Li>
        </Ul>
        <P><strong>Future expansion:</strong></P>
        <Ul>
          <Li><strong>ORCID integration</strong> — lets leaders link their ORCID iD (a persistent researcher identifier) to verify identity, auto-populate publications/affiliations, and add credibility. Requires ORCID API integration and a consent flow.</Li>
          <Li><strong>Open Badges / Verifiable Credentials (W3C standard)</strong> — issue tamper-proof digital credentials (e.g. "Verified Women Leaders in Digital Health") that leaders can display on LinkedIn, CVs, or personal sites. Follows W3C standards for interoperability.</Li>
          <Li><strong>Supabase Auth signInWithOtp()</strong> — replace the current custom magic link flow with Supabase's built-in one-time password (OTP) email auth. Simplifies maintenance and improves security with Supabase's battle-tested email handling.</Li>
          <Li><strong>CSV/PDF export</strong> — allow admins to download filtered search results as CSV (for analysis) or PDF (for reports). Useful for grant reporting, stakeholder presentations, and offline reference.</Li>
        </Ul>

        <Tip>
          <strong>Identity strategy:</strong> LinkedIn is treated as a vanity identifier — leaders provide structured data via consent-backed form. This avoids LinkedIn's locked API and GDPR risk. Future: ORCID, Open Badges, email-as-identity.
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
    icon: "✅",
    title: "Admin Tasks",
    sections: [
      "approval-quick-ref",
      "all-entries",
      "profile-requests",
      "nominated",
      "activity-log",
    ],
  },
  {
    icon: "🌐",
    title: "Public Experience",
    sections: ["directory-features", "submit-profile-flow", "manage-profile-flow", "analytics-dashboard"],
  },
  {
    icon: "⚙️",
    title: "Configuration & Access",
    sections: ["email-setup", "manage-admin-users", "duplicate-detection"],
  },
  {
    icon: "📚",
    title: "Reference",
    sections: ["common-workflows", "status-reference", "product-report"],
  },
  {
    icon: "❓",
    title: "Help",
    sections: ["admin-faq"],
  },
];

// ── Main component ───────────────────────────────────────────────────────────
export default function AdminManual({ onBackToAdmin }) {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Read initial section from URL hash: ?tab=documentation&section=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (section && SECTIONS.find((s) => s.id === section)) {
      setActiveId(section);
    }
  }, []);

  // Sync active section to URL hash
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("section", activeId);
    window.history.replaceState({}, "", url);
  }, [activeId]);

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);
  const activeSection = SECTIONS[activeIndex];
  const prev = SECTIONS[activeIndex - 1] ?? null;
  const next = SECTIONS[activeIndex + 1] ?? null;

  const activeCategory = CATEGORIES.find((cat) =>
    cat.sections.includes(activeId)
  );

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
          {/* Sticky top bar with breadcrumbs and actions */}
          <div className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between px-10 py-3 border-b border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-[1.35rem] text-gray-500">
              <span className="font-medium text-brand-navy">{activeCategory?.icon} {activeCategory?.title}</span>
              <span className="text-gray-300 mx-1">›</span>
              <span className="font-semibold text-brand-pink">{activeSection?.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadPdf}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[1.3rem] font-medium bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {pdfLoading ? "Generating PDF…" : "Download PDF"}
              </button>
              <button
                onClick={onBackToAdmin}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[1.3rem] font-medium bg-brand-pink text-white hover:bg-brand-pink/90 transition-colors cursor-pointer"
              >
                ← Back to Admin
              </button>
            </div>
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
