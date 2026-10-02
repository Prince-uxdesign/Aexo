# Aexo — Design & Build Guide

Version: 1.0
Status: MVP
Product: Aexo
Purpose: Source of truth for Claude Code during design and implementation.

---

## 1. Product Direction

Aexo is a simple invoice generator for anyone who needs to create a professional invoice.

Core promise:

> Make an invoice. Send it. Done.

The product should feel fast, clear, professional, warm, and slightly premium.

Aexo should NOT feel like a complicated accounting platform.

The main experience is:

CREATE INVOICE
→ YOUR DETAILS
→ RECIPIENT DETAILS
→ INVOICE ITEMS
→ TAX / DISCOUNT
→ PAYMENT DETAILS
→ CHOOSE TEMPLATE
→ LIVE PREVIEW
→ SAVE / SHARE / DOWNLOAD / PRINT / EMAIL

Users can create an invoice without an account.

An account is required to save and manage invoices.

---

## 2. Reference Direction

Use two references:

1. Invoice generator screenshot supplied by the product owner.
   - Use it mainly for product structure and the form + live preview relationship.
   - Do not copy it literally.

2. Strawberry visual reference supplied by the product owner.
   - Use it for the warm canvas, restrained palette, rounded surfaces, typography philosophy, pill actions, subtle shadows, and calm visual hierarchy.
   - Do not copy Strawberry branding, illustrations, characters, logo, or proprietary identity.

Aexo should be an original product combining:
- Professional invoice-document UI
- Warm minimal SaaS visual language
- Strong whitespace
- Ink-black actions
- Restrained coral accents

---

# 3. Visual North Star

The interface should feel:

- Clean
- Professional
- Warm
- Fast
- Trustworthy
- Simple
- Modern
- Premium without being flashy

Core visual formula:

Warm off-white canvas
+
Ink-black primary actions
+
Cream surfaces
+
Subtle borders
+
Tiny coral accents
+
Generous whitespace

Avoid:
- Gradients
- Glassmorphism
- Heavy shadows
- Excessive decoration
- Huge colorful illustrations
- Overly bold typography
- Generic "AI SaaS" aesthetics

---

# 4. Color System

## Core

Canvas:
#FFFCFA

Surface:
#FFFEFE

Surface Alt:
#F7F2ED

Ink:
#252522

Body:
#252522

Muted:
#858481

Border:
#EFE6DC

Border Strong:
#E6DBD1

Accent / Coral:
#F2805D

Accent Hover:
#E97452

Accent Pressed:
#D96544

## Semantic

Success:
#22C55E

Warning:
#C8B828

Error:
#EF4343

## Rules

Ink is the primary action color.

Coral is a brand accent, not the main CTA color.

Use coral for:
- Small brand details
- Active indicators
- Selected states
- Template accents
- Micro-markers
- Small highlights

Do not make large page sections or primary buttons coral.

Do not introduce additional random colors.

---

# 5. Typography

Use Inter as the primary font.

Fallback:
Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

## Type Scale

Display:
56px / 500 / 1.1

H1:
40px / 500 / 1.15

H2:
28px / 500 / 1.25

H3:
20px / 500 / 1.35

Body Large:
18px / 400 / 1.5

Body:
16px / 400 / 1.5

Label:
14px / 500 / 1.4

Caption:
13px / 400 / 1.4

Button:
15px / 500 / 1.4

Use slightly negative letter spacing on large headings.

Avoid heavy 700/800 heading weights.

Hierarchy should come from size, spacing, and muted color rather than excessive font weight.

---

# 6. Radius

XS:
6px

SM:
8px

MD:
12px

LG:
16px

XL:
24px

Pill:
9999px

Usage:
- Inputs: 12px
- Cards: 16px
- Large panels: 20–24px
- Buttons: pill
- Icon buttons: circular
- Invoice document: 8–12px

The interface should feel rounded but still professional.

---

# 7. Spacing

Use an 8px rhythm with 4px increments where needed.

4
8
12
16
24
32
40
48
64
80
96
120

General:
- Component spacing: 8–24px
- Card padding: 24–32px
- Section spacing: 48–96px
- Desktop page gutter: approximately 32px
- Mobile page gutter: 16–20px

Do not compress layouts unnecessarily.

Whitespace is part of the visual identity.

---

# 8. Buttons

## Primary

Background:
#252522

Text:
#FFFCFA

Radius:
9999px

Height:
44–48px

Horizontal padding:
20–24px

Examples:
- Create Invoice
- Save Invoice
- Download PDF
- Send Invoice

Hover:
- Approximately 0.88 opacity
- Optional 1px upward movement
- Keep the same visual identity

