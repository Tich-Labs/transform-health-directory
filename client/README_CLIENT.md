Client (React + Vite + Tailwind) — quick start

1) Install deps

```bash
cd client
npm install
```

2) Local dev

```bash
npm run dev
```

3) Build for GH-Pages

```bash
npm run build
# publish `dist/` to GitHub Pages (via action or gh-pages) and embed using an iframe
```

4) Configure Apps Script URL

Copy `.env.example` to `.env` and set `VITE_APPS_SCRIPT_URL` to your deployed Apps Script web app URL (see `apps-script/README_DEPLOY.md`).
