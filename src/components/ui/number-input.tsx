"use client";

import { useState } from "react";
import { Input, type InputProps } from "./input";

export type NumberInputProps = Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onChange" | "inputMode"
> & {
  /** The number, or null when empty or unreadable. */
  value: number | null;
  onValueChange: (value: number | null) => void;
  /** Whole numbers only (opens the plain numeric keypad on phones). */
  integer?: boolean;
  /** Maximum decimal places kept. Default 4. */
  maxFractionDigits?: number;
};

/** "1,5" or "1,234.5" → number. Returns null for empty or unreadable text. */
function parseNumber(text: string, integer: boolean, maxFractionDigits: number) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  // Accept a comma as the decimal mark when it's the only separator ("1,5").
  const normalized = /^\d+,\d+$/.test(trimmed) ? trimmed.replace(",", ".") : trimmed;
  const cleaned = normalized.replace(/[\s,]/g, "");
  if (!/^-?\d*\.?\d*$/.test(cleaned) || cleaned === "." || cleaned === "-") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  if (integer) return Math.trunc(value);
  const factor = 10 ** maxFractionDigits;
  return Math.round(value * factor) / factor;
}

/**
 * Plain number field (quantity, percentage). Opens the numeric keypad on
 * phones and avoids `type="number"`, whose spinners, scroll-to-change and
 * silent rejection of "1,5" trip people up. While focused, the person edits the
 * raw text; unreadable text stays visible (value is null) so validation can
 * point at it. Pass `trailing="%"` or a unit as needed.
 */
export function NumberInput({
  value,
  onValueChange,
  integer = false,
  maxFractionDigits = 4,
  onFocus,
  onBlur,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? (value === null ? "" : String(value));

  return (
    <Input
      {...props}
      type="text"
      inputMode={integer ? "numeric" : "decimal"}
      autoComplete="off"
      value={display}
      onFocus={(event) => {
        setDraft(display);
        onFocus?.(event);
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        onValueChange(parseNumber(event.target.value, integer, maxFractionDigits));
      }}
      onBlur={(event) => {
        const unreadable = draft?.trim() && parseNumber(draft, integer, maxFractionDigits) === null;
        if (!unreadable) setDraft(null);
        onBlur?.(event);
      }}
    />
  );
}
