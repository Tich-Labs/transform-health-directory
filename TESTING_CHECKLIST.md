# Testing Checklist - Personal Account Setup

## Pre-Setup
- [ ] Google Sheet created: https://docs.google.com/spreadsheets/d/1ElqmE1NDvhSNrGPPcTU67g_ndKxsZs68FRn04yus4C0/edit
- [ ] Apps Script code pasted from `apps-script/Code.gs`
- [ ] Script Properties set:
  - [ ] `TARGET_SHEET_ID = 1ElqmE1NDvhSNrGPPcTU67g_ndKxsZs68FRn04yus4C0`
  - [ ] `ADMIN_PASSWORD = {your chosen password}`
  - [ ] `SITE_URL = ` (leave empty for now, update after GitHub Pages deploy)
- [ ] Apps Script deployed as Web App:
  - [ ] Execute as: Me
  - [ ] Who has access: Anyone
  - [ ] Copied Web App URL

## Frontend Setup
- [ ] `.env` file created in `client/` folder
- [ ] `VITE_APPS_SCRIPT_URL` set to your deployed Web App URL


## Local Testing
- [ ] `npm install` completed
- [ ] `npm run dev` starts successfully
- [ ] Can submit a test profile via "SUBMIT PROFILE"
- [ ] Check Google Sheet → New row appears with status "pending"
- [ ] Can access Admin tab with password
- [ ] Can approve test submission
- [ ] Approved profile appears in "DATABASE" tab
- [ ] Can use "Manage your profile" link
- [ ] Magic link email received
- [ ] Magic link opens profile editor

## Deployment
- [ ] Code pushed to GitHub main branch
- [ ] GitHub Pages enabled (Settings → Pages → GitHub Actions)
- [ ] Site deployed to `https://{username}.github.io/transform-health-directory`
- [ ] Update Apps Script `SITE_URL` property to deployed URL
- [ ] Redeploy Apps Script (to pick up new SITE_URL)
- [ ] Test live site works

## Smoke Test (Live Site)
- [ ] Can view database
- [ ] Can submit new profile
- [ ] Admin can approve/reject
- [ ] Magic links work from live site
- [ ] Profile photos upload successfully

---
**Notes:**
- Apps Script URL: _______________________
- Admin password: _______________________

- GitHub Pages URL: _______________________
