// Type shim — VS Code's TypeScript checker doesn't load Deno types.
// export {} makes this a module so ALLOWED_ORIGINS doesn't clash with self-service at global scope.
export {};
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });

  try {
    const { action, email, role, origin } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!serviceKey) return respond({ error: "Service role key not configured" }, 500, req);
    if (!supabaseUrl) return respond({ error: "SUPABASE_URL not configured" }, 500, req);

    // Extract the caller's identity from the verified bearer token — never trust client-supplied email.
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "");
    if (!bearerToken) return respond({ error: "Unauthorised" }, 401, req);

    const userRes = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: { apikey: serviceKey, Authorization: "Bearer " + bearerToken },
    });
    if (!userRes.ok) return respond({ error: "Unauthorised" }, 401, req);
    const userJson: { email?: string } = await userRes.json();
    const invokerEmail = userJson.email;
    if (!invokerEmail) return respond({ error: "Unauthorised" }, 401, req);

    const headers = {
      apikey: serviceKey,
      Authorization: "Bearer " + serviceKey,
      "Content-Type": "application/json",
    };

    async function restGet(path: string) {
      const res = await fetch(supabaseUrl + "/rest/v1/" + path, { headers });
      return res.json();
    }

    // Verify the invoker is a super admin
    const invoker: { role?: string }[] = await restGet("admin_roles?email=eq." + encodeURIComponent(invokerEmail) + "&select=role");
    if (!invoker?.length || invoker[0].role !== "super_admin") {
      return respond({ error: "Only super admins can manage roles" }, 403, req);
    }

    if (action === "add") {
      if (!email || !role) return respond({ error: "email and role required" }, 400, req);
      if (!["admin", "editor"].includes(role)) return respond({ error: "Role must be admin or editor" }, 400, req);

      // Check if user already has a role
      const existing: { id?: string }[] = await restGet("admin_roles?email=eq." + encodeURIComponent(email) + "&select=id");
      if (existing?.length) return respond({ error: "User already has a role" }, 409, req);

      // Create user in Supabase Auth — use CSPRNG, not Math.random()
      const pwBytes = crypto.getRandomValues(new Uint8Array(24));
      const pw = btoa(String.fromCharCode(...pwBytes));
      const createRes = await fetch(supabaseUrl + "/auth/v1/admin/users", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password: pw, email_confirm: true }),
      });

      // 409 = duplicate key, 422 = user already registered in Auth — both are fine, proceed to insert role
      if (!createRes.ok && createRes.status !== 409 && createRes.status !== 422) {
        const err = await createRes.text();
        return respond({ error: "Auth create failed: " + err }, 500, req);
      }

      // Insert role
      const insertRes = await fetch(supabaseUrl + "/rest/v1/admin_roles", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, role, created_by: invokerEmail }),
      });

      if (!insertRes.ok) {
        const err = await insertRes.text();
        return respond({ error: "Insert failed: " + err }, 500, req);
      }

      // Send invitation email
      const appScriptUrl = Deno.env.get("APPS_SCRIPT_URL") || "";
      if (appScriptUrl) {
        const baseUrl = origin || "https://tich-labs.github.io/transform-health-directory";
        const loginUrl = baseUrl + "/?setup=" + encodeURIComponent(email) + "#/admin";
        try {
          await fetch(appScriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "sendRawEmail",
              to: email,
              subject: "You've been added as " + role + " — Transform Health Admin",
              htmlBody: "<p>You have been added as <strong>" + role + "</strong> to the Transform Health Women Leaders Directory admin console. <a href=\"" + loginUrl + "\">Click here to set your password</a> — you'll be logged in immediately after.</p>",
            }),
          });
        } catch (_e) {
          // non-fatal
        }
      }

      // Log the action (non-fatal — table may not exist yet)
      try {
        await fetch(supabaseUrl + "/rest/v1/admin_activity_log", {
          method: "POST",
          headers,
          body: JSON.stringify({ action: "add_admin", target_email: email, role, performed_by: invokerEmail }),
        });
      } catch (_e) { /* ignore */ }

      return respond({ ok: true, message: email + " added as " + role + ". Invitation sent." }, 200, req);
    }

    if (action === "list") {
      const data = await restGet("admin_roles?order=created_at.desc");
      return respond({ ok: true, data: data || [] }, 200, req);
    }

    if (action === "activity") {
      try {
        const data = await restGet("admin_activity_log?order=created_at.desc&limit=30");
        return respond({ ok: true, data: Array.isArray(data) ? data : [] }, 200, req);
      } catch (_e) {
        return respond({ ok: true, data: [] }, 200, req);
      }
    }

    if (action === "remove") {
      if (!email) return respond({ error: "email required" }, 400, req);

      // 1. Remove from admin_roles table
      const delRes = await fetch(supabaseUrl + "/rest/v1/admin_roles?email=eq." + encodeURIComponent(email), {
        method: "DELETE",
        headers,
      });
      if (!delRes.ok) {
        const err = await delRes.text();
        return respond({ error: "Delete failed: " + err }, 500, req);
      }

      // 2. Delete from Supabase Auth so the user cannot log in at all
      try {
        const usersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=200`, {
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        });
        const { users } = await usersRes.json();
        const authUser = users?.find((u: { email: string; id: string }) => u.email === email);
        if (authUser?.id) {
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${authUser.id}`, {
            method: "DELETE",
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
          });
        }
      } catch (_e) { /* non-fatal — admin_roles removal already succeeded */ }

      // Log the removal (non-fatal)
      try {
        await fetch(supabaseUrl + "/rest/v1/admin_activity_log", {
          method: "POST",
          headers,
          body: JSON.stringify({ action: "remove_admin", target_email: email, performed_by: invokerEmail }),
        });
      } catch (_e) { /* ignore */ }

      return respond({ ok: true, message: email + " removed" }, 200, req);
    }

    return respond({ error: "Unknown action" }, 400, req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("manage-admin error:", msg);
    return respond({ error: msg }, 500, req);
  }
});
