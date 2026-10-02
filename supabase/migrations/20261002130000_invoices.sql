-- Aexo: saved invoices (Phase 7 dashboard).
--
-- One row per saved invoice. The full invoice document lives in `data`
-- (jsonb) so templates, customization and future fields survive without
-- schema changes; the flat columns exist only for the dashboard list
-- (search, filter, sort, totals) without parsing JSON per row.
--
-- Row Level Security: a signed-in user can touch only their own rows.
-- Apply in the Supabase dashboard SQL editor (or `supabase db push`).

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  number text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  currency text not null default 'USD'
    check (char_length(currency) = 3),
  total numeric(14, 2) not null default 0,
  client_name text not null default '',
  sender_name text not null default '',
  issue_date date,
  due_date date,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.invoices is 'Saved invoices, one row per invoice per user.';

alter table public.invoices enable row level security;

-- (select auth.uid()) is evaluated once per query instead of once per row.
create policy "Users can view their own invoices"
  on public.invoices for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can save invoices"
  on public.invoices for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own invoices"
  on public.invoices for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own invoices"
  on public.invoices for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- The client never touches another user's rows; anon touches none.
revoke all on public.invoices from anon;
revoke all on public.invoices from authenticated;
grant select, insert, update, delete on public.invoices to authenticated;

-- Dashboard list: one user's invoices, newest first.
create index if not exists invoices_user_updated_idx
  on public.invoices (user_id, updated_at desc);

-- Keep updated_at current (reuses the function from the profiles migration).
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();
