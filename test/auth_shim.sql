-- Efterligner de dele af Supabase, som schema.sql bruger (auth.users, auth.uid(), auth.jwt(), rollerne),
-- så schema.sql kan testes i PGlite uden en rigtig Supabase-instans.
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now(),
  last_sign_in_at timestamptz
);
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid
$$;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
grant usage on schema public, auth to anon, authenticated;
grant execute on function auth.uid(), auth.jwt() to anon, authenticated;
-- Som i Supabase: nye tabeller i public får fulde rettigheder som standard (schema.sql skal selv stramme op).
alter default privileges in schema public grant all on tables to anon, authenticated;
