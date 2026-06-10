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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) return respond({ error: "Missing fields" }, 400);

    // Try Resend API (free tier, works on port 443)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "Transform Health <noreply@transformhealthcoalition.org>",
          to,
          subject,
          html,
        }),
      });
      if (res.ok) return respond({ ok: true, provider: "Resend" });
      const data = await res.json();
      return respond({ error: `Resend: ${JSON.stringify(data)}` }, 500);
    }

    // Fallback: try generic SMTP via API
    const smtpUser = Deno.env.get("GOOGLE_SMTP_USER");
    const smtpPass = Deno.env.get("GOOGLE_SMTP_PASS");

    if (!smtpUser && !resendKey) {
      return respond({
        error: "No email provider configured. Set RESEND_API_KEY (recommended) or GOOGLE_SMTP_USER+GOOGLE_SMTP_PASS in project secrets.",
      }, 500);
    }

    // We have SMTP creds but they may not work from this runtime
    return respond({ error: "SMTP direct connection not available from Supabase runtime. Please set RESEND_API_KEY instead." }, 500);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return respond({ error: msg }, 500);
  }
});
