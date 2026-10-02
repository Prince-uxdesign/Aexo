# Aexo

Make an invoice. Send it. Done.

Aexo is an invoice generator: create a professional invoice without an account, then
preview, download, print, share or email it. An account is only needed to save and manage invoices.

## Getting started

Requires Node 20.9+.

```bash
npm install
cp .env.example .env.local   # Supabase keys are optional for now
npm run dev                  # http://localhost:3000
```

In development, `/foundation` shows every design token and UI primitive.

## Scripts

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the dev server                       |
| `npm run build`     | Production build                           |
| `npm run start`     | Serve the production build                 |
| `npm run typecheck` | Generate route types and run `tsc`         |
| `npm run lint`      | ESLint                                     |
| `npm run format`    | Prettier (also sorts Tailwind classes)     |
| `npm run check`     | Type-check, lint and format check together |

## Docs

- [`Aexo_Design_Build_Guide.md`](./Aexo_Design_Build_Guide.md): design and product source of truth
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): stack, structure, tokens, routes
- [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md): components, accessibility, forms, states
