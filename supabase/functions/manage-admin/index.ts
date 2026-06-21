import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  try {
    const { action, email, role, origin } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!serviceKey) return respond({ error: "Service role key not configured" }, 500);
    if (!supabaseUrl) return respond({ error: "SUPABASE_URL not configured" }, 500);

    // Extract the caller's identity from the verified bearer token — never trust client-supplied email.
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "");
    if (!bearerToken) return respond({ error: "Unauthorised" }, 401);

    const userRes = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: { apikey: serviceKey, Authorization: "Bearer " + bearerToken },
    });
    if (!userRes.ok) return respond({ error: "Unauthorised" }, 401);
    const userJson: { email?: string } = await userRes.json();
    const invokerEmail = userJson.email;
    if (!invokerEmail) return respond({ error: "Unauthorised" }, 401);

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
      return respond({ error: "Only super admins can manage roles" }, 403);
    }

    if (action === "add") {
      if (!email || !role) return respond({ error: "email and role required" }, 400);
      if (!["admin", "editor"].includes(role)) return respond({ error: "Role must be admin or editor" }, 400);

      // Check if user already has a role
      const existing: { id?: string }[] = await restGet("admin_roles?email=eq." + encodeURIComponent(email) + "&select=id");
      if (existing?.length) return respond({ error: "User already has a role" }, 409);

      // Create user in Supabase Auth
      const pw = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const createRes = await fetch(supabaseUrl + "/auth/v1/admin/users", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password: pw, email_confirm: true }),
      });

      // 409 = duplicate key, 422 = user already registered in Auth — both are fine, proceed to insert role
      if (!createRes.ok && createRes.status !== 409 && createRes.status !== 422) {
        const err = await createRes.text();
        return respond({ error: "Auth create failed: " + err }, 500);
      }

      // Insert role
      const insertRes = await fetch(supabaseUrl + "/rest/v1/admin_roles", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, role, created_by: invokerEmail }),
      });

      if (!insertRes.ok) {
        const err = await insertRes.text();
        return respond({ error: "Insert failed: " + err }, 500);
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

      return respond({ ok: true, message: email + " added as " + role + ". Invitation sent." });
    }

    if (action === "list") {
      const data = await restGet("admin_roles?order=created_at.desc");
      return respond({ ok: true, data: data || [] });
    }

    if (action === "activity") {
      try {
        const data = await restGet("admin_activity_log?order=created_at.desc&limit=30");
        return respond({ ok: true, data: Array.isArray(data) ? data : [] });
      } catch (_e) {
        return respond({ ok: true, data: [] });
      }
    }

    if (action === "remove") {
      if (!email) return respond({ error: "email required" }, 400);

      const delRes = await fetch(supabaseUrl + "/rest/v1/admin_roles?email=eq." + encodeURIComponent(email), {
        method: "DELETE",
        headers,
      });

      if (!delRes.ok) {
        const err = await delRes.text();
        return respond({ error: "Delete failed: " + err }, 500);
      }

      // Log the removal (non-fatal)
      try {
        await fetch(supabaseUrl + "/rest/v1/admin_activity_log", {
          method: "POST",
          headers,
          body: JSON.stringify({ action: "remove_admin", target_email: email, performed_by: invokerEmail }),
        });
      } catch (_e) { /* ignore */ }

      return respond({ ok: true, message: email + " removed" });
    }

    return respond({ error: "Unknown action" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("manage-admin error:", msg);
    return respond({ error: msg }, 500);
  }
});
