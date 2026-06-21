# Pre-Launch Checklist

Items to complete before the platform goes live — for the technical team.

## Done

- [x] Admin auth gate enabled — `Admin.jsx` checks `supabase.auth.getSession()` and requires login
- [x] Admin user created in Supabase Auth (`noreply@transformhealthcoalition.org`)
- [x] New Supabase project created under Transform Health account (`qglymhpdsjzkmdvzizdu`)
- [x] Schema migrated (leaders, requests, admin_roles tables)
- [x] All 82 leaders migrated from old project
- [x] RLS policies active — test-mode policies dropped; anon can only read `live` leaders; all mutations require authentication
- [x] Storage bucket `profile-photos` created and public-read
- [x] Edge Functions deployed: `self-service` (email + token gen/verify), `manage-admin` — 2 functions, within free tier limit
- [x] `APPS_SCRIPT_URL` secret set in Supabase Edge Function settings
- [x] `MAGIC_LINK_SECRET` set in Supabase Edge Function settings (HMAC signing for self-service tokens)
- [x] `ADMIN_NOTIFY_EMAIL` set in Supabase Edge Function settings
- [x] Magic link tokens are HMAC-SHA256 signed and verified server-side — forged tokens rejected
- [x] `self-service` Edge Function: CORS locked to deployment origin, recipient validated against database, rate limited (email action)
- [x] `manage-admin` Edge Function: caller identity extracted from verified JWT (not client-supplied body)
- [x] Admin email addresses moved to environment variables (`VITE_ADMIN_CC_EMAIL`, `VITE_ADMIN_NOTIFY_EMAIL`)
- [x] GitHub Actions secrets updated with all four required vars
- [x] Role system live (super_admin, admin, editor)
- [x] Manage Admins tab with card UI, role badges, remove confirmation
- [x] Forgot password flow working via `supabase.auth.resetPasswordForEmail()`
- [x] CC support in email chain (configured via `VITE_ADMIN_CC_EMAIL` env var)

## Still Needed

- [ ] Verify GitHub Actions secrets are set in the repo:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Confirm CI/CD is operational — push to `main` triggers build + deploy
- [ ] Grant Transform Health team access to Supabase project (Dashboard → Project Settings → Team)
- [ ] Back up database (SQL dump of leaders, requests, admin_roles)
- [ ] Confirm the Google Apps Script Web App is deployed under a Transform Health Google Workspace account (and update `APPS_SCRIPT_URL` if redeployed)
- [ ] Test end-to-end: submit profile → approve → appears in directory → manage via magic link
- [ ] Decide on analytics (GA4 / Plausible / none)

## Notes

- No SMTP secrets needed (`GOOGLE_SMTP_USER`, `GOOGLE_SMTP_PASS`) — the Apps Script uses `MailApp.sendEmail()` which sends from the script owner's Google account automatically
- No custom domain needed — database is embedded at `transformhealth.rrzdev.co.za`
- Supabase Free Tier limits: 2 Edge Functions per project — project uses exactly 2 (`self-service`, `manage-admin`), within limit. No PITR backups on free tier; manual SQL export required.
