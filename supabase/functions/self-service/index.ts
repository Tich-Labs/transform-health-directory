// Handles all public self-service operations — no admin auth required.
// action: "request-manage" → fetch leader email server-side, generate token, build + send email
// action: "generate"       → issue HMAC-signed magic link token (used by admin enrichment flow)
// action: "verify"         → verify magic link token signature + expiry
// action: "send-email"     → send email via Google Apps Script (rate-limited, recipient-validated)
// action: "notify-admin"   → send notification to admin; recipient resolved from ADMIN_NOTIFY_EMAIL secret

// Type shim — VS Code's TypeScript checker doesn't load Deno types.
// Supabase Edge Functions run in Deno; this declaration is for IDE clarity only.
declare namespace Deno {
  const env: { get(key: string): string | undefined };
  function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

const ALLOWED_ORIGINS = [
  "https://tich-labs.github.io",
  "https://transform-health-2.github.io",
  "https://transformhealthcoalition.org",
  "https://transformhealth.rrzdev.co.za",
  "http://localhost:5173",
  "http://localhost:5174",
];

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function respond(body: unknown, status: number, req: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// In-memory rate limit: max 5 requests per IP per 60 seconds.
// Resets on cold starts — acceptable for abuse prevention on a low-traffic endpoint.
const _rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const LIMIT = 5;
  const WINDOW_MS = 60_000;
  const now = Date.now();
  const entry = _rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    _rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= LIMIT) return true;
  _rateLimitMap.set(ip, { count: entry.count + 1, resetAt: entry.resetAt });
  return false;
}

async function sendViaAppsScript(
  { to, cc, subject, html }: { to: string; cc: string; subject: string; html: string },
  req: Request,
): Promise<Response> {
  const appsScriptUrl = Deno.env.get("APPS_SCRIPT_URL")!;
  const relaySecret = Deno.env.get("APPS_SCRIPT_KEY") ?? "";
  const res = await fetch(appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sendRawEmail", to, cc: cc || "", subject, htmlBody: html, secret: relaySecret }),
  });
  const text = await res.text();
  let data: { ok?: boolean; error?: string };
  try { data = JSON.parse(text); } catch { data = { ok: false, error: text }; }
  if (res.ok && data.ok) return respond({ ok: true, provider: "Google Apps Script" }, 200, req);
  return respond({ error: `Apps Script: ${JSON.stringify(data)}` }, 500, req);
}

const FIELD_DESCRIPTIONS: Record<string, string> = {
  "Country": "Where you are based",
  "Years of experience": "How long you have been working in this space",
  "Biography": "A short paragraph about your background and impact",
  "Geographical scope": "The region where most of your work takes place",
  "Profile photo": "A headshot or professional photo",
  "Expertise tags": "Your areas of specialisation (e.g. Digital Health, AI & Automation)",
  "Countries of work": "Countries where you actively work or have worked",
  "Notable items": "Publications, projects, awards, or initiatives you want to highlight (up to 3)",
};

