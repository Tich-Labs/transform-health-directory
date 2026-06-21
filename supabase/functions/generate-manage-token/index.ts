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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  try {
    const secret = Deno.env.get("MAGIC_LINK_SECRET");
    if (!secret) return respond({ error: "server misconfigured" }, 500);

    const { leaderId, mode } = await req.json();
    if (!leaderId || !mode) return respond({ error: "missing fields" }, 400);
    if (!["edit", "delete"].includes(mode)) return respond({ error: "invalid mode" }, 400);

    // Confirm the leader exists before issuing a token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const check = await fetch(
      `${supabaseUrl}/rest/v1/leaders?id=eq.${encodeURIComponent(leaderId)}&select=id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    const rows: { id: string }[] = await check.json();
    if (!rows?.length) return respond({ error: "leader not found" }, 404);

    // 48-hour expiry matches the "Expires in 48 hours" copy in the email
    const expires = Date.now() + 1000 * 60 * 60 * 48;
    const payload = `${leaderId}:${mode}:${expires}`;
    const sig = await hmacSign(secret, payload);
    const token = btoa(JSON.stringify({ leaderId, mode, expires, sig }));

    return respond({ token });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return respond({ error: msg }, 500);
  }
});
