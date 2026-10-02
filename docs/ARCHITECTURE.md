# Architecture

Visual and product source of truth: [`Aexo_Design_Build_Guide.md`](../Aexo_Design_Build_Guide.md).
Coding conventions: [`CONVENTIONS.md`](./CONVENTIONS.md).

## Stack

| Concern    | Choice                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)                        |
| Styling    | Tailwind CSS v4: tokens live in `src/app/globals.css` (`@theme`), no `tailwind.config`   |
| Icons      | `lucide-react`                                                                           |
| Class util | `clsx` + `tailwind-merge`, wrapped as `cn()` in `src/lib/utils/cn.ts`                    |
| Backend    | Supabase (`@supabase/ssr`) for auth, database and storage, client factories only for now |
| Quality    | ESLint (next config), Prettier with Tailwind class sorting, `npm run check`              |

## Folder structure

```
src/
  app/                    Routes only. Pages compose components; they hold little logic.
    layout.tsx            Root: Inter font, metadata, skip link, ToastProvider
    (marketing)/          Landing page: layout (header + footer), page, _components/ sections
    icon.svg              Favicon (the Aexo mark)
    loading.tsx           Root loading state
    error.tsx             Route error boundary (receives `retry`, not `reset`, in Next 16)
    global-error.tsx      Fallback when the root layout itself fails
    not-found.tsx         404
    foundation/           Dev-only tokens, primitives and full-page templates (404 in production)
  components/
    ui/                   Design-system primitives. Product-agnostic. Import via "@/components/ui".
    layout/               Page structure (Container; later: AppHeader, ActionBar)
    brand/                Logo and LogoMark
  features/
    invoice/
      model/              Invoice types, totals (subtotal → discount → tax), sample data. Pure TS.
      templates/          Classic, Modern, Accent, Compact + shared parts. Presentation only.
      components/         InvoiceDocument: any template on scalable paper
      draft/              The in-progress invoice kept on this device (localStorage)
      form/               Invoice form: values, mapping, validation, store, sections/
      workspace/          The /create screen: layout, preview pane, action bar, full preview
  config/
    routes.ts             Every URL, including planned ones. Never hardcode paths.
    site.ts               Name, tagline, description
  lib/
    env.ts                The only place that reads process.env
    supabase/client.ts    Browser client (Client Components)
    supabase/server.ts    Server client (Server Components, Actions, Route Handlers)
    format/               currency.ts (Intl money parsing/formatting), date.ts (timezone-safe dates)
    utils/cn.ts           Class merging that understands Aexo token names
    utils/position.ts     Viewport-safe positioning for menus and tooltips
```

### Where future code goes

| Code                                    | Location                                                 |
| --------------------------------------- | -------------------------------------------------------- |
| Invoice form sections                   | `src/features/invoice/form/sections/`                    |
| New invoice fields                      | `model/types.ts` first, then `templates/parts.tsx`       |
| Feature-specific hooks / server actions | inside the feature folder                                |
| Shared primitives                       | `src/components/ui/` only if reusable across features    |
| Route-only components                   | `_components/` next to the route (private, not routable) |

The guide requires the data model to stay separate from templates (§25). Templates
change presentation only and must render any valid invoice.

## Route map

`(marketing)` (Phase 2), `(auth)` and `(app)/account` (Phase 3) and `(create)/create` (Phase 4) are built. See docs/AUTH.md.
The rest are added in later phases. Paths are already in `src/config/routes.ts`. Route groups in
parentheses don't affect URLs; they let each area have its own layout.

