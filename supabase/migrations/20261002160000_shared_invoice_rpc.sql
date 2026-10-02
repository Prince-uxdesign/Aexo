-- Aexo: secure shareable invoice reads (Phase 15).
--
-- The Phase 9 policy let anon SELECT any row with sharing_enabled = true,
-- which technically allows listing every shared invoice. Public reads now go
-- through this SECURITY DEFINER function instead: it returns only the invoice
-- document columns for one exact token, and nothing else. Direct anon access
-- to the table is removed. Apply in the Supabase dashboard SQL editor
-- (or `supabase db push`).

create or replace function public.get_shared_invoice(p_token uuid)
returns table (number text, data jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select i.number, i.data
    from public.invoices as i
   where i.share_token = p_token
     and i.sharing_enabled = true
   limit 1;
$$;

comment on function public.get_shared_invoice(uuid) is
  'Public share-link read: one invoice document per exact token, nothing else.';

revoke all on function public.get_shared_invoice(uuid) from public;
grant execute on function public.get_shared_invoice(uuid) to anon, authenticated;

-- Close the broad Phase 9 access: anon can no longer scan shared rows.
drop policy if exists "Anyone can view actively shared invoices" on public.invoices;
revoke select on public.invoices from anon;
