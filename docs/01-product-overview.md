# Transform Health Women Leaders Directory — Product Overview

## Mission

To increase visibility, representation, and engagement of women leaders across leadership, policy, and technical spaces in **digital health**.

We do this by building and maintaining a searchable, global directory of accomplished women working to transform health through technology, data, and innovation.

---

## The Problem We Solve

**Visibility Gap:** Women leaders in digital health are often invisible to:
- Organizations seeking expert advisors and board members
- Media and thought leaders looking for sources and speakers
- Early-stage professionals seeking role models and mentors
- Researchers building diverse teams and networks
- Policy makers designing inclusive initiatives

**Result:** Missed opportunities for collaboration, leadership visibility, and institutional diversity.

---

## How It Works

### For Women Leaders
1. **Submit Your Profile** — Share your role, expertise, bio, and professional links
2. **Get Discovered** — Your profile appears in the public directory
3. **Manage Your Profile** — Update your information or remove yourself anytime via a secure magic link sent to your email. No account, no password, no admin intervention needed.

### For Nominators
1. **Nominate a Leader** — Suggest a woman leader to be added to the directory
2. **Provide Basic Info** — Name, role, LinkedIn (or link to online profile)
3. **Lightweight Process** — Admins review and approve or reject nominations

### For Directory Users
1. **Search & Filter** — Find leaders by:
   - Name or keywords in bio
   - Expertise area (AI, Telemedicine, Health Systems, etc.)
   - Country or continent
   - Years of experience
2. **View Profiles** — Click any leader to see full bio, photo, and links
3. **Connect** — Visit LinkedIn or website links to learn more

---

## Key Features

| Feature | What It Does |
|---------|-------------|
| **Smart Search** | Find leaders by name, role, organization, expertise, or geography |
| **Expertise Tagging** | 15+ expertise areas including AI, Digital Health Policy, Health Financing, mHealth |
| **Geographic Filtering** | Browse by country or continent to find regional leaders |
| **Profile Management** | Self-service updates and deletion via secure magic link (48h expiry) — no account or password required |
| **Nomination System** | Anyone can nominate a leader on their behalf (lightweight entry) |
| **Analytics** | Interactive world map with region/country/specialisation filtering, expertise distribution chart, and leader discovery |
| **Admin Dashboard** | Review submissions, approve/reject profiles, manage requests |

---

## Data Model

A complete **Leader Profile** includes:

| Field | Type | Public | Required |
|-------|------|--------|----------|
| Name | Text | ✓ | ✓ |
| Role / Job Title | Text | ✓ | ✓ |
| Organization | Text | ✓ | ✓ |
| Bio | Text | ✓ | ✓ |
| Expertise | Tags | ✓ | ✓ |
| Years of Experience | Number | ✓ | — |
| Photo | Image | ✓ | — |
| Primary Country | Text | ✓ | ✓ |
| Countries of Operation | Multi-select | ✓ | — |
| Geographical Scope | Dropdown | ✓ | — |
| LinkedIn | URL | ✓ | — |
| Personal Email | Text | ✗ (Admin only) | — |

---

## User Roles & Permissions

| Role | Can Do | Notes |
|------|--------|-------|
| **Public User** | Search & view live profiles | No login required |
| **Profile Submitter** | Submit profile, nominate others | Via form, no account needed |
| **Admin** | Review, approve, reject, manage submissions | Internal team only |
| **Leader** | Update or delete own profile | Via magic link (no password) |

---

## Success Metrics

We measure the success of this directory by:

| Metric | Why It Matters |
|--------|---------------|
| **Total Profiles** | Indicator of directory growth |
| **Geographic Distribution** | Ensures representation across regions |
| **Monthly Submissions** | Shows engagement from new leaders |
| **Profile Clicks / Views** | Shows discovery and visibility of leaders |
| **Repeat Submissions (Updates)** | Shows trust and active participation |
| **Nomination Rate** | Shows community engagement in addition to self-submission |

---

## User Journey

### Self-Submit Profile (Recommended for Active Leaders)
```
Leader visits directory 
  → Clicks "Submit Profile" 
  → Fills out 6-step form (Consent → Basic Info → Professional Details → Links → Photo → Review)
  → Submits
  → Admin reviews
  → Profile goes LIVE
  → Leader requests update/delete → secure magic link sent via email → edits without an account
```

