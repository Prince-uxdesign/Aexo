-- Aexo: professional management (Phase 17).
--
-- `archived` hides invoices from the main working view without deleting them;
-- the dashboard offers an archived view with restore. It is deliberately not
-- a status: the status CHECK constraint and its meaning stay untouched.
-- `client_email` mirrors the dashboard's other flat search columns
-- (client_name, sender_name) so search covers email without parsing JSON.
-- Apply in the Supabase dashboard SQL editor (or `supabase db push`).

alter table public.invoices
  add column if not exists archived boolean not null default false,
  add column if not exists client_email text not null default '';

comment on column public.invoices.archived is 'Hidden from the main list until restored. Deleting still removes the row.';
comment on column public.invoices.client_email is 'Lowered copy of the recipient email, for dashboard search.';

-- Backfill the search column from the stored documents.
update public.invoices
  set client_email = lower(coalesce(data -> 'recipient' ->> 'email', ''))
  where client_email = '';

-- Active-first listing support.
create index if not exists invoices_user_archived_updated_idx
  on public.invoices (user_id, archived, updated_at desc);
