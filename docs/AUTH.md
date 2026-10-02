# Authentication

Aexo uses Supabase Auth (email + password) with server-side sessions in cookies
(`@supabase/ssr`). Creating an invoice never needs an account (guide §16); an
account is for saving and managing invoices.

## One-time Supabase setup

Project: `xoznedkbkcicdfcwwvdi`

1. **Keys.** In `.env.local` set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Project Settings →
   API Keys → Publishable key, `sb_publishable_…`). The URL is already set. Never put the
   secret/service-role key in a `NEXT_PUBLIC_` variable.
2. **Database.** Run `supabase/migrations/20261002120000_profiles.sql` (SQL Editor → paste →
   Run). It creates `public.profiles`, Row Level Security, and the sign-up trigger.
3. **Redirect URLs.** Authentication → URL Configuration:
   - Site URL: your production URL (e.g. `https://aexo.app`).
   - Redirect URLs: add `http://localhost:3000/**` and `https://<your-domain>/**`.
     Email links are rejected for any URL not on this list.
4. **Password length.** Authentication → Providers → Email → Minimum password length: `8`
   (matches the form's check).
5. **Email confirmation** (Authentication → Providers → Email → Confirm email). Either works:
   - On (recommended): sign-up shows "Check your email"; the link confirms and signs in.
   - Off: sign-up signs in immediately.
6. **Optional: links that work in any browser.** Default emails use PKCE links, which must be
   opened in the browser that requested them. To make them work anywhere, change the
   templates (Authentication → Email Templates):
   - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}`
   - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`

   `/auth/confirm` handles both formats.

7. **Production email.** Supabase's built-in email sender is rate-limited and meant for
   testing. Configure custom SMTP before launch (Authentication → SMTP Settings).

## How it fits together

| Piece                       | File                                        | Role                                                                                      |
| --------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Session refresh + redirects | `src/proxy.ts`, `src/lib/supabase/proxy.ts` | Refreshes auth cookies on every request; optimistic redirects. Not the security boundary. |
| Data Access Layer           | `src/lib/auth/session.ts` (`server-only`)   | `getUserId`, `requireUserId`, `getAccountUser`. Verifies the JWT on the server.           |
| Server Actions              | `src/lib/auth/actions.ts`                   | Sign in/up/out, reset, update password, update profile. Validate input server-side.       |
| Email link handler          | `src/app/auth/confirm/route.ts`             | Exchanges `code` or verifies `token_hash`, then continues to `next`.                      |
| Protected area              | `src/app/(app)/layout.tsx`                  | `requireUserId()` on the server for every page in the group.                              |
| Authorization               | Postgres RLS                                | Users read/update only their own rows. Column grants limit what they can change.          |
| Client auth state (UI only) | `src/lib/auth/use-auth.ts`                  | "Sign in" vs "Your account", save gate. Never used for security decisions.                |
| Messages                    | `src/lib/auth/errors.ts`                    | Maps Supabase error codes to human text; raw errors only go to server logs.               |

Defence in depth: proxy redirect → server check in the layout → RLS in the database. A
new protected area needs its prefix added to `protectedPrefixes` in `src/config/routes.ts`
and its pages placed in the `(app)` group.

### Redirects after sign-in

`?next=` carries people back to where they were (e.g. `/create` after "Save invoice").
Every `next` passes through `safeNextPath`, which only allows same-site paths and so
blocks open redirects.

## Flows

- **Sign up** → (confirmation email) → `/auth/confirm` → `next` (default `/account`).
  An existing email gets "This email is already associated with an account."
- **Sign in** → `next`.
- **Forgot password** → always "Check your email" (doesn't reveal whether an account exists)
  → link → `/auth/confirm` → `/reset-password` → `/account?updated=password`.
- **Sign out** → `/`. Works without JavaScript (it's a form).
- **Save while signed out** (`SaveInvoiceButton`) → prompt "Create a free account to save and
  manage your invoices." → draft stored on this device (`features/invoice/draft`) →
  sign-up/in with `next` back to the creator, which restores the draft.

## Security notes

- Only the publishable key is used in the app. It is designed to be public; RLS protects data.
- `getClaims()` (signature-verified) is used for identity; `getSession()` is never trusted on the server.
- Auth email links only go to allow-listed URLs (Supabase) and same-site paths (`safeNextPath`).
- Server Actions get Next.js's built-in CSRF protection (Origin check).
- Drafts in `localStorage` stay on the device and are cleared by the creator after saving.
