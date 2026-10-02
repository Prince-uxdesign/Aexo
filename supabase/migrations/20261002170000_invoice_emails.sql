-- Aexo: invoice email history (Phase 16).
--
-- One row per send attempt, success or failure. Append-only: the app only
-- ever selects and inserts its own rows, so there are intentionally no update
-- or delete policies. `invoice_id` cascades so deleting an invoice removes
-- its history with it. Apply in the Supabase dashboard SQL editor
-- (or `supabase db push`).

create table if not exists public.invoice_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  recipient_email text not null default '',
  recipient_name text not null default '',
  subject text not null default '',
  status text not null default 'sent'
    check (status in ('sent', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

comment on table public.invoice_emails is 'Send attempts per invoice, newest last. Append-only.';

alter table public.invoice_emails enable row level security;

-- (select auth.uid()) is evaluated once per query instead of once per row.
create policy "Users can view their own email history"
  on public.invoice_emails for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can record their own email history"
  on public.invoice_emails for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on public.invoice_emails from anon;
revoke all on public.invoice_emails from authenticated;
grant select, insert on public.invoice_emails to authenticated;

-- Latest sends per invoice, newest first.
create index if not exists invoice_emails_user_invoice_created_idx
  on public.invoice_emails (user_id, invoice_id, created_at desc);
