-- ============================================================
-- Transform Health Women Leaders Directory — Supabase Schema
-- Run this in the Supabase SQL Editor (one paste, one run)
-- ============================================================

-- Leaders table
create table if not exists public.leaders (
  id                text primary key,
  created_at        timestamptz default now(),
  branch            text default 'self',
  first_name        text not null,
  last_name         text not null,
  role              text,
  organisation      text,
  bio               text,
  linkedin          text,
  photo_url         text,
  status            text default 'pending' check (status in ('pending', 'live', 'rejected')),
  editor_email      text,                -- email of person who submitted (visible to admin)
  leader_email      text,                -- leader's own email (NOT visible in public directory) — migration: add-leader-email-column.sql
  nominator_name    text,                -- name of nominator (nominate branch only) — migration: add-nominator-name-column.sql
  internal_note     text,
  country           text,
  nominate_link     text,
  geo_scope         text,                -- geographical scope — migration: add-geo-scope-column.sql
  expertise         text[],
  years_experience  text,
  countries         text[],
  notable_items     jsonb,
  admin_token       text
);

-- Requests table
create table if not exists public.requests (
  id            text primary key,
  created_at    timestamptz default now(),
  request_type  text check (request_type in ('update', 'delete')),
  first_name    text,
  last_name     text,
  email         text,
  linkedin      text,
  changes       text,
  reason        text,
  status        text default 'pending' check (status in ('pending', 'approved', 'dismissed')),
  leader_id     text references public.leaders(id)
);

-- Row Level Security
alter table public.leaders enable row level security;
alter table public.requests enable row level security;

-- Leaders: anyone can read live entries (public directory)
drop policy if exists "Public read live leaders" on public.leaders;
create policy "Public read live leaders"
  on public.leaders for select
  using (status = 'live');

-- Leaders: authenticated admin can read all entries
drop policy if exists "Admin read all leaders" on public.leaders;
create policy "Admin read all leaders"
  on public.leaders for select
  to authenticated
  using (true);

-- TEST MODE POLICIES — remove all three before launch
-- Allow anon to read all statuses (admin needs pending/rejected too)
drop policy if exists "Admin test mode: read all leaders" on public.leaders;
create policy "Admin test mode: read all leaders"
  on public.leaders for select
  to public
  using (true);

-- Allow anon to approve / reject (update status)
drop policy if exists "Admin test mode: update leaders" on public.leaders;
create policy "Admin test mode: update leaders"
  on public.leaders for update
  to public
  using (true)
  with check (true);

-- Allow anon to update request status (approve/dismiss)
drop policy if exists "Admin test mode: update requests" on public.requests;
create policy "Admin test mode: update requests"
  on public.requests for update
  to public
  using (true)
  with check (true);

-- Leaders: anyone can submit (insert pending entry)
drop policy if exists "Anyone can submit" on public.leaders;
create policy "Anyone can submit"
  on public.leaders for insert
  with check (true);

-- Leaders: authenticated admin can approve / reject (update status)
drop policy if exists "Admin can update leaders" on public.leaders;
create policy "Admin can update leaders"
  on public.leaders for update
  to authenticated
  using (true);

-- Requests: anyone can submit a profile request
drop policy if exists "Anyone can submit request" on public.requests;
create policy "Anyone can submit request"
  on public.requests for insert
  with check (true);

-- Requests: authenticated admin can read and update requests
drop policy if exists "Admin can manage requests" on public.requests;
create policy "Admin can manage requests"
  on public.requests for all
  to authenticated
  using (true);

-- Storage bucket for profile photos (public read, open write for now)
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view photos" on storage.objects;
create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

drop policy if exists "Anyone can upload photos" on storage.objects;
create policy "Anyone can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'profile-photos');

-- ============================================================
-- Before launch checklist (remove/replace test-mode policies)
-- ============================================================
-- 1. Drop "Admin test mode: read all leaders" policy
-- 2. Create a real admin user in Supabase Auth
-- 3. Re-enable the Admin auth gate in Admin.jsx

-- Track LinkedIn clicks
ALTER TABLE leaders ADD COLUMN IF NOT EXISTS linkedin_clicks integer DEFAULT 0;

-- Optional: detailed click log (uncomment to enable)
-- CREATE TABLE IF NOT EXISTS leader_clicks (
--   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   leader_id text REFERENCES leaders(id) ON DELETE CASCADE,
--   clicked_at timestamptz DEFAULT now(),
--   user_agent text,
--   referrer text
-- );
-- Admin roles table
-- Maps email addresses to roles for the admin console.
-- Run this in Supabase SQL Editor.

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('super_admin', 'admin', 'editor')),
  created_by text,
  created_at timestamptz default now()
);

-- Allow admins to read (authenticated users only)
alter table public.admin_roles enable row level security;

drop policy if exists "Authenticated users can read admin_roles" on public.admin_roles;
create policy "Authenticated users can read admin_roles"
  on public.admin_roles for select
  to authenticated
  using (true);

-- Only the edge function (service role) can insert/update
-- Admin activity log table
-- Tracks when admins are added or removed, and by whom.
-- Run this in Supabase SQL Editor before deploying the updated manage-admin function.

