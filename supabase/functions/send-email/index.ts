const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://tich-labs.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// Simple in-memory rate limit: max 5 calls per IP per 60 seconds.
// Resets per function instance (good enough to stop casual abuse).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) ?? { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  rateLimitMap.set(ip, { ...entry, count: entry.count + 1 });
  return false;
}

const APPS_SCRIPT_URL = Deno.env.get("APPS_SCRIPT_URL");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) return respond({ error: "Rate limit exceeded" }, 429);

  try {
    const { to, cc, subject, html } = await req.json();
    if (!to || !subject || !html) return respond({ error: "Missing fields" }, 400);

    // Validate recipient: must be a known leader_email in the DB or the configured admin address.
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminNotifyEmail = Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "";

    if (to !== adminNotifyEmail) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/leaders?leader_email=eq.${encodeURIComponent(to)}&select=id&limit=1`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
      );
      const rows: { id: string }[] = await res.json();
      if (!rows?.length) {
        return respond({ error: "Recipient not authorised" }, 403);
      }
    }

    const res = await fetch(APPS_SCRIPT_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendRawEmail",
        to,
        cc: cc || "",
        subject,
        htmlBody: html,
      }),
    });

    const text = await res.text();
    let data: { ok?: boolean; error?: string };
    try { data = JSON.parse(text); } catch { data = { ok: false, error: text }; }

    if (res.ok && data.ok) {
      return respond({ ok: true, provider: "Google Apps Script" });
    }

    return respond({ error: `Apps Script: ${JSON.stringify(data)}` }, 500);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(err);
    return respond({ error: msg }, 500);
  }
});
