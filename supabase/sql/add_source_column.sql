-- Run this once in the Supabase Dashboard: SQL Editor -> New Query -> Run.
-- Adds a `source` column so leads captured from different places on the
-- site (general contact form vs. the circle.html registration modal) can
-- be told apart in the same contacts table.
alter table public.contacts add column if not exists source text not null default 'contact_form';
