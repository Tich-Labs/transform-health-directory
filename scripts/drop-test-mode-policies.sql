-- Run this in the Supabase SQL Editor ONCE before launch.
-- Drops the four "test mode" policies that allow anonymous read/write/delete.
-- The correct authenticated-only policies already exist alongside them.

drop policy if exists "Admin test mode: read all leaders"  on public.leaders;
drop policy if exists "Admin test mode: update leaders"    on public.leaders;
drop policy if exists "Admin test mode: delete leaders"    on public.leaders;
drop policy if exists "Admin test mode: update requests"   on public.requests;

-- Verify: the following query should return zero rows.
-- select policyname from pg_policies
-- where policyname ilike '%test mode%';
