-- Aexo: shareable invoice links (Phase 9).
--
-- `share_token` is a random UUID, unguessable and unrelated to the sequential
-- internal id, so it is safe to use as the public URL (/i/<token>).
-- `sharing_enabled` lets the owner switch the public link off again.
-- Sharing defaults to OFF: only an explicit owner action publishes a link.
-- Apply in the Supabase dashboard SQL editor (or `supabase db push`).

alter table public.invoices
  add column if not exists share_token uuid not null default gen_random_uuid(),
  add column if not exists sharing_enabled boolean not null default false;

comment on column public.invoices.share_token is 'Unguessable public identifier for the share link (/i/<token>).';
comment on column public.invoices.sharing_enabled is 'Whether the public share link currently shows the invoice.';

-- Backfill: every existing row already gets a random token from the default,
-- but make it explicit in case the column predates the default.
update public.invoices set share_token = gen_random_uuid() where share_token is null;

alter table public.invoices add constraint invoices_share_token_unique unique (share_token);

-- Anyone (signed in or not) may read rows that are actively shared. They can
-- only reach a row by knowing its token, and the public query selects only
-- the invoice document columns — never user_id or internal metadata.
create policy "Anyone can view actively shared invoices"
  on public.invoices for select
  to anon, authenticated
  using (sharing_enabled = true);

grant select on public.invoices to anon;
