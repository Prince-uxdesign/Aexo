"use client";

import { useMemo } from "react";
import {
  CurrencyInput,
  Divider,
  Input,
  NumberInput,
  SegmentedControl,
  Toggle,
} from "@/components/ui";
import { formatDiscountLine, formatMoney, getCurrencyMeta } from "@/lib/format/currency";
import { computeTotals } from "../../model/totals";
import { useFormActions, useFormValue } from "../form-context";
import { FormField } from "../form-field";
import { toDiscount, toLineItems } from "../form-mapping";
import { FormSection, SectionGrid } from "../form-section";

/** A read-only result line: "Discount  −$40.00". */
function AmountLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex min-w-0 items-baseline justify-between gap-4 rounded-md bg-surface-alt px-4 py-3">
      <span className="min-w-0 shrink-0 text-label font-normal text-muted">{label}</span>
      <output className="min-w-0 text-right text-body break-all text-ink tabular-nums">
        {value}
      </output>
    </p>
  );
}

/**
 * Live totals: subtotal → discount → tax → total. Stays scannable on a
 * 375px phone (stacked rows, no table) and never overflows — long amounts
 * wrap with break-all inside a min-w-0 container.
 */
function TotalsSummary({
  subtotal,
  discount,
  tax,
  total,
  taxLabel,
}: {
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  taxLabel: string;
}) {
  return (
    <section
      aria-label="Invoice totals"
      className="flex min-w-0 flex-col gap-1 rounded-lg border border-border-strong bg-surface-alt p-4 @md:p-5"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-4 py-1">
        <span className="shrink-0 text-label font-normal text-muted">Subtotal</span>
        <output className="min-w-0 text-right text-body break-all text-ink tabular-nums">
          {subtotal}
        </output>
      </div>
      <div className="flex min-w-0 items-baseline justify-between gap-4 py-1">
        <span className="shrink-0 text-label font-normal text-muted">Discount</span>
        <output className="min-w-0 text-right text-body break-all text-ink tabular-nums">
          {discount}
        </output>
      </div>
      <div className="flex min-w-0 items-baseline justify-between gap-4 py-1">
        <span className="min-w-0 truncate text-label font-normal text-muted">{taxLabel}</span>
        <output className="min-w-0 shrink-0 text-right text-body break-all text-ink tabular-nums">
          {tax}
        </output>
      </div>
      <div className="mt-1 flex min-w-0 items-baseline justify-between gap-4 border-t border-border-strong pt-3">
        <span className="shrink-0 text-h3 text-ink">Total</span>
        <output
          aria-live="polite"
          className="min-w-0 text-right text-h3 break-all text-ink tabular-nums"
        >
          {total}
        </output>
      </div>
    </section>
  );
}

export function AdjustmentsSection({ step }: { step: number }) {
  const discount = useFormValue((v) => v.discount);
  const tax = useFormValue((v) => v.tax);
  const items = useFormValue((v) => v.items);
  const currency = useFormValue((v) => v.currency);
  const locale = useFormValue((v) => v.locale);
  const actions = useFormActions();

  // Display only. The calculation itself lives in the model (subtotal → discount → tax).
  const totals = useMemo(
    () =>
      computeTotals({
        items: toLineItems(items),
        discount: toDiscount(discount),
        taxRate: tax.rate ?? undefined,
      }),
    [items, discount, tax.rate],
  );
  const money = (value: number) => formatMoney(value, currency, locale);
  const discountOn = discount.type !== "none";
  const { symbol } = getCurrencyMeta(currency, locale);

  return (
    <FormSection
      id="discount-tax"
      step={step}
      title="Discount & tax"
      description="Both are optional. Tax is applied after any discount."
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Toggle
            label="Add a discount"
            checked={discountOn}
            onCheckedChange={(on) => actions.updateDiscount({ type: on ? "percent" : "none" })}
          />

          {discountOn ? (
            <div className="flex flex-col gap-4">
              <SegmentedControl
                label="Discount type"
                value={discount.type === "fixed" ? "fixed" : "percent"}
                onValueChange={(type) => actions.updateDiscount({ type, value: null })}
                options={[
                  { value: "percent", label: "Percentage", icon: "%" },
                  { value: "fixed", label: "Fixed amount", icon: symbol },
                ]}
              />
              <SectionGrid>
                <FormField
                  path="discount.value"
                  label={discount.type === "percent" ? "Discount percentage" : "Discount amount"}
                >
                  {discount.type === "percent" ? (
                    <NumberInput
                      value={discount.value}
                      onValueChange={(value) => actions.updateDiscount({ value })}
                      trailing="%"
                      maxFractionDigits={2}
                      placeholder="10"
                      inputClassName="text-right tabular-nums"
                    />
                  ) : (
                    <CurrencyInput
                      value={discount.value}
                      onValueChange={(value) => actions.updateDiscount({ value })}
                      currency={currency}
                      locale={locale}
                    />
                  )}
                </FormField>
                <div className="flex flex-col justify-end">
                  <AmountLine
                    label="Discount"
                    value={formatDiscountLine(totals.discount, currency, locale)}
                  />
                </div>
              </SectionGrid>
            </div>
          ) : null}
        </div>

        <Divider />

        <SectionGrid>
          <FormField path="tax.label" label="Tax name" hint="e.g. VAT, GST or Sales tax.">
            <Input
              value={tax.label}
              onChange={(event) => actions.updateTax({ label: event.target.value })}
              autoComplete="off"
              maxLength={30}
            />
          </FormField>
          <FormField path="tax.rate" label="Tax rate" hint="Leave empty if you don't charge tax.">
            <NumberInput
              value={tax.rate}
              onValueChange={(rate) => actions.updateTax({ rate })}
              trailing="%"
              maxFractionDigits={3}
              placeholder="0"
              inputClassName="text-right tabular-nums"
            />
          </FormField>
          <div className="@md:col-span-2">
            <AmountLine
              label={`${tax.label.trim() || "Tax"}${tax.rate ? ` (${tax.rate}%)` : ""}`}
              value={money(totals.tax)}
            />
          </div>
        </SectionGrid>

        <TotalsSummary
          subtotal={money(totals.subtotal)}
          discount={formatDiscountLine(totals.discount, currency, locale)}
          tax={money(totals.tax)}
          total={money(totals.total)}
          taxLabel={`${tax.label.trim() || "Tax"}${tax.rate ? ` (${tax.rate}%)` : ""}`}
        />
      </div>
    </FormSection>
  );
}
