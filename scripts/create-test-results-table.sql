-- Create test_results table for storing testing sheet submissions
--
-- This script handles both fresh installs and migration from the old
-- schema (where id was TEXT without default). Safe to run multiple times.
--
-- Run this in Supabase Dashboard → SQL Editor
--
-- See also: scripts/migrate-test-results-table.sql (standalone migration)

-- Step 1: Migrate old schema (id as TEXT) → new schema (id as UUID with default)
DO $$
BEGIN
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

-- Step 2: Create the new table
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

-- Step 3: Enable Row Level Security
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies (idempotent — drops first)
DROP POLICY IF EXISTS "Allow public insert" ON test_results;
DROP POLICY IF EXISTS "Allow public select" ON test_results;
DROP POLICY IF EXISTS "Allow public update" ON test_results;
DROP POLICY IF EXISTS "Allow public delete" ON test_results;

CREATE POLICY "Allow public insert" ON test_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON test_results
  FOR SELECT USING (true);

CREATE POLICY "Allow public update" ON test_results
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete" ON test_results
  FOR DELETE USING (true);

-- Step 5: Grant access
GRANT ALL ON test_results TO anon;
GRANT ALL ON test_results TO authenticated;

-- Step 6: Add unique constraint for upsert support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'test_results_tester_scenario_unique'
  ) THEN
    ALTER TABLE test_results
      ADD CONSTRAINT test_results_tester_scenario_unique
      UNIQUE (tester_name, scenario);
  END IF;
END $$;

-- Verify
SELECT COUNT(*) AS total_rows, 'test_results' AS table_name FROM test_results;