### Nominate a Leader
```
Anyone visits directory
  → Clicks "Nominate a Leader"
  → Provides nominee name, role, contact info
  → Submits
  → Admin reviews
  → Nominates profile appears in directory (lightweight entry)
  → Eventually leader can fill in full profile
```

### Discover & Connect
```
User searches directory (by name, expertise, country)
  → Finds relevant leader(s)
  → Clicks profile to view full bio and links
  → Clicks LinkedIn or website to connect
```

---

## Technical Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Supabase Storage (profile photos)
- **Maps:** react-simple-maps (for geographic visualization)
- **Email:** Supabase Edge Functions (magic link flow)
- **Auth:** Supabase Auth (email/password for admin console)
- **Deployment:** GitHub Pages (static site)

---

## Roadmap

### Current (v1.0)
- ✓ Searchable directory
- ✓ Two submission paths (self + nominate)
- ✓ Admin dashboard
- ✓ Profile management (update/delete)

### Near-term Enhancements

#### Automated Backup Notifications — Scheduled Reminder Emails

**Status:** Future feature — manual CSV export is available today in Admin → Manage Admin Users → Database Backup  
**Effort:** Small (half a day)

Currently, backups require an admin to remember to export manually. A notification system would remove the human dependency.

**How it would work:**

1. A scheduled Google Apps Script trigger (e.g. monthly on the 1st) sends a reminder email to the admin team: "Your monthly database backup is due — export Leaders and Requests from the admin console."
2. Alternatively, a Supabase cron job (Pro plan feature) or a GitHub Actions scheduled workflow could trigger the export automatically and email the CSV as an attachment.

**Why not now:** Manual export via the admin console is sufficient for the current scale. A notification is only worth building once the team has established a regular backup rhythm and finds manual triggering impractical.

---

#### Google Analytics 4 (GA4) — Visitor Insights

**Status:** Ready to implement — awaiting client Measurement ID  
**Effort:** Small (under 1 hour)  
**Requires:** Transform Health creates a GA4 property in their Google Analytics account

**What it adds:**

| Metric | Detail |
| --- | --- |
| Visitor counts | Daily/weekly/monthly unique visitors and sessions |
| Traffic sources | Where visitors come from (Google search, social, direct, referrals) |
| Country breakdown | Which countries visitors are in |
| Tab usage | Which sections (Directory, Analytics, Submit) are visited most |
| Device types | Desktop vs mobile vs tablet split |
| LinkedIn click events | Already tracked in the database; can be mirrored to GA4 as custom events |

**Implementation steps (for the development team):**

1. Client creates a GA4 property: Google Analytics → Admin → Create Property → copy the Measurement ID (`G-XXXXXXXXXX`)
2. Add two script tags to `client/index.html` (the gtag.js loader and config call)
3. Add a `hashchange` listener in `App.jsx` to fire `page_view` events when the user switches tabs — without this, only the initial page load is counted
4. Deploy — data appears in GA4 within 24–48 hours

**Privacy note:** GA4 Measurement IDs are public by design and safe to include in the HTML source. If Transform Health has users in the EU, a cookie consent notice may be required under GDPR. For a global audience with no EU-specific targeting, analytics-only mode without advertising features is generally considered low-risk — but Transform Health should confirm this with their legal or privacy advisor.

**Alternative:** [Plausible Analytics](https://plausible.io) is a privacy-first, cookieless alternative that requires no consent banner anywhere in the world. It costs ~$9/month but is significantly simpler to comply with.

---

### Planned (v2.0)
- Community features (groups, discussion threads)
- Event directory integration
- Advanced analytics (search trends, engagement heat maps)
- API for third-party integrations
- Verified badges / certification system

---

## Privacy & Trust

- **Data Minimalism:** We collect only what's necessary
- **User Control:** Leaders own their profile and can delete anytime
- **No Selling Data:** Profile data is NOT sold or shared commercially
- **Private Info:** Email addresses are never published publicly
- **Transparent:** Users know exactly what will be public before submitting

---

## Getting Help

**Users:** See [User Guide & FAQ](04-faq.md)  
**Admins:** See [Admin Manual](admin-manual.md)  
**Leaders Updating Profiles:** See [Manage Your Profile Guide](03-submit-profile-guide.md)