Pressed:
- Slightly darker or approximately 0.8 opacity

## Secondary

Background:
#F7F2ED

Text:
#252522

Border:
#E6DBD1

Radius:
9999px

Use for:
- Save Draft
- Preview
- Duplicate
- Cancel
- Secondary actions

## Ghost

Transparent background.

Use for:
- Back
- Edit
- Delete
- Navigation
- Low-priority actions

## Destructive

Text:
#EF4343

Normally transparent.

Use filled destructive buttons only in confirmation dialogs.

---

# 9. Inputs

Inputs are a major part of the product.

Default:

Height:
46–50px

Background:
#FFFEFE

Border:
#E6DBD1

Radius:
12px

Padding:
12px 14px

Font:
15–16px

Focus:
- Border becomes #252522
- Use a subtle focus ring such as 0 0 0 3px rgba(37,37,34,0.08)

Labels:
14px / 500

Helper text:
13px / 400 / #858481

Required fields should use a small, restrained indicator.

Inputs should feel comfortable and obvious.

---

# 10. Main Application Layout

Desktop should use a workspace layout with the invoice form and live preview side by side.

Approximate structure:

Top navigation
↓
Page title + actions
↓
Form + Live Preview

The form and preview should feel like parts of the same workspace.

Recommended desktop proportions:
- Form: approximately 48%
- Preview: approximately 52%

The preview should remain visually important.

Do not bury it below the form on desktop.

---

# 11. Invoice Form Structure

The form should be divided into clear sections:

1. Business / Sender Details
2. Recipient Details
3. Invoice Details
4. Items
5. Discount
6. Tax
7. Payment Details
8. Notes
9. Template

Each section should be easy to scan.

Use progressive grouping rather than one giant form.

### Invoice details

Include:
- Invoice number
- Issue date
- Due date
- Payment terms

### Items

Each item should support:
- Item/service name
- Description where appropriate
- Quantity
- Unit
- Unit price
- Amount

Users can:
- Add item
- Remove item
- Edit item

Amounts should calculate automatically.

### Totals

Show:
- Subtotal
- Discount
- Tax
- Total

Total should be visually prominent.

---

# 12. Live Invoice Preview

The preview is one of the most important product surfaces.

It should look like a real professional document, not another dashboard card.

Document:
- White background
- 8–12px radius
- Very subtle shadow
- 40–56px internal desktop padding
- Responsive padding on smaller screens

Suggested structure:

LOGO / BUSINESS NAME

INVOICE
Invoice Number

From                         Bill To
Sender                       Recipient
Address                      Address
Email                        Email

Issue Date
Due Date
Payment Terms

--------------------------------

Item | Qty | Price | Amount

--------------------------------

Subtotal
Discount
Tax
TOTAL

Payment Details

Notes

The invoice should be print-friendly.

Do not put excessive rounded cards inside the invoice itself.

The document should feel like a professional business document.

---

# 13. Invoice Templates

MVP should support multiple templates.

## Template 01 — Classic

- Simple black typography
- Minimal lines
- Balanced spacing
- Very professional
- Default template

## Template 02 — Modern

- Larger invoice number
- More whitespace
- Minimal borders
- Stronger typographic hierarchy

## Template 03 — Accent

- Small coral details
- Coral section marker or line
- Still restrained

## Template 04 — Compact

- Designed for invoices with many line items
- More information density
- Smaller spacing
- Still readable

All templates must:
- Print correctly
- Export correctly
- Remain professional
- Use the same invoice data model
- Be responsive

Templates should change presentation, not the underlying invoice information.

---

# 14. Navigation

Desktop navigation should be simple.

Example:

Aexo

Dashboard
Invoices
Templates

Create Invoice

Profile

Header height:
64px

Background:
#FFFCFA

Avoid oversized navigation.

On mobile, collapse navigation into a simple menu.

---

# 15. Landing Page

The landing page should communicate the product immediately.

Hero direction:

Headline:
Create professional invoices in minutes.

Supporting copy:
Add your details, customize your invoice, and send it wherever you need.

Primary action:
Create an Invoice

The main visual should be an actual beautiful invoice preview.

Avoid generic stock imagery or abstract SaaS illustrations.

---

# 16. Account Flow

Creating an invoice does NOT require an account.

Users can:
- Create invoice
- Preview invoice
- Download
- Print
- Share where supported

When a user wants to save/manage invoices:

Prompt:
Create a free account to save and manage your invoices.

Account users can:
- Save invoices
- View previous invoices
- Edit invoices
- Duplicate invoices
- Manage invoice status
- Access shareable invoice links

Do not block first-time creation behind registration.

