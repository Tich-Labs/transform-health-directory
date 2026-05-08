-- Add leader_email column to leaders table
-- Run this in Supabase SQL Editor to add the new column

ALTER TABLE public.leaders 
ADD COLUMN IF NOT EXISTS leader_email text;

-- Add comment to document the field
COMMENT ON COLUMN public.leaders.leader_email IS 'Leader''s own email address — NOT visible in public directory, only in Admin. Used for magic link emails.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'leaders' 
  AND column_name = 'leader_email';
