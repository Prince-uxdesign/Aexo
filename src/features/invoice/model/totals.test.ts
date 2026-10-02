import { describe, expect, it } from "vitest";
import {
  CALCULATION_ORDER,
  calcDiscount,
  calcSubtotal,
  calcTax,
  computeTotals,
  lineAmount,
  sanitizeQuantity,
  sanitizeTaxRate,
  sanitizeUnitPrice,
  validateDiscount,
  validateLineItem,
  validateTaxRate,
} from "./totals";

describe("lineAmount", () => {
  it("multiplies quantity by unit price", () => {
    expect(lineAmount({ quantity: 2, unitPrice: 125 })).toBe(250);
  });

  it("handles decimal quantities (1.5 hours)", () => {
    expect(lineAmount({ quantity: 1.5, unitPrice: 100 })).toBe(150);
  });

  it("rounds floating-point drift (0.1 × 0.2 style)", () => {
    expect(lineAmount({ quantity: 0.1, unitPrice: 0.2 })).toBe(0.02);
    expect(lineAmount({ quantity: 3, unitPrice: 19.99 })).toBe(59.97);
  });

  it("treats zero quantity or price as 0, never NaN", () => {
    expect(lineAmount({ quantity: 0, unitPrice: 100 })).toBe(0);
    expect(lineAmount({ quantity: 2, unitPrice: 0 })).toBe(0);
  });

  it("sanitises NaN / Infinity / negatives to 0", () => {
    expect(lineAmount({ quantity: NaN, unitPrice: 100 })).toBe(0);
    expect(lineAmount({ quantity: 2, unitPrice: Infinity })).toBe(0);
    expect(lineAmount({ quantity: -3, unitPrice: 100 })).toBe(0);
    expect(lineAmount({ quantity: 2, unitPrice: -50 })).toBe(0);
  });
});

describe("calcSubtotal", () => {
  it("sums a single item", () => {
    expect(calcSubtotal([{ quantity: 1, unitPrice: 1250 }])).toBe(1250);
  });

  it("sums multiple items", () => {
    expect(
      calcSubtotal([
        { quantity: 1, unitPrice: 4800 },
        { quantity: 40, unitPrice: 95 },
        { quantity: 3, unitPrice: 600 },
      ]),
    ).toBe(4800 + 3800 + 1800);
  });

  it("handles 50 items without drift (per-line rounding)", () => {
    const items = Array.from({ length: 50 }, () => ({ quantity: 1.5, unitPrice: 19.99 }));
    // 1.5 × 19.99 = 29.985 → 29.99 per line → 1499.50 total. No float drift.
    expect(calcSubtotal(items)).toBe(1499.5);
  });

  it("returns 0 for an empty list", () => {
    expect(calcSubtotal([])).toBe(0);
  });
});

describe("discount", () => {
  it("applies a 10% percentage discount", () => {
    expect(calcDiscount(1000, { type: "percent", value: 10 })).toBe(100);
  });

  it("applies a fixed discount", () => {
    expect(calcDiscount(1000, { type: "fixed", value: 250 })).toBe(250);
  });

  it("clamps a fixed discount to the subtotal (never negative total)", () => {
    expect(calcDiscount(100, { type: "fixed", value: 500 })).toBe(100);
  });

  it("clamps percent above 100 to the full subtotal", () => {
    expect(calcDiscount(100, { type: "percent", value: 150 })).toBe(100);
  });

  it("treats invalid discount values as 0", () => {
    expect(calcDiscount(100, { type: "fixed", value: NaN })).toBe(0);
    expect(calcDiscount(100, { type: "fixed", value: -20 })).toBe(0);
    expect(calcDiscount(100, undefined)).toBe(0);
  });
});

