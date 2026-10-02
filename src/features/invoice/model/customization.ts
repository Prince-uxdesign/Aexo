import type { AccentId, Invoice, InvoiceCustomization, InvoiceFontId } from "./types";

export type { AccentId, InvoiceCustomization, InvoiceFontId };

/**
 * PHASE 6 — Template customization.
 *
 * Pure data + tiny resolvers: no React, no DOM. Templates read the resolved
 * customization; the form edits it; changing it never touches calculations,
 * parties, items, payment data or notes — presentation only.
 *
 * Kept deliberately small: one accent (curated set), one title, two fonts,
 * two visibility switches, one footer line. Not a design tool.
 */

export const DEFAULT_INVOICE_TITLE = "Invoice";

export const DEFAULT_CUSTOMIZATION: InvoiceCustomization = {
  accent: "coral",
  title: DEFAULT_INVOICE_TITLE,
  font: "sans",
  showPayment: true,
  showNotes: true,
  footerText: undefined,
};

export type ResolvedCustomization = {
  accent: AccentId;
  title: string;
  font: InvoiceFontId;
  showPayment: boolean;
  showNotes: boolean;
  footerText?: string;
};

/** Fill every gap (old drafts, hand-edited data) so templates never branch. */
export function resolveCustomization(
  invoice: Pick<Invoice, "customization">,
): ResolvedCustomization {
  const custom = invoice.customization;
  const title = custom?.title?.trim() || DEFAULT_INVOICE_TITLE;
  const footerText = custom?.footerText?.trim() || undefined;
  return {
    accent: isAccentId(custom?.accent) ? custom.accent : DEFAULT_CUSTOMIZATION.accent,
    title,
    font: custom?.font === "serif" ? "serif" : "sans",
    showPayment: custom?.showPayment ?? true,
    showNotes: custom?.showNotes ?? true,
    footerText,
  };
}

function isAccentId(value: unknown): value is AccentId {
  return value === "coral" || value === "ink" || value === "pine" || value === "harbor";
}

/* ------------------------------------------------------------ Accents */

export const ACCENTS: { id: AccentId; name: string; swatchClass: string }[] = [
  { id: "coral", name: "Coral", swatchClass: "bg-accent" },
  { id: "ink", name: "Ink", swatchClass: "bg-ink" },
  { id: "pine", name: "Pine", swatchClass: "bg-pine" },
  { id: "harbor", name: "Harbor", swatchClass: "bg-harbor" },
];

export type AccentClasses = {
  /** Solid fill: top rules, section markers. */
  solid: string;
  /** Border colour: the "total due" rule. */
  border: string;
};

/** Wherever a template shows its accent, it uses these — never raw colours. */
export function accentClasses(accent: AccentId): AccentClasses {
  switch (accent) {
    case "ink":
      return { solid: "bg-ink", border: "border-ink" };
    case "pine":
      return { solid: "bg-pine", border: "border-pine" };
    case "harbor":
      return { solid: "bg-harbor", border: "border-harbor" };
    case "coral":
    default:
      return { solid: "bg-accent", border: "border-accent" };
  }
}

/* -------------------------------------------------------------- Fonts */

export const INVOICE_FONTS: { id: InvoiceFontId; name: string; hint: string }[] = [
  { id: "sans", name: "Modern sans", hint: "Inter — clean and contemporary" },
  { id: "serif", name: "Classic serif", hint: "Georgia — traditional and formal" },
];

/** Class for the template root. Sans is the document default (inherits Inter). */
export function invoiceFontClass(font: InvoiceFontId): string {
  return font === "serif" ? "font-serif" : "";
}
