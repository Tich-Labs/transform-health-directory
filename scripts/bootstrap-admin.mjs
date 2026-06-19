/**
 * Bootstrap the first super admin in production.
 * Run once to create your Auth user + super_admin role.
 * After this, you can log in and add more admins via the Admin panel.
 *
 * Usage:
 *   SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_KEY=your_key node scripts/bootstrap-admin.mjs
 */
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars");
  process.exit(1);
}

const email = process.argv[2] || "naijeria@gmail.com";
const password = process.argv[3] || "";
const role = process.argv[4] || "super_admin";

if (!password) {
  console.error("Usage: node scripts/bootstrap-admin.mjs <email> <password> [role]");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: "Bearer " + SERVICE_KEY,
  "Content-Type": "application/json",
};

async function main() {
  // 1. Create user in Auth
  console.log(`Creating Auth user: ${email}...`);
  const authRes = await fetch(SUPABASE_URL + "/auth/v1/admin/users", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  if (!authRes.ok && authRes.status !== 409 && authRes.status !== 422) {
    const err = await authRes.text();
    console.error("Auth create failed:", err);
    process.exit(1);
  }
  console.log(authRes.ok ? "  ✓ Auth user created" : "  ✓ Auth user already exists");

  // 2. Upsert role in admin_roles
  console.log(`Setting role: ${role}...`);
  const roleRes = await fetch(SUPABASE_URL + "/rest/v1/admin_roles", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, role, created_by: "bootstrap" }),
  });

  // If duplicate, try PATCH instead
  if (roleRes.status === 409) {
    const updateRes = await fetch(SUPABASE_URL + "/rest/v1/admin_roles?email=eq." + encodeURIComponent(email), {
      method: "PATCH",
      headers,
      body: JSON.stringify({ role }),
    });
    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error("Role update failed:", err);
      process.exit(1);
    }
    console.log("  ✓ Role updated");
  } else if (!roleRes.ok) {
    const err = await roleRes.text();
    console.error("Role insert failed:", err);
    process.exit(1);
  } else {
    console.log("  ✓ Role assigned");
  }

  console.log("\nDone! Sign in at https://tich-labs.github.io/transform-health-directory/#/admin");
  console.log(`  Email: ${email}`);
  console.log(`  Password: (the one you provided)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