```
app/
  (marketing)/page.tsx            /                 landing (built)
  (create)/create/page.tsx        /create           invoice creator, no account needed (built)
  (public)/i/[shareId]/page.tsx   /i/:shareId       shareable invoice link (built, Phase 9: noindex, live data)
  (auth)/sign-in, sign-up, …      /sign-in …        authentication (built)
  auth/confirm/route.ts           /auth/confirm     email link handler (built)
  (app)/account                   /account          profile (built), protected
  (app)/dashboard                 /dashboard        overview stats, drafts spotlight, search, filter, cards/table (built), protected
  (app)/invoices                  /invoices         redirects to /dashboard (built), protected
  (app)/invoices/[id]             /invoices/:id     detail view: status, facts, actions, document (built), protected
  (app)/invoices/[id]/edit       /invoices/:id/edit editor for a saved invoice (built), protected
  (app)/invoices/[id]/print      /invoices/:id/print print view of the same document; browser dialog prints or saves PDF (built), protected
```

## Design tokens

All tokens are defined once in `src/app/globals.css`. Tailwind's default colors, font
sizes, weights, radii and shadows are **cleared**, so only Aexo values exist as classes.
For example `bg-blue-500` or `font-bold` simply don't compile.

| Token group | Classes                                                                                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color       | `canvas surface surface-alt paper ink foreground muted muted-soft border border-strong accent accent-hover accent-pressed success warning error error-strong`. Text uses `foreground`, `ink`, `muted` or `error-strong` only (see Contrast in CONVENTIONS.md). |
| Type        | `text-display text-h1 text-h2 text-h3 text-body-lg text-body text-label text-caption text-button` (size, line height, weight and tracking in one class)                                                                                                        |
| Weight      | `font-normal` (400), `font-medium` (500). Nothing heavier.                                                                                                                                                                                                     |
| Radius      | `rounded-xs` 6 · `sm` 8 · `md` 12 (inputs) · `lg` 16 (cards) · `xl` 24 (panels) · `pill` (buttons)                                                                                                                                                             |
| Shadow      | `shadow-control`, `shadow-elevated`, `shadow-focus`, `shadow-focus-error`                                                                                                                                                                                      |
| Spacing     | 4px base (`p-4` = 16px). Use the guide scale: 1 2 3 4 6 8 10 12 16 20 24 30.                                                                                                                                                                                   |
| Layout      | `px-gutter` (16→20→24→32), `py-section` (48→64→96), `p-card` (24→32), `h-header` (64)                                                                                                                                                                          |
| Width       | `max-w-page` (1440), `max-w-reading` (640)                                                                                                                                                                                                                     |
| Motion      | `ease-standard`, durations `duration-150/200/250`. Reduced motion is respected globally.                                                                                                                                                                       |

Display, H1 and H2 scale fluidly on small screens and reach the guide's sizes at
tablet/desktop. The guide's 56px display doesn't fit a 375px phone.

### Breakpoints (mobile-first)

| Prefix | Min width | Meaning                              |
| ------ | --------- | ------------------------------------ |
| (none) | 0         | Mobile, the default                  |
| `sm:`  | 640       | Large phones / small tablets         |
| `md:`  | 768       | Tablet                               |
| `lg:`  | 1024      | Desktop: form + preview side by side |
| `xl:`  | 1280      |                                      |
| `2xl:` | 1440      |                                      |
| `3xl:` | 1920      |                                      |

