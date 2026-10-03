# Handover: connect Aexo to its new Supabase project and finish QA

You are continuing work on **Aexo**, a Next.js 16 + Supabase invoice generator in this
repository. Read `CLAUDE.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md` and
`docs/AUTH.md` before changing code.

## Context

- Aexo previously pointed at the wrong Supabase project (one that belongs to another app,
  Vurlo). That link has been removed. A **new, empty Supabase project for Aexo** now exists.
  Do not reuse or touch any other Supabase project.
- `.env.local` has empty `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `RESEND_API_KEY` and `EMAIL_FROM`.
- All app code for auth, saving, sharing, email and dashboard management is written. The work
  left is connecting the database, verifying it, and QA in real browsers.
- Uncommitted changes in the working tree (keep them): the finish dialog in
  `src/features/invoice/workspace/` now saves an existing record when editing ("Save and
  open") instead of creating a duplicate, plus updated copy and `docs/AUTH.md`.

## Rules

- Never put the secret/service-role key in a `NEXT_PUBLIC_` variable or in any committed file.
- `.env.local` is gitignored. Never commit it.
- Don't edit existing migration files. If the schema needs a change, add a new migration with a
  later timestamp.
- Before saying any code task is done, run `npm run check`, `npm test` and `npm run build`. All
  three must pass.
- Commit only when Prince asks. If anything fails, report the exact error output; don't hide it.

---

## Part A: steps Prince does in the Supabase dashboard

The agent cannot do these. Ask Prince to confirm each one is done before moving on.

1. **Keys.** Project Settings → API Keys. Copy the Project URL and the publishable key
   (`sb_publishable_…`) into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
2. **Migrations.** In the SQL Editor, paste and run each file from `supabase/migrations/`,
   one at a time, **in this order**. Each must finish with "Success":
   1. `20261002120000_profiles.sql`
   2. `20261002130000_invoices.sql`
   3. `20261002150000_invoice_sharing.sql`
   4. `20261002160000_shared_invoice_rpc.sql`
   5. `20261002170000_invoice_emails.sql`
   6. `20261002180000_invoice_management.sql`

   On an empty project none of them should fail. If one does, stop and report the error.
   Don't skip ahead: later files depend on earlier ones.

3. **Auth settings** (details in `docs/AUTH.md` steps 3–7):
   - Authentication → URL Configuration → Redirect URLs: add `http://localhost:3000/**`.
   - Authentication → Providers → Email → Minimum password length: `8`.
   - Optional: change the email templates so links work in any browser (`docs/AUTH.md` step 6).
4. **Resend (for email sending).** Create an API key at https://resend.com/api-keys and set
   `RESEND_API_KEY` in `.env.local`. Leave `EMAIL_FROM` empty for now. Without a verified
   domain, Resend only delivers to Prince's own Resend account email, so use that address as
   the test recipient.
5. Restart `npm run dev` after editing `.env.local`.

---

## Part B: verify the database (agent, with Prince running SQL)

Ask Prince to run this in the SQL Editor and paste the result. Check it against the expected
output.

```sql
-- 1. Tables exist and RLS is on (expect 3 rows, all rowsecurity = true)
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('profiles', 'invoices', 'invoice_emails');

-- 2. Policies (expect: profiles 2, invoices 4, invoice_emails 2;
--    NO policy named "Anyone can view actively shared invoices")
select tablename, policyname, cmd, roles from pg_policies
where schemaname = 'public' order by tablename, policyname;

-- 3. anon has no direct access to invoices or invoice_emails (expect 0 rows)
select table_name, privilege_type from information_schema.role_table_grants
where grantee = 'anon' and table_schema = 'public'
  and table_name in ('invoices', 'invoice_emails');

-- 4. The share RPC exists and anon may execute it (expect true)
select has_function_privilege('anon', 'public.get_shared_invoice(uuid)', 'execute');

-- 5. The sign-up trigger function is NOT callable by API roles (expect false, false)
select has_function_privilege('anon', 'public.handle_new_user()', 'execute'),
       has_function_privilege('authenticated', 'public.handle_new_user()', 'execute');
```

Also ask Prince to open **Advisors → Security Advisor** and share any warnings. Fix real
issues with a new migration, and report them to Prince first.

## Part C: generate database types (agent)

1. Run `npx supabase login` (Prince approves in the browser), then:
   ```
   npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/database.types.ts
   ```
2. Pass the generic into all three clients: `createBrowserClient<Database>(...)` in
   `src/lib/supabase/client.ts`, and `createServerClient<Database>(...)` in
   `src/lib/supabase/server.ts` and `src/lib/supabase/proxy.ts`. `client.ts` already has a
   comment describing this.
