/**
 * Migrate seed-data.json → Supabase leaders table.
 *
 * Usage:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_KEY=... node scripts/migrate-to-supabase.mjs
 *
 * The service key (not the anon key) is needed to bypass RLS for bulk insert.
 * Find it in Supabase → Project Settings → API → service_role key.
 */

import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const leaders = require("./seed-data.json");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://bahoslsvhwqybqkjonvb.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("ERROR: set SUPABASE_SERVICE_KEY (service_role key from Supabase dashboard)");
  console.error("  SUPABASE_SERVICE_KEY=eyJ... node scripts/migrate-to-supabase.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

function transformLeader(raw) {
  return {
    id: raw.id,
    first_name: raw.first_name,
    last_name: raw.last_name,
    role: raw.role || null,
    organisation: raw.organisation || null,
    bio: raw.bio || null,
    linkedin: raw.linkedin || null,
    photo_url: raw.photo_url || null,
    status: raw.status || "live",
    country: raw.country || null,
    expertise: raw.expertise
      ? raw.expertise.split(/,\s*/).filter(Boolean)
      : [],
    years_experience: raw.years_experience || raw.yearsExp || null,
    countries: (raw.countries || raw.selectedCountries)
      ? (Array.isArray(raw.countries || raw.selectedCountries)
          ? (raw.countries || raw.selectedCountries)
          : (raw.countries || raw.selectedCountries).split(/,\s*/).filter(Boolean))
      : [],
    notable_items: raw.notable_items || raw.notableItems || null,
    editor_email: raw.editor_email || null,
    branch: raw.branch || "self",
    nominate_link: raw.nominate_link || null,
  };
}

const rows = leaders.map(transformLeader);
console.log(`Migrating ${rows.length} leaders to Supabase…`);

// Insert in batches of 50 to avoid payload limits
const BATCH = 50;
let inserted = 0;
let skipped = 0;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase
    .from("leaders")
    .upsert(batch, { onConflict: "id", ignoreDuplicates: false });

  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
    skipped += batch.length;
  } else {
    inserted += batch.length;
    console.log(`  ✓ ${inserted}/${rows.length}`);
  }
}

console.log(`\nDone. Inserted/updated: ${inserted}  Skipped: ${skipped}`);
