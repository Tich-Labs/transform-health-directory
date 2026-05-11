-- Migrate test_results table from old schema (jsonb blob) to new schema (normalized rows)
--
-- The old schema (from scripts/schema.sql) stored results as:
--   id text PRIMARY KEY, tester_name text NOT NULL, results jsonb, summary jsonb
--
-- The new schema stores each test case as its own row with columns:
--   section, scenario, priority, status, notes
--
-- This script:
--   1. Detects the old schema by checking if id is TEXT
--   2. Renames old table to test_results_v0 as backup
--   3. Creates the new table with the correct schema
--   4. Adds RLS policies and grants
--   5. Adds the unique constraint on (tester_name, scenario) for upsert support
--
-- Safe to run multiple times — idempotent.
-- Run in Supabase Dashboard → SQL Editor

DO $$
BEGIN
  -- Detect old-style table: id column is TEXT (no default, not UUID)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results'
      AND column_name = 'id'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE test_results RENAME TO test_results_v0;
    RAISE NOTICE 'Renamed old test_results → test_results_v0 (backup preserved)';
  END IF;
END $$;

-- Create the new table (no-op if it already has the correct schema)
CREATE TABLE IF NOT EXISTS test_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tester_name text,
  section text,
  scenario text,
  priority text,
  status text,
  notes text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to make this idempotent
DROP POLICY IF EXISTS "Allow public insert" ON test_results;
DROP POLICY IF EXISTS "Allow public select" ON test_results;
DROP POLICY IF EXISTS "Allow public update" ON test_results;
DROP POLICY IF EXISTS "Allow public delete" ON test_results;

-- Allow anyone to insert test results (testing sheet uses anon key)
CREATE POLICY "Allow public insert" ON test_results
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read test results (admin console uses anon key)
CREATE POLICY "Allow public select" ON test_results
  FOR SELECT USING (true);

-- Allow updates/deletes (for admin management)
CREATE POLICY "Allow public update" ON test_results
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete" ON test_results
  FOR DELETE USING (true);

-- Grant access to anon and authenticated roles
GRANT ALL ON test_results TO anon;
GRANT ALL ON test_results TO authenticated;

-- Add unique constraint on (tester_name, scenario) for upsert support
-- Required by testing-sheet.html which uses .upsert() with onConflict
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'test_results_tester_scenario_unique'
  ) THEN
    ALTER TABLE test_results
      ADD CONSTRAINT test_results_tester_scenario_unique
      UNIQUE (tester_name, scenario);
    RAISE NOTICE 'Added unique constraint on (tester_name, scenario)';
  END IF;
END $$;

-- Verify
SELECT 'Migration complete' AS status,
       (SELECT COUNT(*) FROM test_results) AS rows_in_new_table,
       (SELECT true FROM information_schema.tables WHERE table_name = 'test_results_v0') AS old_table_backup;
