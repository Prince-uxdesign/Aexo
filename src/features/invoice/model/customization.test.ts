import { describe, expect, it } from "vitest";
import {
  ACCENTS,
  accentClasses,
  invoiceFontClass,
  resolveCustomization,
  DEFAULT_CUSTOMIZATION,
} from "./customization";
import { computeTotals } from "./totals";
import { toInvoice, fromInvoice } from "../form/form-mapping";
import { createDefaultValues } from "../form/form-values";
import type { Invoice } from "./types";

function baseInvoice(): Invoice {
  return toInvoice(createDefaultValues({ today: "2026-10-02" }));
}

describe("resolveCustomization", () => {
  it("fills every default when customization is missing (old drafts)", () => {
    expect(resolveCustomization({})).toEqual({
      accent: "coral",
      title: "Invoice",
      font: "sans",
      showPayment: true,
      showNotes: true,
      footerText: undefined,
    });
  });

  it("falls back on blank titles and trims whitespace", () => {
    expect(
      resolveCustomization({ customization: { ...DEFAULT_CUSTOMIZATION, title: "   " } }).title,
    ).toBe("Invoice");
    expect(
      resolveCustomization({ customization: { ...DEFAULT_CUSTOMIZATION, title: "  Receipt  " } })
        .title,
    ).toBe("Receipt");
  });

  it("rejects unknown accents and fonts", () => {
    const resolved = resolveCustomization({
      customization: {
        ...DEFAULT_CUSTOMIZATION,
        accent: "neon" as never,
        font: "comic" as never,
      },
    });
    expect(resolved.accent).toBe("coral");
    expect(resolved.font).toBe("sans");
  });
});

describe("accentClasses", () => {
  it("covers every curated accent with real classes (no raw colours)", () => {
    for (const accent of ACCENTS) {
      const classes = accentClasses(accent.id);
      expect(classes.solid).toMatch(/^bg-/);
      expect(classes.border).toMatch(/^border-/);
    }
  });

  it("never uses a gradient, shadow or oversized fill", () => {
    for (const accent of ACCENTS) {
      const classes = accentClasses(accent.id);
      expect(`${classes.solid} ${classes.border}`).not.toMatch(/gradient|glass|shadow|text-/);
    }
  });
});

describe("invoiceFontClass", () => {
  it("inherits sans (no class) and opts into serif explicitly", () => {
    expect(invoiceFontClass("sans")).toBe("");
    expect(invoiceFontClass("serif")).toBe("font-serif");
  });
});

describe("customization never touches data or calculations", () => {
  it("changing every customization leaves totals identical", () => {
    const plain = baseInvoice();
    const styled: Invoice = {
      ...plain,
      template: "accent",
      customization: {
        accent: "harbor",
        title: "Tax Invoice",
        font: "serif",
        showPayment: false,
        showNotes: false,
        footerText: "Thanks!",
      },
    };
    expect(computeTotals(styled)).toEqual(computeTotals(plain));
    expect(styled.sender).toEqual(plain.sender);
    expect(styled.items).toEqual(plain.items);
    expect(styled.payment).toEqual(plain.payment);
    expect(styled.notes).toEqual(plain.notes);
  });

  it("round-trips through form values", () => {
    const invoice = baseInvoice();
    invoice.customization = {
      accent: "pine",
      title: "Receipt",
      font: "serif",
      showPayment: false,
      showNotes: true,
      footerText: "Company No. 123",
    };
    const fallback = createDefaultValues({ today: "2026-10-02" });
    const values = fromInvoice(invoice, fallback);
    expect(values.customization.accent).toBe("pine");
    expect(values.customization.title).toBe("Receipt");
    expect(values.customization.font).toBe("serif");
    expect(values.customization.showPayment).toBe(false);
    expect(values.customization.footerText).toBe("Company No. 123");
    // And back to an invoice without losing anything.
    expect(toInvoice(values).customization).toEqual(invoice.customization);
  });

  it("maps the default heading back to a blank field", () => {
    const fallback = createDefaultValues({ today: "2026-10-02" });
    const values = fromInvoice(baseInvoice(), fallback);
    expect(values.customization.title).toBe("");
  });
});
