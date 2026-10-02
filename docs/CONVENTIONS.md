# Conventions

These keep Aexo consistent as it grows. When in doubt, check
`Aexo_Design_Build_Guide.md`, then reuse an existing primitive before writing a new one.

## Components

- One component per file, named exports, kebab-case filenames (`icon-button.tsx`).
- Primitives in `src/components/ui/` are product-agnostic: no invoice logic, no data fetching.
- Every primitive accepts `className` and merges it with `cn()`, so callers can adjust
  layout (width, margin) without forking the component.
- Variants are plain typed maps (`Record<Variant, string>`). No variant library.
- Prefer native elements (`<button>`, `<select>`, `<dialog>`, `<input type="checkbox">`).
  They bring keyboard, focus and screen reader behaviour for free.
- Add `"use client"` only to components that need state, effects or event handlers.
- To make a link look like a button, use `buttonStyles()` on `next/link`. Don't nest a button in a link.
- Keep components small. When a file grows past about 150 lines, split it.

## Styling

- Only token classes. No hex values, no arbitrary colors (`bg-[#...]`), no new radii or shadows.
  The theme makes most of these impossible; the rest need review.
- Mobile-first: write the phone layout unprefixed, then add `md:` and `lg:`. Don't
  design for desktop and shrink.
- Page padding comes from `<Container>` (`px-gutter`), not hand-picked values.
- Coral (`accent`) is for small markers, selected states and template accents.
  Never for primary buttons or large areas.
- Flat by default. A surface gets either a border or a shadow, not both.
- No gradients, no glassmorphism, no weights above 500.

## Icons

- `lucide-react` only. Sizes come from `iconSize` (`sm` 16, `md` 20, `lg` 24); stroke from `iconStroke` (1.75).
- Icons are decorative by default (lucide sets `aria-hidden`).
- Icon-only controls use `<IconButton label="…">`; the label is required.
- Pair status icons with text. Never rely on an icon or color alone.

## Accessibility

Target: WCAG 2.2 AA.

- Every page renders `<main id="main">` for the skip link in the root layout.
- One `<h1>` per page; don't skip heading levels. `CardTitle`, `EmptyState` take an `as`/`titleAs` prop for this.
- Focus is always visible: a global 2px ink outline; form controls use the guide's ink border and soft ring.
- Touch targets are at least 44px. The small button and icon button grow on `pointer-coarse`.
- Respect `prefers-reduced-motion`. It's handled globally, so avoid motion that carries meaning on its own.
- Dialogs use `<Dialog>` (native `<dialog>`): focus trap, Escape and focus return are built in.
- Tooltips are supplementary only. Never put required information or interactive content in one.
- Status uses text plus a dot or icon, never color alone (see `Badge`).
- Don't rely on hover. Hover styles only apply on devices that can hover, so every state that
  matters (selected, pressed, error, success) must be visible without it.

### Contrast

The guide's Muted (#858481) and Error (#EF4343) are 3.7:1 on the canvas, below the 4.5:1 AA
minimum for text. Phase 1 added darker shades of the same hues for text:

| Use for                                | Token                         | Ratio on canvas |
| -------------------------------------- | ----------------------------- | --------------- |
| Body and heading text                  | `foreground`, `ink`           | 15.0:1          |
| Secondary text, hints, placeholders    | `muted` (#706F6C)             | 4.9:1           |
| Error text, filled destructive buttons | `error-strong` (#D12A2A)      | 5.0:1           |
| Icons, unchecked control outlines      | `muted-soft` (#858481, guide) | 3.7:1 (≥ 3:1)   |
| Error borders, status dots             | `error`, `success`, `warning` | non-text only   |
| Coral                                  | `accent`                      | never text      |

Input borders use the guide's `border-strong`, which is low contrast (1.35:1). Fields stay
identifiable through their visible labels; checkboxes, radios and switches use `muted-soft` outlines.

## Forms

```tsx
<Field label="Recipient email" required hint="We'll never share it." error={errors.email}>
  <Input type="email" autoComplete="email" inputMode="email" />
</Field>
```

- Always wrap controls in `<Field>`. It wires the label, `aria-describedby`, `aria-invalid` and `required`.
- Labels are always visible. Placeholders are examples, never labels.
- Error messages are human and say how to fix it: "Enter a valid email address." Never raw validation output.
- Validate on blur or submit, not on every keystroke. On submit, move focus to the first invalid field.
- Use the right `type`, `inputMode` and `autoComplete` so mobile keyboards and autofill help.
- Choices: `<Select>` for long lists, `<RadioGroup>` for 2–5 visible options, `<Checkbox>` for
  on/off confirmed by a submit button, `<Toggle>` for settings that apply immediately.
- Lay fields out with `<FieldGrid>` (one column on phones, two from 640px).
- Dates: `<DateInput>` (native picker on every platform, ISO value). Money: `<CurrencyInput>` with an
  explicit `locale` (avoids hydration mismatches); its value is a number or `null`.
- Plain numbers (quantity, %): `<NumberInput>` (value is a number or `null`; no `type="number"`).
- 2–3 short, mutually exclusive options shown side by side: `<SegmentedControl>`.
- Prefixes and suffixes (icon, %, unit) go in `Input`'s `leading` / `trailing` props, never as
  absolutely positioned siblings.
- Inputs use 16px text so iOS doesn't zoom on focus.

## Loading, empty and error states

| Situation                     | Use                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------- |
| Route is loading              | `loading.tsx` with `<LoadingState>` or a skeleton of the page                     |
| Content area is loading       | `<Skeleton>` shaped like the content; container gets `aria-busy`                  |
| Button action in progress     | `<Button loading>` (keeps width, blocks repeat clicks)                            |
| Nothing to show yet           | `<EmptyState>`: what's missing plus one next action                               |
| Something failed in a section | `<ErrorState>` with a recovery action                                             |
| Whole route failed            | `error.tsx` (uses `retry()`)                                                      |
| Quick confirmation            | `useToast()`: "Invoice saved." / "Could not save invoice. Try again."             |
| Feedback inside a dialog      | Inline: `Button successLabel`, `FieldError`. Toasts wait until the dialog closes. |

Loading indicators are pulsing dots, not spinners (the guide avoids spinning UI).
Copy is short, calm and human (guide §21–23).

## Naming & files

- Components `PascalCase`, hooks `useCamelCase`, files `kebab-case`.
- Routes and URLs come from `config/routes.ts`.
- Environment access only through `lib/env.ts`.

## Before you open a PR

`npm run check` (type-check, lint, format) and `npm run build` must pass. Then check the
change at 375, 768, 1024 and 1440px.

## Overlays

| Need                            | Component                                                                 |
| ------------------------------- | ------------------------------------------------------------------------- |
| A list of actions for one thing | `<Menu>`: dropdown from 640px, bottom sheet on phones                     |
| Confirmation                    | `<Dialog size="sm">` (bottom sheet on phones)                             |
| A form in an overlay            | `<Dialog mobile="fullscreen">` (header and footer stay put, body scrolls) |
| A hint for an icon-only control | `<Tooltip>` (mouse hover and keyboard focus only)                         |
| Short feedback after an action  | `useToast()`                                                              |

- Menus, tooltips and toasts use the native popover API (top layer): never clipped by `overflow`,
  no z-index juggling.
- A Menu trigger can't also be a Tooltip trigger. Use a visible label or `aria-label` instead.
- Open modals announce themselves (`aexo:modal-change`); the toast region holds toasts until they close.

## Tables

Use `<DataTable>` for row data. Mark the main column `primary`. Below 768px rows become
stacked label/value blocks, so no column is hidden on small screens.
