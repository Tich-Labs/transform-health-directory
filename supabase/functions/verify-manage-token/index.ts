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

    const { token } = await req.json();
    if (!token) return respond({ error: "missing token" }, 400);

    let parsed: { leaderId: string; mode: string; expires: number; sig: string };
    try {
      parsed = JSON.parse(atob(token));
    } catch {
      return respond({ error: "invalid token" }, 401);
    }

    const { leaderId, mode, expires, sig } = parsed;
    if (!leaderId || !mode || !expires || !sig) {
      return respond({ error: "malformed token" }, 401);
    }

    if (Date.now() > expires) {
      return respond({ error: "token expired" }, 401);
    }

    const expectedSig = await hmacSign(secret, `${leaderId}:${mode}:${expires}`);
    if (expectedSig !== sig) {
      return respond({ error: "invalid signature" }, 401);
    }

    return respond({ ok: true, leaderId, mode });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return respond({ error: msg }, 500);
  }
});
