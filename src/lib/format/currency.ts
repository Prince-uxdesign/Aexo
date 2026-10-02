/**
 * Currency helpers built on Intl, so symbols, decimal places and separators
 * follow the currency and locale (JPY has no decimals, de-DE uses "1.234,50").
 *
 * PHASE 5: calculation logic is currency-independent — these helpers only
 * FORMAT numbers for display. They never affect maths and never throw:
 * unknown currencies/locales fall back to a safe default.
 */

const metaCache = new Map<string, CurrencyMeta>();

/** Currencies offered in the picker. Any other ISO 4217 code still renders. */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "GBP",
  "EUR",
  "NGN",
  "GHS",
  "KES",
  "ZAR",
  "CAD",
  "AUD",
  "NZD",
  "INR",
  "AED",
  "JPY",
  "CHF",
  "SGD",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_LOCALE = "en-US";

/** Sensible formatting locale per currency when the invoice has none. */
const CURRENCY_LOCALES: Record<string, string> = {
  USD: "en-US",
  GBP: "en-GB",
  EUR: "de-DE",
  NGN: "en-NG",
};

export type CurrencyMeta = {
  symbol: string;
  fractionDigits: number;
  decimalSeparator: string;
  groupSeparator: string;
};

export function getCurrencyMeta(currency: string, locale?: string): CurrencyMeta {
  const safeCurrency = normalizeCurrency(currency);
  const safeLocale = normalizeLocale(safeCurrency, locale);
  const key = `${safeCurrency}|${safeLocale ?? ""}`;
  const cached = metaCache.get(key);
  if (cached) return cached;

  let meta: CurrencyMeta;
  try {
    const formatter = new Intl.NumberFormat(safeLocale, {
      style: "currency",
      currency: safeCurrency,
      currencyDisplay: "narrowSymbol",
    });
    const parts = formatter.formatToParts(12345.6);
    meta = {
      symbol: parts.find((part) => part.type === "currency")?.value ?? safeCurrency,
      fractionDigits: formatter.resolvedOptions().maximumFractionDigits ?? 2,
      decimalSeparator: parts.find((part) => part.type === "decimal")?.value ?? ".",
      groupSeparator: parts.find((part) => part.type === "group")?.value ?? ",",
    };
  } catch {
    meta = { symbol: safeCurrency, fractionDigits: 2, decimalSeparator: ".", groupSeparator: "," };
  }
  metaCache.set(key, meta);
  return meta;
}

/** "1234.5" → "1,234.50" (no symbol). Used for input display. Never throws. */
export function formatAmount(value: number, currency: string, locale?: string) {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const safeCurrency = normalizeCurrency(currency);
  const safeLocale = normalizeLocale(safeCurrency, locale);
  try {
    const { fractionDigits } = getCurrencyMeta(safeCurrency, safeLocale);
    return new Intl.NumberFormat(safeLocale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(safeValue);
  } catch {
    return safeValue.toFixed(2);
  }
}

/** 1234.5 → "$1,234.50". Used for totals and documents. Never throws. */
export function formatMoney(value: number, currency: string, locale?: string) {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const safeCurrency = normalizeCurrency(currency);
  const safeLocale = normalizeLocale(safeCurrency, locale);
  try {
    return new Intl.NumberFormat(safeLocale, {
      style: "currency",
      currency: safeCurrency,
      currencyDisplay: "narrowSymbol",
    }).format(safeValue);
  } catch {
    return `${safeCurrency} ${safeValue.toFixed(2)}`;
  }
}

/**
 * A discount line without scattering "−" + symbol concatenation across the UI:
 * "−$40.00" for a positive discount, formatted zero when there is none.
 */
export function formatDiscountLine(discount: number, currency: string, locale?: string) {
  if (!Number.isFinite(discount) || discount <= 0) return formatMoney(0, currency, locale);
  return `−${formatMoney(discount, currency, locale)}`;
}

export function isSupportedCurrency(code: string): code is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code.toUpperCase());
}

/** Unknown/blank codes fall back to USD so formatting never crashes. */
export function normalizeCurrency(code: string): string {
  const upper = (code || "").trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(upper)) return upper;
  return DEFAULT_CURRENCY;
}

function normalizeLocale(currency: string, locale?: string): string | undefined {
  if (locale?.trim()) return locale;
  return CURRENCY_LOCALES[currency] ?? DEFAULT_LOCALE;
}

/**
 * Read what a person typed: "1,234.50", "1234,5" (de), "$ 99". Returns null for
 * empty or unreadable input. Rounds to the currency's decimal places.
 */
export function parseAmount(input: string, currency: string, locale?: string): number | null {
  const { decimalSeparator, groupSeparator, fractionDigits } = getCurrencyMeta(currency, locale);
  const negative = /^\s*-|\(.*\)/.test(input);

  // Keep digits and the locale's separators only (spaces used as grouping go here too).
  let cleaned = input.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;

  // Drop grouping separators, then turn the locale's decimal separator into ".".
  if (groupSeparator === "." || groupSeparator === ",") {
    cleaned = cleaned.split(groupSeparator).join("");
  }
  if (decimalSeparator === ",") cleaned = cleaned.replace(",", ".");

  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;

  const factor = 10 ** fractionDigits;
  const rounded = Math.round(value * factor) / factor;
  return negative ? -rounded : rounded;
}
