/**
 * Playwright screenshot capture for AdminManual and public docs.
 * Run: node scripts/capture-screenshots.mjs
 * Requires dev server: cd client && npm run dev  (default port 5173; update BASE if different)
 */

import { chromium } from "playwright";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CLIENT = join(ROOT, "client");
const SS = join(CLIENT, "public/screenshots");
const SS_ADMIN = join(SS, "admin-manual");
const BASE = "http://localhost:5173";

// Load .env
const envRaw = readFileSync(join(CLIENT, ".env"), "utf-8");
const env = Object.fromEntries(
  envRaw
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

async function fetchLeaders() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/leaders?status=eq.live&select=id,first_name,last_name,role,organisation,bio,notable_items,countries,geo_scope,photo_url,expertise,linkedin&limit=20`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
  );
  return res.json();
}

// Generate a real HMAC-signed token via the self-service Edge Function.
// The old Buffer.from(btoa(...)) approach produced unsigned tokens that are now rejected.
async function makeToken(leaderId, mode = "update") {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/self-service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ action: "generate", leaderId, mode }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Token generation failed: " + JSON.stringify(data));
  return data.token;
}

async function go(page, url, waitMs = 2500) {
  await page.goto(url);
  await page.waitForTimeout(waitMs);
}

async function shot(page, filePath, opts = {}) {
  const { clip, fullPage = false } = opts;
  console.log(`  → ${filePath.replace(ROOT + "/", "")}`);
  await page.screenshot({ path: filePath, fullPage, clip });
}

async function dismissModal(page) {
  const closeBtn = page
    .locator('button[aria-label="Close profile"], button:has-text("✕")')
    .first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
}

async function openManageModal(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const manageBtn = page.locator("button").filter({ hasText: /manage or remove/i }).first();
  if (await manageBtn.isVisible().catch(() => false)) {
    await manageBtn.click();
    await page.waitForTimeout(900);
    return true;
  }
  return false;
}

async function main() {
  console.log("\n🎬  Starting screenshot capture...\n");

  const leaders = await fetchLeaders();
  if (!leaders?.length) {
    console.error("❌  No live leaders found — aborting");
    process.exit(1);
  }
  // Prefer a leader with missing fields so the edit form shows Missing badges
  const sparse =
    leaders.find(
      (l) =>
        !l.notable_items?.length ||
        !l.geo_scope ||
        !l.bio ||
        !l.countries?.length
    ) || leaders[0];
  console.log(`  Using leader: ${sparse.first_name} ${sparse.last_name} (${sparse.id})\n`);

  console.log("  Generating HMAC-signed tokens via self-service Edge Function...");
  const editToken = await makeToken(sparse.id, "update");
  const deleteToken = await makeToken(sparse.id, "delete");
  console.log("  ✓ Tokens generated\n");

  const browser = await chromium.launch({ headless: true });

  // ─── DESKTOP 1440×900 ────────────────────────────────────────────────────
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();

  // ── 01. DATABASE GRID ─────────────────────────────────────────────────────
  console.log("📸  Public pages");
  await go(page, `${BASE}/#database`);
  await shot(page, `${SS}/01-database-grid.png`);

  // ── 02. PROFILE MODAL ─────────────────────────────────────────────────────
  const firstCard = page.locator(".cursor-pointer").first();
  await firstCard.click().catch(() => {});
  await page.waitForTimeout(900);
  await shot(page, `${SS}/02-database-profile-modal.png`);
  await dismissModal(page);

  // ── 03. DATABASE SEARCH ───────────────────────────────────────────────────
  const searchInput = page
    .locator('input[type="search"], input[placeholder]')
    .first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill("digital");
    await page.waitForTimeout(600);
  }
  await shot(page, `${SS}/03-database-search.png`);
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill("");
    await page.waitForTimeout(300);
  }

  // ── 04. ANALYTICS ─────────────────────────────────────────────────────────
  await go(page, `${BASE}/#analytics`);
  await shot(page, `${SS}/04-analytics-overview.png`);

  // ── 05-11. SUBMIT FORM ────────────────────────────────────────────────────
  await go(page, `${BASE}/#submit`);
  await shot(page, `${SS}/05-submit-step0-self.png`);

  const selfBtn = page
    .locator("button")
    .filter({ hasText: /submit your (own )?profile/i })
    .first();
  if (await selfBtn.isVisible().catch(() => false)) {
    await selfBtn.click();
    await page.waitForTimeout(400);
    await shot(page, `${SS}/06-submit-step0-nominate.png`);
  } else {
    await shot(page, `${SS}/06-submit-step0-nominate.png`);
  }

  const stepFiles = [
    `${SS}/07-submit-step1-consent.png`,
    `${SS}/08-submit-step2-basicinfo.png`,
    `${SS}/09-submit-step3-profile.png`,
    `${SS}/10-submit-step4-links.png`,
    `${SS}/11-submit-step5-review.png`,
  ];
  for (const filePath of stepFiles) {
    await page.waitForTimeout(500);
    await shot(page, filePath);
    const nextBtn = page
      .locator("button")
      .filter({ hasText: /CONTINUE|NEXT|AGREE|PROCEED/i })
      .first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click({ force: true });
    }
  }

  // ── 13. MANAGE PROFILE — identify / lookup form ───────────────────────────
  console.log("\n📸  Manage Profile");
  await go(page, `${BASE}/#database`);
  await openManageModal(page);
  await shot(page, `${SS_ADMIN}/13-manage-profile.png`);

  const closeManage = page.locator("button").filter({ hasText: /← CLOSE|← BACK|✕/ }).first();
  if (await closeManage.isVisible().catch(() => false)) {
    await closeManage.click();
    await page.waitForTimeout(400);
  }

  // ── 14. MANAGE PROFILE — full edit form (magic link, update mode) ─────────
  console.log("\n📸  Manage Profile edit form (magic link landing)");
  await go(page, `${BASE}/?manage=${editToken}#database`, 3500);

  await page.evaluate(() => {
    const modal = document.querySelector(".max-h-\\[85vh\\], .overflow-y-auto");
    if (modal) modal.scrollTop = 150;
  });
  await page.waitForTimeout(500);
  await shot(page, `${SS_ADMIN}/14-manage-profile-edit.png`);

  // ── 15–16. "CHECK YOUR EMAIL" SCREENS (update + delete modes) ─────────────
  // Uses route interception so no real emails are sent during screenshot capture.
  console.log("\n📸  Manage Profile — sent confirmation screen");

  const mockPage = await desktop.newPage();

  const mockLeaderBody = JSON.stringify([{
    id: sparse.id,
    first_name: sparse.first_name,
    last_name: sparse.last_name,
    role: sparse.role || "Global Health Specialist",
    organisation: sparse.organisation || "Transform Health Coalition",
    linkedin: sparse.linkedin || "",
    photo_url: sparse.photo_url || null,
    bio: sparse.bio || "",
    expertise: sparse.expertise || [],
    notable_items: sparse.notable_items || [],
    country: sparse.country || "",
  }]);

  // Intercept findLeader query (identified by leader_email=eq. in the URL)
  await mockPage.route("**rest/v1/leaders**", async (route) => {
    if (route.request().url().includes("leader_email=eq.")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: mockLeaderBody });
    } else {
      await route.continue();
    }
  });

  // Intercept send-email action — return success without sending real email
  await mockPage.route("**/functions/v1/self-service", async (route) => {
    const body = route.request().postDataJSON() || {};
    if (body.action === "send-email") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, provider: "mock" }),
      });
    } else {
      await route.continue();
    }
  });

  for (const mode of ["update", "delete"]) {
    await go(mockPage, `${BASE}/#database`, 2000);
    await openManageModal(mockPage);

    // Fill the identify form — inputs are: first name [0], last name [1], email [2], linkedin [3]
    await mockPage.locator("input").nth(0).fill(sparse.first_name);
    await mockPage.locator("input").nth(1).fill(sparse.last_name);
    await mockPage.locator('input[type="email"]').fill("example@transformhealth.org");
    await mockPage.waitForTimeout(300);

    // Click FIND MY PROFILE
    const findBtn = mockPage.locator("button").filter({ hasText: /FIND MY PROFILE/i }).first();
    if (await findBtn.isVisible().catch(() => false)) {
      await findBtn.click();
      await mockPage.waitForTimeout(1200);
    }

    // Click the mode button (Update profile / Remove profile)
    const modePattern = mode === "update" ? /update profile/i : /remove profile/i;
    const modeBtn = mockPage.locator("button").filter({ hasText: modePattern }).first();
    if (await modeBtn.isVisible().catch(() => false)) {
      await modeBtn.click();
      await mockPage.waitForTimeout(500);
    }

    // Click SEND MAGIC LINK → intercepted, returns success → step advances to "sent"
    const sendBtn = mockPage.locator("button").filter({ hasText: /SEND MAGIC LINK/i }).first();
    if (await sendBtn.isVisible().catch(() => false)) {
      await sendBtn.click();
      await mockPage.waitForTimeout(900);
    }

    const filename = mode === "update"
      ? `${SS_ADMIN}/15-manage-profile-sent-update.png`
      : `${SS_ADMIN}/16-manage-profile-sent-delete.png`;
    await shot(mockPage, filename);
  }

  await mockPage.close();

  // ── Shield icon detail ────────────────────────────────────────────────────
  console.log("\n📸  UI details");
  await go(page, `${BASE}/#database`);
  const vp = page.viewportSize();
  await shot(page, `${SS_ADMIN}/shield-icon-detail.png`, {
    clip: { x: vp.width - 120, y: vp.height - 130, width: 110, height: 120 },
  });

  // ── Footer "Manage or remove" link detail ─────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const footerEl = await page.$("p:has(button)");
  if (footerEl) {
    const box = await footerEl.boundingBox();
    if (box) {
      await shot(page, `${SS_ADMIN}/manage-profile-footer-link.png`, {
        clip: { x: Math.max(0, box.x - 40), y: box.y - 20, width: box.width + 80, height: box.height + 40 },
      });
    }
  }

  // ── Admin login page ──────────────────────────────────────────────────────
  console.log("\n📸  Admin pages");
  await go(page, `${BASE}/#admin`);
  await shot(page, `${SS_ADMIN}/admin-login.png`);

  await desktop.close();
  await browser.close();

  console.log("\n✅  All screenshots saved.\n");
}

main().catch((err) => {
  console.error("\n❌ ", err.message);
  process.exit(1);
});
