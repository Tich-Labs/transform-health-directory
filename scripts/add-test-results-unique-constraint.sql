-- Add a unique constraint on (tester_name, scenario) so we can upsert
-- instead of delete-all + re-insert. This preserves created_at timestamps,
-- enabling the admin to see accurate "last saved" dates and allowing
-- returning testers to continue where they left off without losing history.
--
-- NOTE: This is already included in scripts/create-test-results-table.sql
-- and scripts/migrate-test-results-table.sql. Run this standalone only
-- if you created the table without the constraint and need to add it later.
--
-- Run this in Supabase Dashboard → SQL Editor

-- Remove duplicate rows first (keep the most recent for each tester+scenario combo)
DELETE FROM test_results a
USING test_results b
WHERE a.id < b.id
  AND a.tester_name IS NOT DISTINCT FROM b.tester_name
  AND a.scenario IS NOT DISTINCT FROM b.scenario;

-- Add the unique constraint
ALTER TABLE test_results ADD CONSTRAINT test_results_tester_scenario_unique UNIQUE (tester_name, scenario);