create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,          -- 'add_admin' | 'remove_admin'
  target_email text not null,
  role text,
  performed_by text not null,
  created_at timestamptz default now()
);

alter table public.admin_activity_log enable row level security;

drop policy if exists "Authenticated users can read admin_activity_log" on public.admin_activity_log;
create policy "Authenticated users can read admin_activity_log"
  on public.admin_activity_log for select
  to authenticated
  using (true);

-- Only the edge function (service role) can insert
-- Add geo_scope column to leaders table
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS geo_scope text;

-- Grant access
GRANT ALL ON public.leaders TO anon;
-- Add leader_email column to leaders table
-- Run this in Supabase SQL Editor to add the new column

ALTER TABLE public.leaders 
ADD COLUMN IF NOT EXISTS leader_email text;

-- Add comment to document the field
COMMENT ON COLUMN public.leaders.leader_email IS 'Leader''s own email address — NOT visible in public directory, only in Admin. Used for magic link emails.';

-- Verify the column was added
-- This adds the linkedin_clicks column to the leaders table

ALTER TABLE public.leaders 
  ADD COLUMN IF NOT EXISTS linkedin_clicks integer DEFAULT 0;

-- Verify it worked:
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
-- Add nominator_name column to leaders table
-- Run this in Supabase SQL Editor

ALTER TABLE public.leaders
ADD COLUMN IF NOT EXISTS nominator_name text;

COMMENT ON COLUMN public.leaders.nominator_name IS 'Name of person who nominated this leader (for nominate branch submissions)';

-- Verify
-- Remove this policy before launch and replace with an authenticated admin policy.
drop policy if exists "Admin test mode: delete leaders" on public.leaders;
create policy "Admin test mode: delete leaders"
  on public.leaders for delete
  to public
  using (true);
-- Backfill missing country data for leaders
-- Run this in Supabase SQL Editor to list leaders with NULL country

-- Step 1: Preview leaders missing country data
SELECT id, first_name, last_name, country, created_at
FROM leaders
WHERE country IS NULL OR country = ''
ORDER BY created_at DESC;

-- Step 2: Once you know the correct country for each leader, update them:
-- UPDATE leaders SET country = '<COUNTRY>' WHERE id = '<UUID>';
-- UPDATE leaders SET country = '<COUNTRY>' WHERE id = '<UUID>';

-- Example:
-- UPDATE leaders SET country = 'Kenya' WHERE id = 'some-uuid-here';

-- Step 3: Verify no more nulls remain
-- SELECT COUNT(*) AS missing_country_count FROM leaders WHERE country IS NULL OR country = '';
-- Atomic increment for linkedin_clicks — avoids lost-update race condition
-- under concurrent users (replaces the non-atomic read-then-write fallback in leaders.js).
CREATE OR REPLACE FUNCTION increment_linkedin_clicks(leader_id TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE leaders
  SET linkedin_clicks = COALESCE(linkedin_clicks, 0) + 1
  WHERE id = leader_id;
$$;
-- Restrict which columns the anon role can read from the leaders table.
-- The app already limits its public SELECT list, but the anon key can query
-- any column via the Supabase REST API directly.  This view + REVOKE closes
-- that gap so only public-safe fields are accessible without authentication.

CREATE OR REPLACE VIEW public_leaders AS
SELECT
  id,
  first_name,
  last_name,
  role,
  organisation,
  bio,
  linkedin,
  photo_url,
  country,
  geo_scope,
  expertise,
  years_experience,
  countries,
  notable_items,
  created_at,
  linkedin_clicks
FROM leaders
WHERE status = 'live';

-- Let the anon role query this view
GRANT SELECT ON public_leaders TO anon;

-- Revoke direct table read from anon so they must go through the view.
-- Authenticated (admin) users keep full table access via their own RLS policies.
REVOKE SELECT ON leaders FROM anon;
-- Anon users cannot SELECT from the leaders table directly (migration 015).
-- This SECURITY DEFINER function runs as the table owner, so it can match on
-- the private leader_email column without exposing it to the caller.
-- It returns only public-safe fields — the same set as the public_leaders view.
CREATE OR REPLACE FUNCTION find_leader_by_email(
  p_first_name TEXT,
  p_last_name  TEXT,
  p_email      TEXT
)
RETURNS TABLE (
  id             TEXT,
  first_name     TEXT,
  last_name      TEXT,
  role           TEXT,
  organisation   TEXT,
  linkedin       TEXT,
  photo_url      TEXT,
  bio            TEXT,
  expertise      TEXT[],
  notable_items  JSONB,
  country        TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    id, first_name, last_name, role, organisation,
    linkedin, photo_url, bio, expertise, notable_items, country
  FROM leaders
  WHERE status = 'live'
    AND LOWER(TRIM(first_name))   = LOWER(TRIM(p_first_name))
    AND LOWER(TRIM(last_name))    = LOWER(TRIM(p_last_name))
    AND LOWER(TRIM(leader_email)) = LOWER(TRIM(p_email))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION find_leader_by_email(TEXT, TEXT, TEXT) TO anon;
