-- Run this once in the Supabase Dashboard: SQL Editor -> New Query -> Run.
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text,
  ip_hash text,
  source text not null default 'contact_form',
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;
-- Intentionally no policies: anon/authenticated roles get zero access.
-- Only the Edge Function (using the service-role key server-side) can read/write.