Use `pointer-coarse:` for touch-specific sizing (it's how the small button keeps a 44px target on touch screens).

## Environment

`.env.example` lists every variable. Copy it to `.env.local`. All reads go through
`src/lib/env.ts`. Supabase keys are optional until a feature needs them;
`getSupabaseConfig()` throws a clear message if they're missing when a client is created.

## Supabase status

- Installed: `@supabase/supabase-js`, `@supabase/ssr`.
- Ready: `createClient()` for the browser and the server.
- Built: auth, `src/proxy.ts` session refresh, `profiles` table with RLS. See docs/AUTH.md.
- Built (Phase 7): `invoices` table with owner-only RLS (`supabase/migrations/20261002130000_invoices.sql`),
  `src/features/invoices/` (model, server queries, Server Actions). Run the migration in the
  Supabase dashboard SQL editor, then set the publishable key in `.env.local`.
- Built (Phase 9): sharing columns on `invoices` (`share_token` UUID default, `sharing_enabled`
  default off) plus an anon SELECT policy gated on `sharing_enabled`
  (`supabase/migrations/20261002150000_invoice_sharing.sql`). Public reads select the
  document columns only. Edits revalidate the public path, so links stay live.
- Hardened (Phase 15): public reads go through the `get_shared_invoice(uuid)`
  SECURITY DEFINER RPC (one exact token, document columns only) and the broad
  anon table access is revoked
  (`supabase/migrations/20261002160000_shared_invoice_rpc.sql`), so shared rows
  are no longer listable. Owners can rotate the token (`rotateShareToken`);
  database failures throw to the share route's error state instead of
  masquerading as broken links. The public page adds loading/error states and
  a Print / Save PDF action that prints the document only.
- Not yet: storage buckets, generated types.

## Invoice documents

An invoice renders through `<InvoiceDocument invoice={…} template?={…} aspect?={…} />`.

- The page is laid out on a 600-unit-wide grid. One unit (`--doc`) is `100cqw / 600`, so the
  whole document (text, spacing, rules) scales with its container. There's no JavaScript
  measuring and no layout shift, and the same template serves a 240px thumbnail, a large
  preview and, later, print and PDF.
- Inside a document, spacing utilities (`p-4`, `gap-2`) are in document units, and text uses the
  `text-doc-*` scale (`xs` 8.5 · `sm` 9.5 · `base` 11 · `md` 13 · `lg` 16 · `xl` 22 · `2xl` 34).
  Don't use the UI type scale inside documents.
- Give the wrapper a width; never set a font size on a document.
- `aspect="page"` (default) is A4 (1 : 1.414). A ratio like `"600 / 560"` crops to the top of the
  page for thumbnails.
- `overflow="grow"` (live previews) starts at one A4 page and lengthens with the content, so long
  item lists and notes are never cut off. `clip` (default) is for thumbnails.
- Templates must fit one page with the sample invoice. Check `/foundation` → Invoice templates
  after any template change. Page breaks for print/PDF come with export.

## Invoice creator (`/create`)

Four layers, each replaceable without touching the others:

| Layer      | Files                                       | Role                                                                                      |
| ---------- | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Form state | `form/form-values.ts`, `form/form-store.ts` | What the inputs hold (blank strings, `null` numbers). A small store with selector hooks.  |
| Mapping    | `form/form-mapping.ts`                      | `toInvoice` / `fromInvoice`. The only bridge between form values and the `Invoice` model. |
| UI         | `form/sections/*`, `form/form-field.tsx`    | One component per section. Each subscribes to its own slice, so typing re-renders little. |
| Preview    | `usePreviewInvoice()`, `workspace/*`        | A deferred `Invoice` snapshot rendered by any template. Templates never see form state.   |

Validation (`form/form-validation.ts`) is pure and keyed by field path (`sender.email`,
`items.<id>.name`). Errors show after a field is left, or all at once on "Finish invoice",
which also focuses the first invalid field.

Responsive behaviour:

| Width    | Layout                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------- |
| < 768    | One column. Sections, then a preview with total / due / client at full UI size, then a sticky action bar. |
| 768–1023 | Same flow in a centred 768px column; the preview at the end is ~670px and readable.                       |
| 1024+    | Form and sticky, independently scrolling preview side by side (≈46/54, 48/52 from 1280).                  |

Field grids and item editors respond to their section's width (container queries), not the
viewport, so the narrow desktop form column and a wide tablet column both lay out correctly.
The action bar is `sticky`, not `fixed`: it rests below the preview at the end of the page and
never covers the last fields. "Preview" opens a full-screen view with Fit / Actual size zoom.

Not built yet (and labelled as such in the UI): PDF download, print, share, email.
"Save draft" stores the invoice on this device and works without an account.
"Save invoice" (finish step) persists it to the account and opens the saved-invoice
editor; signed-out users are asked to sign up first and return to their invoice.
Both modes auto-save after a quiet window (device ~1.2s, record ~2.5s), flush when
the tab hides or the browser reconnects, and report Saving… / Saved / Unable in the
heading status line. The leave-page warning only appears with genuinely unsaved work.
