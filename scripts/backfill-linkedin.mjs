/**
 * Backfill LinkedIn URLs from seed-data.json into Supabase
 * Run: node scripts/backfill-linkedin.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const SUPABASE_URL = 'https://bahoslsvhwqybqkjonvb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5ZfvUrNW983egwvEmfZAYA_igo9CMvT';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const seed = JSON.parse(
  readFileSync(new URL('./seed-data.json', import.meta.url))
);

let updated = 0;
let skipped = 0;

for (const entry of seed) {
  if (!entry.linkedin) {
    skipped++;
    continue;
  }

  const { error } = await supabase
    .from('leaders')
    .update({ linkedin: entry.linkedin })
    .eq('first_name', entry.first_name)
    .eq('last_name', entry.last_name);

  if (error) {
    console.error(`Error updating ${entry.first_name} ${entry.last_name}:`, error.message);
  } else {
    updated++;
    console.log(`✓ Updated LinkedIn for ${entry.first_name} ${entry.last_name}`);
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped (no LinkedIn URL in seed)`);
