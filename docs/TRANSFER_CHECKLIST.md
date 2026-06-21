# Transfer Checklist — Transform Health

This document lists everything required to transfer the Women Leaders in Digital Health Database codebase, assets, and associated resources from the development team to Transform Health.

---

## 1. Source Code & Repository

- [x] **Transfer GitHub repository ownership** — Transform admin added as collaborator; repo to be moved to their organisation
- [x] **Verify GitHub Actions secrets** are set in the new repo:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_ADMIN_CC_EMAIL` — staff email CC'd on enrichment emails
  - `VITE_ADMIN_NOTIFY_EMAIL` — address that receives self-service action notifications
- [ ] **Remove stale secrets** (legacy Apps Script / Firebase vars) if present
- [x] **Confirm CI/CD is operational** — push to `main` triggers automatic build + deploy
- [ ] **Verify branch protection** rules are configured on `main` if desired

## 2. Supabase Project

- [x] **Supabase project created** under Transform Health account (`qglymhpdsjzkmdvzizdu`)
- [ ] **Grant team access** — invite collaborators via Supabase Dashboard → Project Settings → Team
- [x] **Verify Edge Function secrets** are configured in Supabase Dashboard → Settings → Edge Functions → Secrets:
  - `APPS_SCRIPT_URL` — Google Apps Script Web App URL **(required)**
  - `MAGIC_LINK_SECRET` — HMAC secret for signing self-service tokens **(required)** — generate with `openssl rand -hex 32`
  - `ADMIN_NOTIFY_EMAIL` — address to receive self-service action notifications **(required)**
- [x] **Row Level Security (RLS)** policies are active — test-mode policies have been dropped; only production-grade authenticated policies remain
- [x] **Storage bucket** `profile-photos` exists and is public-read
- [ ] **Back up database** — export a SQL dump of all tables (`leaders`, `requests`, `admin_roles`)

> **Note:** `GOOGLE_SMTP_USER` and `GOOGLE_SMTP_PASS` are not used — the Apps Script uses `MailApp.sendEmail()` directly (no SMTP credentials needed). All three secrets above are required.

## 3. Email & Google Workspace

- [ ] **Google Apps Script Web App** — confirm which Google account owns the deployed script (if it's already a TH account, nothing to do)
- [ ] **If redeploying:** deploy `apps-script/Code.gs` as a new Web App under Transform Health's Google account, then update the `APPS_SCRIPT_URL` secret

## 5. Assets & Branding

- [ ] **Logo URLs** — confirm WordPress asset paths remain stable:
  - Logo: `https://transformhealthcoalition.org/wp-content/themes/th/assets/images/main_logo.svg`
  - Footer icon: `https://transformhealthcoalition.org/wp-content/themes/th/assets/images/footer_icon_bg.svg`
  - Favicon: hotlinked from same logo URL via `client/index.html`
- [ ] **Consider downloading local copies** of brand assets to remove external dependency
- [ ] **Brand colours** are defined in `client/tailwind.config.cjs` under `brand:` — verify they match current brand guidelines

## 6. Documentation

- [x] `docs/admin-manual.md` — updated to reflect current email architecture and token security model
- [ ] `docs/TRANSFER_CHECKLIST.md` — this file (review before final handover)
- [ ] In-app **Product Report** — accessible at `/#admin?tab=manual&section=product-report`
- [x] **README.md** — updated to reflect current codebase state (auth active, correct env vars)
- [ ] **Admin Manual PDF** — can be generated from the in-app "Download PDF" button
- [ ] **Screenshots / video walkthrough** — being prepared by current team

## 7. Pre-Launch Tasks

- [x] **Re-enable admin auth gate** — done
- [x] **Create admin user** in Supabase Auth dashboard — done (noreply@transformhealthcoalition.org)
- [ ] **Analytics** — decide whether to add GA4 or Plausible before or after launch
- [ ] **Test end-to-end flow:** submit profile → approve → appears in directory → manage via magic link → email notification received

## 8. Supabase Free Tier — Features & Limitations

The project currently runs on the **Supabase Free Tier** (`qglymhpdsjzkmdvzizdu`). Below are the limits and when to consider upgrading.

### Current Free Tier Limits

| Resource | Free Tier Limit | Our Current Usage | Notes |
|---|---|---|---|
| **Database** | 500 MB | ~10 MB (82 leaders + small tables) | Fine for thousands of entries |
| **Row count** | Unlimited | ~100 rows | No concern |
| **Auth users** | 50,000 | 1–5 admin users | No concern |
| **Edge Functions** | 500,000 invocations / month | Very low | Fine for current traffic |
| **Edge Function count** | 2 per project | 4 (send-email, manage-admin, generate-manage-token, verify-manage-token) | **Over free limit** — Pro plan ($25/mo) required |
| **File Storage** | 1 GB | Minimal (profile photos) | Fine |
| **Bandwidth** | 2 GB | Low | Fine |
| **Daily backups** | ✗ (Free tier has no PITR) | — | **Risk** — manual backup required |
| **Supabase support** | Community only | — | Email/Slack support on Pro+ |

### Scaling Considerations

- **3+ Edge Functions** → Upgrade to **Pro** ($25/month)
- **Database > 500 MB or high traffic** → Upgrade to **Pro** for read replicas, connection pooling
- **Production SLA / Support** → Upgrade to **Team** ($599/month) or **Enterprise**
- **PITR backups** → Pro plan ($25/month) includes 7-day Point-in-Time Recovery

### Recommended Upgrade Path

1. **Immediate:** Upgrade to **Pro ($25/mo)** — the project now has 4 Edge Functions, which exceeds the free tier limit of 2. Pro removes this cap and adds PITR backups and 8 GB bandwidth.
2. **Now (if staying free temporarily):** Manually export SQL backups via Dashboard → SQL Editor → `SELECT * FROM leaders`
3. **Production launch:** Pro at minimum for PITR backups and support SLA

## 9. Quick Reference

| Resource | Value |
|---|---|
| Live URL | `https://tich-labs.github.io/transform-health-directory/` |
| Supabase Project | `qglymhpdsjzkmdvzizdu` |
| Supabase URL | `https://qglymhpdsjzkmdvzizdu.supabase.co` |
| Database | PostgreSQL — tables: `leaders`, `requests`, `admin_roles` |
| Storage | Supabase Storage — bucket: `profile-photos` |
| Auth | Supabase Auth — email/password (login required; test-mode policies removed) |
| CI/CD | `.github/workflows/deploy.yml` — auto-deploys on push to `main` |
| Email | Supabase Edge Function → Google Apps Script → Google Workspace |
| Frontend | React 18 + Vite + Tailwind CSS |
| Sent from | Google Workspace account that owns the Apps Script |