3. Fix any type errors this surfaces properly. Don't silence them with `any` or casts.
4. Run `npm run check`, `npm test` and `npm run build`.

## Part D: seed QA data (Prince in the browser, agent guiding)

Create two accounts: **User A** (main) and **User B** (for the cross-account checks).
In User A, create:

- invoices in every status: draft, sent, paid, overdue and cancelled
- one archived invoice
- one invoice with sharing enabled
- one invoice that has been emailed
- one invoice with a logo, and one with 50+ line items on the Compact template
- at least one invoice in each of the 4 templates

## Part E: end-to-end checklist (Prince runs it, agent fixes bugs)

For every failure, write down the steps, the expected result and what actually happened, then
fix it in code. Retest after each fix.

**Auth**

- [ ] Sign up → confirmation email → link signs in → lands on `/dashboard`
- [ ] Password reset email → set new password → signed in
- [ ] Signed out on `/create` → fill invoice → Save → sign up → returns to the creator with
      the draft intact
- [ ] Log out → log back in → data still there

**Invoices**

- [ ] Create → save → refresh → reopen → edit → auto-save (wait, refresh, the edit survived)
- [ ] Edit a saved invoice → Finish → "Save and open" updates that invoice and opens it; no
      duplicate appears in the dashboard
- [ ] Duplicate (from the detail page and from the dashboard): the copy's number ends in
      " (copy)"
- [ ] Change status; delete single; bulk delete (the count in the confirm dialog is correct)
- [ ] Archive and restore, single and bulk; archived invoices are hidden from the main list
- [ ] Search by client name, sender and client email; every filter; all 5 sorts
- [ ] Logo: PNG, JPG, WebP, SVG; replace; remove; wrong type, corrupt file and an 8 MB+ file
      are rejected with a clear message; very wide and very tall logos

**Sharing (open links in a private/incognito window)**

- [ ] Enable sharing → open `/i/<token>` signed out → the correct invoice shows
- [ ] Edit the invoice → reload the link → shows the new data
- [ ] Disable sharing → the link shows the generic "not available" message
- [ ] Delete the invoice → its old link shows the same generic message
- [ ] Made-up token → the same generic message
- [ ] All 4 templates, with and without a logo

**Security (run while signed in as User B)**

- [ ] Open User A's `/invoices/<id>` and `/invoices/<id>/edit` → 404, nothing of A's leaks
- [ ] In the browser console on the site, using the publishable key, a direct
      `select * from invoices` and `select * from invoice_emails` as anon return nothing; the
      `get_shared_invoice` RPC returns only the one invoice for its exact token

**Email (Resend)**

- [ ] Send to Prince's Resend account email → it arrives, the link works, a row appears in
      `invoice_emails` with status `sent`
- [ ] Missing or invalid recipient → clear inline error, nothing sent
- [ ] Sending an invoice whose sharing is off turns sharing on automatically
- [ ] Remove `RESEND_API_KEY` and restart → the dialog explains what's missing; a failure is
      recorded as `failed`
- [ ] The recent-sends list on the invoice shows the history

**Print / PDF**

- [ ] Print and Save as PDF from `/invoices/<id>/print` and from the share page, for each
      template. Compare to the screen: nothing cut off; the 50-item Compact invoice breaks
      pages cleanly, repeats the table header and keeps the totals together

**Responsive and browsers**

- [ ] Widths 375, 390, 430, 768, 1024, 1280, 1440: dashboard (2-column cards at 1024–1279,
      table from 1280), invoice detail, edit workspace, share page, send dialog, menus
- [ ] Landscape phone (~667×375): dialogs and menus scroll inside themselves
- [ ] Real iPhone Safari and Android Chrome: touch, keyboard covering inputs, date pickers,
      bottom sheets, notch safe areas
- [ ] Desktop Safari and Firefox

**Accessibility**

- [ ] Keyboard only: skip link works, focus stays inside open dialogs and menus, Esc closes
      them, focus returns to the button that opened them
- [ ] VoiceOver (macOS/iOS): the results count, toasts and send states are announced

---

## Decisions waiting on Prince (don't change these without asking)

- Duplicate on the detail page opens the copy for editing; on the dashboard it stays on the
  list with a toast. This is currently intentional.
- No PDF attached to emails; the secure share link is how recipients access the invoice.
- Duplicated invoice numbers get " (copy)" appended.
- Invalid, disabled and deleted share links all show one generic message, so links can't be
  probed.

## Known gaps (not bugs, future work)

- No server-side PDF generation (browser Save as PDF only).
- Logos are stored as data URLs inside the invoice JSON, not in Supabase Storage.
- No share-token rotation (only on/off).
- Two tabs editing the same invoice: the last save wins silently.
- No unit tests yet for the canvas logo downscale, the `useAutoSave` hook or the server
  actions against a real database.
