-- Aexo: user profiles (Phase 3 account foundation).
--
-- One row per auth user, created automatically on sign-up. Row Level Security
-- means a signed-in user can read and update only their own profile; nobody
-- can read anyone else's. Rows are never inserted or deleted from the client:
-- the trigger creates them and ON DELETE CASCADE removes them with the user.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Aexo account profile, one per auth user.';

alter table public.profiles enable row level security;

-- (select auth.uid()) is evaluated once per query instead of once per row.
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Policies decide which rows; column grants decide which fields. Users may
-- change their name only, never id or timestamps.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Keep updated_at current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile when an auth user is created. The name comes from the
-- sign-up form (user metadata). security definer lets it write past RLS;
-- the empty search_path prevents search_path hijacking.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The trigger function must not be callable through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
