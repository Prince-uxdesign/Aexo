import type { Adjustment, LineItem } from "./types";

/**
 * PHASE 5 — Invoice item & calculation engine.
 *
 * Pure TypeScript: no React, no DOM, no templates, no database, no PDF.
 * Safe to import from server code, client code, tests, PDF generation,
 * shareable-invoice rendering and email rendering alike.
 *
 * CALCULATION ORDER (explicit — do not reorder without updating callers):
 *   1. line amount   = quantity × unit price            (per item, rounded)
 *   2. subtotal      = Σ line amounts                    (rounded)
 *   3. discount      = percent → subtotal × value / 100
 *                      fixed   → value
 *                      clamped to [0, subtotal]           (rounded)
 *   4. taxable       = subtotal − discount               (rounded)
 *   5. tax           = taxable × taxRate / 100,
 *                      taxRate clamped to [0, 100]        (rounded)
 *   6. total         = taxable + tax                     (rounded, never < 0)
 *
 * Tax is always applied AFTER discount. Currency never affects the maths;
 * formatting lives in `@/lib/format/currency`.
 */

export const CALCULATION_ORDER = [
  "line-amount",
  "subtotal",
  "discount",
  "taxable",
  "tax",
  "total",
] as const;

export type CalculationStep = (typeof CALCULATION_ORDER)[number];

/** Upper bound for any single money value the engine will produce. */
export const MAX_MONEY_VALUE = 999_999_999_999.99;

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
};

export type TotalsInput = {
  items: Pick<LineItem, "quantity" | "unitPrice">[];
  discount?: Adjustment;
  /** Percentage, applied after discount. Clamped to [0, 100]. */
  taxRate?: number;
};

/* ------------------------------------------------------------ Sanitising */

function isUsableNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Anything unusable (NaN, Infinity, non-numbers) becomes 0. Never throws. */
export function sanitizeNumber(value: unknown): number {
  if (!isUsableNumber(value)) return 0;
  return value;
}

/** Quantities: finite, >= 0, capped so qty × price can't overflow. */
export function sanitizeQuantity(value: unknown): number {
  const n = sanitizeNumber(value);
  if (n <= 0) return 0;
  return Math.min(n, 1_000_000_000);
}

/** Unit prices: finite, >= 0, capped at the max money value. */
export function sanitizeUnitPrice(value: unknown): number {
  const n = sanitizeNumber(value);
  if (n <= 0) return 0;
  return Math.min(n, MAX_MONEY_VALUE);
}

/** Discount values: finite, >= 0. Percent range checked by validation. */
export function sanitizeDiscountValue(value: unknown): number {
  const n = sanitizeNumber(value);
  if (n <= 0) return 0;
  return Math.min(n, MAX_MONEY_VALUE);
}

/** Tax rates: finite, clamped to [0, 100]. */
export function sanitizeTaxRate(value: unknown): number {
  const n = sanitizeNumber(value);
  if (n <= 0) return 0;
  return Math.min(n, 100);
}

/* --------------------------------------------------------------- Rounding */

/** Round to cents (or the currency's minor unit) to avoid 0.1 + 0.2 drift. */
export function roundMoney(value: number, fractionDigits = 2): number {
  const n = sanitizeNumber(value);
  if (n >= MAX_MONEY_VALUE) return MAX_MONEY_VALUE;
  const factor = 10 ** fractionDigits;
  return Math.round((n + Number.EPSILON) * factor) / factor;
}

/* ------------------------------------------------------------ Calculation */

/** Step 1: one line's amount. Invalid/negative inputs become 0, never NaN. */
export function lineAmount(item: Pick<LineItem, "quantity" | "unitPrice">): number {
  return roundMoney(sanitizeQuantity(item.quantity) * sanitizeUnitPrice(item.unitPrice));
}

/** Step 2: sum of all line amounts. */
export function calcSubtotal(items: Pick<LineItem, "quantity" | "unitPrice">[]): number {
  const sum = items.reduce((total, item) => total + lineAmount(item), 0);
  return roundMoney(sum);
}

/** Step 3: discount for a subtotal, clamped to [0, subtotal]. */
export function calcDiscount(subtotal: number, discount: Adjustment | undefined): number {
  const safeSubtotal = Math.min(Math.max(sanitizeNumber(subtotal), 0), MAX_MONEY_VALUE);
  if (!discount) return 0;
  const value = sanitizeDiscountValue(discount.value);
  const raw = discount.type === "percent" ? (safeSubtotal * Math.min(value, 100)) / 100 : value;
  return roundMoney(Math.min(Math.max(raw, 0), safeSubtotal));
}

/** Step 4: amount tax applies to. */
export function calcTaxable(subtotal: number, discount: number): number {
  return roundMoney(Math.max(sanitizeNumber(subtotal) - sanitizeNumber(discount), 0));
}

/** Step 5: tax on the discounted amount. Never negative. */
export function calcTax(taxable: number, taxRate: number | undefined): number {
  const safeTaxable = Math.max(sanitizeNumber(taxable), 0);
  const rate = sanitizeTaxRate(taxRate ?? 0);
  return roundMoney((safeTaxable * rate) / 100);
}

/**
 * Steps 1–6 in one call. A discount can never take the total below zero
 * and tax can never be negative, so `total` is always >= 0 and finite.
 */
export function computeTotals(input: TotalsInput): InvoiceTotals {
  const subtotal = calcSubtotal(input.items);
  const discount = calcDiscount(subtotal, input.discount);
  const taxable = calcTaxable(subtotal, discount);
  const tax = calcTax(taxable, input.taxRate);
  const total = roundMoney(Math.max(taxable + tax, 0));
  return { subtotal, discount, taxable, tax, total };
}

/* --------------------------------------------------------------- Validation
 * Human-readable messages (guide §21). The form re-uses these so the engine
 * and the UI can never disagree about what "invalid" means. */

export function validateLineItem(item: {
  name: string;
  quantity: number | null;
  unitPrice: number | null;
}): { quantity?: string; unitPrice?: string; name?: string } {
  const errors: { quantity?: string; unitPrice?: string; name?: string } = {};
  if (!item.name.trim()) errors.name = "Add a name for this item.";
  if (item.quantity === null || !Number.isFinite(item.quantity)) {
    errors.quantity = "Enter a quantity.";
  } else if (item.quantity <= 0) {
    errors.quantity = "Enter a quantity above 0.";
  }
  if (item.unitPrice === null || !Number.isFinite(item.unitPrice)) {
    errors.unitPrice = "Enter a valid price.";
  } else if (item.unitPrice < 0) {
    errors.unitPrice = "Enter a valid price.";
  }
  return errors;
}

export function validateDiscount(
  discount: { type: Adjustment["type"] | "none"; value: number | null },
  subtotal: number,
): string | undefined {
  if (discount.type === "none" || discount.value === null) return undefined;
  if (!Number.isFinite(discount.value) || discount.value < 0) {
    return "Enter a valid discount.";
  }
  if (discount.type === "percent" && discount.value > 100) {
    return "A percentage discount can't be more than 100%.";
  }
  if (
    discount.type === "fixed" &&
    Number.isFinite(subtotal) &&
    subtotal > 0 &&
    discount.value > subtotal
  ) {
    return "Discount cannot be greater than the subtotal.";
  }
  return undefined;
}

export function validateTaxRate(rate: number | null): string | undefined {
  if (rate === null) return undefined;
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    return "Tax rate must be between 0% and 100%.";
  }
  return undefined;
}
