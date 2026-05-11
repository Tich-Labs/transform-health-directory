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
create policy "Public read live leaders"
  on public.leaders for select
  using (status = 'live');

-- Leaders: authenticated admin can read all entries
create policy "Admin read all leaders"
  on public.leaders for select
  to authenticated
  using (true);

-- TEST MODE POLICIES — remove all three before launch
-- Allow anon to read all statuses (admin needs pending/rejected too)
create policy "Admin test mode: read all leaders"
  on public.leaders for select
  to public
  using (true);

-- Allow anon to approve / reject (update status)
create policy "Admin test mode: update leaders"
  on public.leaders for update
  to public
  using (true)
  with check (true);

-- Allow anon to update request status (approve/dismiss)
create policy "Admin test mode: update requests"
  on public.requests for update
  to public
  using (true)
  with check (true);

-- Leaders: anyone can submit (insert pending entry)
create policy "Anyone can submit"
  on public.leaders for insert
  with check (true);

-- Leaders: authenticated admin can approve / reject (update status)
create policy "Admin can update leaders"
  on public.leaders for update
  to authenticated
  using (true);

-- Requests: anyone can submit a profile request
create policy "Anyone can submit request"
  on public.requests for insert
  with check (true);

-- Requests: authenticated admin can read and update requests
create policy "Admin can manage requests"
  on public.requests for all
  to authenticated
  using (true);

-- Storage bucket for profile photos (public read, open write for now)
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

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
