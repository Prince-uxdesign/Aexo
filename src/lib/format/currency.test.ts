import { describe, expect, it } from "vitest";
import {
  formatDiscountLine,
  formatMoney,
  getCurrencyMeta,
  normalizeCurrency,
  parseAmount,
} from "./currency";

describe("formatMoney — locale-aware, per currency", () => {
  it("formats USD as $1,250.00", () => {
    expect(formatMoney(1250, "USD", "en-US")).toBe("$1,250.00");
  });

  it("formats GBP with £", () => {
    const out = formatMoney(1250, "GBP", "en-GB");
    expect(out).toContain("£");
    expect(out).toContain("1,250.00");
  });

  it("formats EUR with €", () => {
    const out = formatMoney(1250, "EUR", "de-DE");
    expect(out).toContain("€");
    expect(out).toContain("1.250,00");
  });

  it("formats NGN with ₦", () => {
    const out = formatMoney(1250000, "NGN", "en-NG");
    expect(out).toContain("₦");
    expect(out).toContain("1,250,000.00");
  });

  it("falls back safely for unknown currencies and invalid values", () => {
    expect(() => formatMoney(100, "XX1", "en-US")).not.toThrow();
    expect(formatMoney(NaN, "USD", "en-US")).toBe("$0.00");
    expect(formatMoney(Infinity, "USD", "en-US")).toBe("$0.00");
  });

  it("exposes metadata without manual symbol maps", () => {
    expect(getCurrencyMeta("USD", "en-US").symbol).toBe("$");
    expect(getCurrencyMeta("GBP", "en-GB").symbol).toBe("£");
    expect(normalizeCurrency("usd")).toBe("USD");
    expect(normalizeCurrency("")).toBe("USD");
  });
});

describe("formatDiscountLine", () => {
  it("prefixes a minus sign without duplicating symbols", () => {
    expect(formatDiscountLine(40, "USD", "en-US")).toBe("−$40.00");
    expect(formatDiscountLine(0, "USD", "en-US")).toBe("$0.00");
  });
});

describe("parseAmount", () => {
  it("reads grouped decimals", () => {
    expect(parseAmount("1,250.00", "USD", "en-US")).toBe(1250);
  });

  it("returns null for empty input", () => {
    expect(parseAmount("", "USD", "en-US")).toBeNull();
  });
});