describe("tax", () => {
  it("applies 0% tax as 0", () => {
    expect(calcTax(1000, 0)).toBe(0);
    expect(calcTax(1000, undefined)).toBe(0);
  });

  it("applies 11% tax", () => {
    expect(calcTax(1000, 11)).toBe(110);
  });

  it("clamps tax above 100% and negatives", () => {
    expect(calcTax(1000, 200)).toBe(1000);
    expect(calcTax(1000, -5)).toBe(0);
    expect(calcTax(1000, NaN)).toBe(0);
  });
});

describe("computeTotals — order: subtotal → discount → tax on taxable → total", () => {
  it("exposes the explicit calculation order", () => {
    expect([...CALCULATION_ORDER]).toEqual([
      "line-amount",
      "subtotal",
      "discount",
      "taxable",
      "tax",
      "total",
    ]);
  });

  it("computes tax AFTER discount (discount + tax)", () => {
    // subtotal 1000, 10% discount → taxable 900, 10% tax → 90, total 990.
    const totals = computeTotals({
      items: [{ quantity: 1, unitPrice: 1000 }],
      discount: { type: "percent", value: 10 },
      taxRate: 10,
    });
    expect(totals).toEqual({ subtotal: 1000, discount: 100, taxable: 900, tax: 90, total: 990 });
  });

  it("handles fixed discount + tax", () => {
    const totals = computeTotals({
      items: [{ quantity: 2, unitPrice: 500 }],
      discount: { type: "fixed", value: 200 },
      taxRate: 7.5,
    });
    expect(totals.subtotal).toBe(1000);
    expect(totals.discount).toBe(200);
    expect(totals.taxable).toBe(800);
    expect(totals.tax).toBe(60);
    expect(totals.total).toBe(860);
  });

  it("handles decimal quantities and multi-decimal prices (rounded per line)", () => {
    const totals = computeTotals({
      items: [{ quantity: 1.5, unitPrice: 19.995 }],
    });
    // 1.5 × 19.995 = 29.9925 → 29.99. Rounding is per line, then summed.
    expect(totals.subtotal).toBe(29.99);
    expect(totals.total).toBe(29.99);
  });

  it("handles large values without Infinity", () => {
    const totals = computeTotals({
      items: [{ quantity: 100000, unitPrice: 99999.99 }],
    });
    expect(Number.isFinite(totals.total)).toBe(true);
    expect(totals.total).toBeGreaterThan(0);
  });

  it("never returns a negative total, even with hostile input", () => {
    const totals = computeTotals({
      items: [
        { quantity: NaN, unitPrice: Infinity },
        { quantity: -5, unitPrice: -10 },
      ],
      discount: { type: "fixed", value: 999999 },
      taxRate: -50,
    });
    expect(totals).toEqual({ subtotal: 0, discount: 0, taxable: 0, tax: 0, total: 0 });
    expect(Number.isNaN(totals.total)).toBe(false);
  });
});

describe("sanitisers", () => {
  it("rejects NaN and Infinity", () => {
    expect(sanitizeQuantity(NaN)).toBe(0);
    expect(sanitizeUnitPrice(Infinity)).toBe(0);
    expect(sanitizeTaxRate(NaN)).toBe(0);
  });
});

describe("validation messages (human-readable)", () => {
  it("asks for quantity and price in plain language", () => {
    expect(validateLineItem({ name: "Design", quantity: null, unitPrice: 100 }).quantity).toBe(
      "Enter a quantity.",
    );
    expect(validateLineItem({ name: "Design", quantity: 1, unitPrice: null }).unitPrice).toBe(
      "Enter a valid price.",
    );
  });

  it("rejects fixed discounts above the subtotal", () => {
    expect(validateDiscount({ type: "fixed", value: 200 }, 100)).toBe(
      "Discount cannot be greater than the subtotal.",
    );
  });

  it("rejects tax rates outside 0–100", () => {
    expect(validateTaxRate(150)).toBe("Tax rate must be between 0% and 100%.");
    expect(validateTaxRate(-1)).toBe("Tax rate must be between 0% and 100%.");
    expect(validateTaxRate(11)).toBeUndefined();
  });
});
