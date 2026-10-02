"use client";

import { useId, useState, type ComponentProps } from "react";
import { formatAmount, getCurrencyMeta, parseAmount } from "@/lib/format/currency";
import { Input } from "./input";

export type CurrencyInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "inputMode"
> & {
  /** Amount as a number, or null when empty. */
  value: number | null;
  onValueChange: (value: number | null) => void;
  /** ISO 4217 code, e.g. "USD", "EUR", "NGN". */
  currency: string;
  /**
   * Formatting locale, e.g. "en-US". Pass one explicitly: if left to the browser
   * default, server and client output can differ and cause a hydration mismatch.
   */
  locale?: string;
  /** Shows the code (e.g. "USD") after the value, useful when symbols are ambiguous ($). */
  showCode?: boolean;
};

/**
 * Money field. Shows the currency symbol, opens the numeric keypad on phones,
 * and formats on blur ("1234.5" → "1,234.50"). While focused, the person edits
 * the raw text so the caret never jumps.
 */
export function CurrencyInput({
  value,
  onValueChange,
  currency,
  locale,
  showCode = false,
  onFocus,
  onBlur,
  className,
  ...props
}: CurrencyInputProps) {
  // Only holds text while editing; otherwise the display comes from `value`.
  const [draft, setDraft] = useState<string | null>(null);
  const { symbol } = getCurrencyMeta(currency, locale);
  const currencyNoteId = `currency-${useId()}`;
  const currencyName =
    new Intl.DisplayNames(locale ? [locale] : undefined, { type: "currency" }).of(currency) ??
    currency;

  const display = draft ?? (value === null ? "" : formatAmount(value, currency, locale));

  return (
    <>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className={className}
        leading={<span className="text-body text-muted">{symbol}</span>}
        trailing={showCode ? <span className="text-label text-muted">{currency}</span> : undefined}
        value={display}
        onFocus={(event) => {
          setDraft(display);
          onFocus?.(event);
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          onValueChange(parseAmount(event.target.value, currency, locale));
        }}
        onBlur={(event) => {
          // Keep unreadable text visible (value stays null) so validation can point
          // at it, instead of silently wiping what the person typed.
          const unreadable = draft?.trim() && parseAmount(draft, currency, locale) === null;
          if (!unreadable) setDraft(null);
          onBlur?.(event);
        }}
        aria-describedby={[props["aria-describedby"], currencyNoteId].filter(Boolean).join(" ")}
        // Amounts read and compare more easily right-aligned with even-width digits.
        inputClassName="text-right tabular-nums"
      />
      {/* The symbol is visual only; this tells screen readers the currency. */}
      <span id={currencyNoteId} hidden>
        {currencyName}
      </span>
    </>
  );
}
