-- Run this in Supabase Dashboard → SQL Editor
-- This adds the linkedin_clicks column to the leaders table

ALTER TABLE public.leaders 
  ADD COLUMN IF NOT EXISTS linkedin_clicks integer DEFAULT 0;

-- Verify it worked:
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'leaders' AND column_name = 'linkedin_clicks';

-- Optional: Create RPC function for efficient increment
-- (Run this only if you want to use RPC instead of get+update)
/*
CREATE OR REPLACE FUNCTION increment_linkedin_clicks(leader_id text)
RETURNS void AS $$
BEGIN
  UPDATE public.leaders 
  SET linkedin_clicks = COALESCE(linkedin_clicks, 0) + 1
  WHERE id = leader_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
