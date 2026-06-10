const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const APPS_SCRIPT_URL = Deno.env.get("APPS_SCRIPT_URL");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) return respond({ error: "Missing fields" }, 400);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendRawEmail",
        to,
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