---

# 17. Core MVP Features

The MVP should support:

- Invoice creation
- Sender details
- Recipient details
- Invoice number
- Dates
- Payment terms
- Line items
- Tax
- Discount
- Currency selection
- Payment/bank details
- Notes
- Logo upload
- Multiple invoice templates
- Live preview
- PDF download
- Print
- Shareable invoice link
- Email invoice
- Save invoice
- Invoice management

Account required only for persistent saving/management.

---

# 18. Responsive Behavior

Mobile and tablet are first-class requirements.

## Desktop

1024px+:
- Full navigation
- Form + preview side by side
- Larger spacing
- Full template selector

## Tablet

768px–1023px:
- Preserve two-column layout only if both columns remain usable
- Otherwise stack
- Reduce card padding
- Maintain readable preview

## Mobile

Below 768px:
- Stack form and preview
- Simplify navigation
- Use 16–20px page gutters
- Keep touch targets at least 44px
- Use sticky bottom actions when useful

Mobile flow:

Form
↓
Preview
↓
Actions

Do not simply shrink the desktop layout.

The invoice document itself should maintain its document proportions inside a controlled preview area.

---

# 19. Motion

Motion should communicate state, not decorate the interface.

Recommended duration:
150–250ms

Use:
- Small translate
- Small scale
- Opacity
- Smooth preview updates
- Modal transitions
- Template transitions
- Toast appearance

Avoid:
- Large parallax
- Spinning UI
- Excessive bounce
- Dramatic page transitions

Aexo should feel fast.

---

# 20. Shadows and Elevation

The product is mostly flat.

Default cards:
- No heavy shadow

Elevated surfaces:
0 6px 24px rgba(0,0,0,0.05)

Small controls:
0 1px 3px rgba(0,0,0,0.10)

Use shadows sparingly.

Do not stack shadows and borders everywhere.

---

# 21. UI States

Every interactive component should account for:

- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Success
- Error

Forms should have clear validation messages.

Errors should be useful and human.

Avoid technical error messages.

Example:

Bad:
"ValidationError: invoice.customer.email invalid"

Good:
"Enter a valid email address."

---

# 22. Empty States

Keep empty states simple.

Example invoice list:

No invoices yet.

Create your first invoice and it will appear here.

[Create Invoice]

Do not use giant illustrations unless they genuinely help.

---

# 23. Toasts and Feedback

Use small, unobtrusive feedback.

Examples:

Invoice saved.

PDF ready.

Invoice link copied.

Email sent.

Could not save invoice. Try again.

Use success green only where it adds clarity.

---

# 24. Design Principles

1. The invoice is the hero.
2. Make the next action obvious.
3. Keep the interface calm.
4. Use spacing instead of decoration.
5. Use color sparingly.
6. Never sacrifice document readability for visual effects.
7. Make first-time invoice creation frictionless.
8. Mobile is not an afterthought.
9. Every feature should earn its place.
10. Professional does not mean boring.

---

# 25. Claude Code Implementation Rules

Treat this document as the visual source of truth.

Before creating new UI patterns:
- Check whether an existing pattern can be reused.
- Do not invent new colors without a strong reason.
- Do not introduce gradients.
- Do not introduce arbitrary font weights.
- Do not create random border radii.
- Do not add unnecessary shadows.
- Do not create inconsistent button styles.

Build reusable components for:
- Buttons
- Inputs
- Selects
- Date fields
- Form sections
- Invoice item rows
- Totals
- Cards
- Modals
- Toasts
- Template selector
- Invoice preview
- Navigation
- Responsive action bars

Keep the data model separate from the visual invoice templates.

The same invoice data must render through every template.

---

# 26. Quality Checklist

Before considering a screen complete, check:

### Visual
- Correct warm canvas
- Correct ink primary actions
- Coral used sparingly
- Consistent typography
- Consistent spacing
- Correct radius system
- No unnecessary shadows
- No gradients

### UX
- Clear hierarchy
- Obvious primary action
- Useful validation
- No unnecessary steps
- Good empty states
- Good loading states
- Good error states

### Responsive
- Test mobile
- Test tablet
- Test desktop
- Check long business names
- Check long recipient names
- Check many invoice items
- Check long notes
- Check large totals
- Check small screens

### Invoice
- Printable
- PDF-friendly
- Correct calculations
- Correct currency formatting
- Logo remains clear
- Tables do not break
- Totals remain visible
- Templates remain professional

---

# 27. Final Design Rule

When deciding between two designs, prefer the one that makes this sentence more true:

> "I can create and send a professional invoice without thinking about how the software works."

Aexo should feel obvious.