function buildManageEmail({
  firstName, lastName, avatarUrl, linkedinUrl, tags,
  isDelete, isEnrichment, missingFields, manageUrl,
}: {
  firstName: string; lastName: string; avatarUrl: string; linkedinUrl: string;
  tags: string[]; isDelete: boolean; isEnrichment: boolean;
  missingFields: string[]; manageUrl: string;
}): string {
  const initials = ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();

  const missingFieldsHtml = isEnrichment ? `
    <div style="background:#fef9e7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:16px;text-align:left;max-width:480px;margin-left:auto;margin-right:auto">
      <div style="font-size:1.3rem;font-weight:600;color:#92400e;margin-bottom:8px;text-align:center">Update your profile</div>
      <div style="font-size:1.2rem;color:#78350f;line-height:1.6;text-align:center;margin-bottom:12px">Your profile is live in the directory. The following sections are incomplete:</div>
      ${missingFields.map(f => `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;margin-bottom:8px">
          <div style="font-size:1.2rem;font-weight:600;color:#92400e">${f}</div>
          <div style="font-size:1.1rem;color:#78350f;margin-top:2px">${FIELD_DESCRIPTIONS[f] || ""}</div>
        </div>`).join("")}
      <div style="font-size:1.2rem;color:#78350f;margin-top:12px;text-align:center">Please click the button below to complete your profile.</div>
    </div>` : "";

  const avatarHtml = avatarUrl
    ? `<img src="${avatarUrl}" alt="${firstName} ${lastName}" style="display:block;width:76px;height:76px;border-radius:50%;border:2px solid #F85A8E;outline:none" />`
    : `<table cellpadding="0" cellspacing="0" border="0" style="width:76px;height:76px;border-radius:50%;background:#D9D9D9;border:2px solid #F85A8E"><tr><td align="center" valign="middle" style="font-size:2rem;font-weight:600;color:#666;line-height:76px">${initials}</td></tr></table>`;

  const linkedinBadge = linkedinUrl
    ? `<a href="${linkedinUrl}" target="_blank" style="position:absolute;bottom:0;right:0;width:22px;height:22px;display:block;text-decoration:none">
        <svg viewBox="0 0 24 24" fill="none" style="width:22px;height:22px;display:block">
          <rect width="24" height="24" rx="3" fill="#0A66C2"/>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" fill="white"/>
        </svg>
      </a>` : "";

  const tagsHtml = tags.length
    ? `<div style="text-align:center;margin-bottom:16px">${tags.map(t =>
        `<span style="display:inline-block;font-size:1.2rem;font-weight:500;background:#e6f0ff;color:#02598E;padding:2px 10px;border-radius:9999px;border:1px solid #d1d9ec;margin:2px">${t.replace(/^Other:\s*/i, "").replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>`
      ).join("")}</div>` : "";

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f5efe0" style="background-color:#f5efe0;font-family:'Montserrat',Arial,Helvetica,sans-serif">
      <tr><td align="center" style="padding:24px 16px 0">
        <img src="https://transformhealthcoalition.org/wp-content/themes/th/assets/images/main_logo.svg" alt="Transform Health" style="display:block;border:0;outline:none;text-decoration:none;height:32px;width:auto;margin:0 auto" />
      </td></tr>
      <tr><td style="padding:16px 0">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td height="1" bgcolor="#F85A8E" style="height:1px;background:#F85A8E;font-size:0;line-height:0">&nbsp;</td></tr></table>
      </td></tr>
      <tr><td align="center" style="padding:0 16px">
        ${missingFieldsHtml}
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="position:relative;text-align:center">
            ${avatarHtml}
            ${linkedinBadge}
          </td></tr>
        </table>
        <div style="font-size:1.6rem;font-weight:600;color:#111827;margin:16px 0 12px;line-height:1.3;text-align:center">${firstName} ${lastName}</div>
        ${tagsHtml}
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px">
          <tr>
            <td align="center" style="border-radius:20px;${isDelete ? "background:#EF4444" : "background:#F85A8E"}">
              <a href="${manageUrl}" style="display:inline-block;min-width:200px;padding:10px 24px;border-radius:20px;color:#fff;text-decoration:none;font-size:1.3rem;font-weight:500;text-align:center">
                ${isDelete ? "Remove my profile" : "Manage my profile"}
              </a>
            </td>
          </tr>
        </table>
        <div style="text-align:center;margin-bottom:16px">
          <span style="display:inline-block;background:#fde68a;color:#92400e;font-size:1.1rem;font-weight:500;padding:4px 14px;border-radius:9999px">⏰ Expires in 48 hours</span>
        </div>
        <div style="font-size:1.2rem;color:#6b7280;margin-bottom:8px;text-align:center">Or copy this link:</div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;max-width:448px;margin:0 auto">
          <tr><td style="padding:10px 14px;font-family:'Courier New','Consolas',monospace;font-size:1.1rem;color:#374151;word-break:break-all">${manageUrl}</td></tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 16px"><tr><td height="1" bgcolor="#d1d5db" style="height:1px;background:#d1d5db;font-size:0;line-height:0">&nbsp;</td></tr></table>
        <div style="font-size:1rem;color:#9ca3af;line-height:1.5;text-align:center;padding:0 16px">
          You received this because you have a profile in the<br />
          <span style="color:#F85A8E;font-weight:600">Transform Health Women Leaders Directory</span>.<br />
          Didn&#39;t request this? You can safely ignore this email.
        </div>
      </td></tr>
    </table>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });

  try {
    const body = await req.json();
    const { action } = body;

    // ── Self-service: request magic link (server-side email fetch + send) ────
    // The client never touches leader_email or the raw token — both stay server-side.
    if (action === "request-manage") {
      const secret = Deno.env.get("MAGIC_LINK_SECRET");
      if (!secret) return respond({ error: "server misconfigured" }, 500, req);

      const { leaderId, mode, appUrl, firstName, lastName, linkedin, photoUrl, expertise, missingFields } = body;
      if (!leaderId || !mode || !appUrl) return respond({ error: "missing fields" }, 400, req);
      if (!["update", "delete"].includes(mode)) return respond({ error: "invalid mode" }, 400, req);

      const ip = req.headers.get("x-forwarded-for") ?? "unknown";
      if (isRateLimited(ip)) return respond({ error: "Rate limit exceeded" }, 429, req);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const leaderRes = await fetch(
        `${supabaseUrl}/rest/v1/leaders?id=eq.${encodeURIComponent(leaderId)}&select=id,leader_email,first_name,last_name,photo_url,expertise,linkedin&limit=1`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
      );
      const leaders: { id: string; leader_email: string; first_name: string; last_name: string; photo_url: string; expertise: string[]; linkedin: string }[] = await leaderRes.json();
      const leader = leaders?.[0];
      if (!leader?.leader_email) return respond({ error: "leader not found" }, 404, req);

      const expires = Date.now() + 1000 * 60 * 60 * 48;
      const payload = `${leaderId}:${mode}:${expires}`;
      const sig = await hmacSign(secret, payload);
      const token = btoa(JSON.stringify({ leaderId, mode, expires, sig }));
      const manageUrl = `${appUrl}?manage=${token}`;

      const displayFirstName = firstName || leader.first_name;
      const displayLastName = lastName || leader.last_name;
      const avatarUrl = photoUrl || leader.photo_url || "";
      const linkedinUrl = linkedin || leader.linkedin || "";
      const rawTags: unknown = expertise || leader.expertise || [];
      const tags = (Array.isArray(rawTags) ? rawTags as string[] : String(rawTags || "").split(/,\s*/)).filter(Boolean);
      const isDelete = mode === "delete";
      const isEnrichment = Array.isArray(missingFields) && missingFields.length > 0;

      const subject = isEnrichment
        ? "Update your Transform Health profile — some sections need your attention"
        : isDelete
          ? "Remove your Transform Health profile"
          : "Update your Transform Health profile";

      const html = buildManageEmail({
        firstName: displayFirstName, lastName: displayLastName,
        avatarUrl, linkedinUrl, tags, isDelete, isEnrichment,
        missingFields: isEnrichment ? missingFields : [], manageUrl,
      });

      const cc = Deno.env.get("ADMIN_CC_EMAIL") ?? "";
      return await sendViaAppsScript({ to: leader.leader_email, cc, subject, html }, req);
    }

    // ── Token: generate ──────────────────────────────────────────────────────
    if (action === "generate") {
      const secret = Deno.env.get("MAGIC_LINK_SECRET");
      if (!secret) return respond({ error: "server misconfigured" }, 500, req);

      const { leaderId, mode } = body;
      if (!leaderId || !mode) return respond({ error: "missing fields" }, 400, req);
      if (!["update", "delete"].includes(mode)) return respond({ error: "invalid mode" }, 400, req);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const check = await fetch(
        `${supabaseUrl}/rest/v1/leaders?id=eq.${encodeURIComponent(leaderId)}&select=id`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
      );
      const rows: { id: string }[] = await check.json();
      if (!rows?.length) return respond({ error: "leader not found" }, 404, req);

      // 48-hour expiry matches the "Expires in 48 hours" copy in the email
      const expires = Date.now() + 1000 * 60 * 60 * 48;
      const payload = `${leaderId}:${mode}:${expires}`;
      const sig = await hmacSign(secret, payload);
      const token = btoa(JSON.stringify({ leaderId, mode, expires, sig }));

      return respond({ token }, 200, req);
    }

    // ── Token: verify ────────────────────────────────────────────────────────
    if (action === "verify") {
      const secret = Deno.env.get("MAGIC_LINK_SECRET");
      if (!secret) return respond({ error: "server misconfigured" }, 500, req);

      const { token } = body;
      if (!token) return respond({ error: "missing token" }, 400, req);

      let parsed: { leaderId: string; mode: string; expires: number; sig: string };
      try {
        parsed = JSON.parse(atob(token));
      } catch {
        return respond({ error: "invalid token" }, 401, req);
      }

      const { leaderId, mode, expires, sig } = parsed;
      if (!leaderId || !mode || !expires || !sig) {
        return respond({ error: "malformed token" }, 401, req);
      }
      if (Date.now() > expires) return respond({ error: "token expired" }, 401, req);

      const expectedSig = await hmacSign(secret, `${leaderId}:${mode}:${expires}`);
      if (expectedSig !== sig) return respond({ error: "invalid signature" }, 401, req);

      return respond({ ok: true, leaderId, mode }, 200, req);
    }

    // ── Email: send ──────────────────────────────────────────────────────────
    if (action === "send-email") {
      const ip = req.headers.get("x-forwarded-for") ?? "unknown";
      if (isRateLimited(ip)) return respond({ error: "Rate limit exceeded" }, 429, req);

      const { to, subject, html } = body;
      // cc: true is a client flag meaning "use admin CC email from server env"
      const ccRaw: unknown = body.cc;
      const cc = ccRaw === true ? (Deno.env.get("ADMIN_CC_EMAIL") ?? "") : (typeof ccRaw === "string" ? ccRaw : "");

      if (!to || !subject || !html) return respond({ error: "Missing fields" }, 400, req);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminNotifyEmail = Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "";

      if (to !== adminNotifyEmail) {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/leaders?leader_email=eq.${encodeURIComponent(to)}&select=id&limit=1`,
          { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
        );
        const rows: { id: string }[] = await res.json();
        if (!rows?.length) return respond({ error: "Recipient not authorised" }, 403, req);
      }

      return await sendViaAppsScript({ to, cc, subject, html }, req);
    }

    // ── Email: notify admin ──────────────────────────────────────────────────
    // Resolves recipient from ADMIN_NOTIFY_EMAIL secret — never exposed to client.
    if (action === "notify-admin") {
      const notifyEmail = Deno.env.get("ADMIN_NOTIFY_EMAIL");
      if (!notifyEmail) return respond({ error: "ADMIN_NOTIFY_EMAIL not configured" }, 500, req);
      const { subject, html } = body;
      if (!subject || !html) return respond({ error: "subject and html required" }, 400, req);
      return await sendViaAppsScript({ to: notifyEmail, cc: "", subject, html }, req);
    }

    return respond({ error: "unknown action" }, 400, req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("self-service error:", msg);
    return respond({ error: msg }, 500, req);
  }
});
