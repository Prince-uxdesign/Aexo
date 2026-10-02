"use client";

import { useMemo } from "react";
import { DateInput, Input, Select } from "@/components/ui";
import { formatDate } from "@/lib/format/date";
import { useFormActions, useFormValue } from "../form-context";
import { FormField } from "../form-field";
import { FormSection, SectionGrid } from "../form-section";
import {
  currencyCodes,
  getPaymentTerm,
  paymentTermOptions,
  type PaymentTermId,
} from "../form-values";

function useCurrencyOptions(locale: string, current: string) {
  return useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: "currency" });
    const codes: string[] = [...currencyCodes];
    if (!codes.includes(current)) codes.unshift(current);
    return codes.map((code) => ({ value: code, label: `${code} · ${names.of(code) ?? code}` }));
  }, [locale, current]);
}

export function InvoiceDetailsSection({ step }: { step: number }) {
  const number = useFormValue((v) => v.number);
  const issueDate = useFormValue((v) => v.issueDate);
  const dueDate = useFormValue((v) => v.dueDate);
  const terms = useFormValue((v) => v.paymentTerms);
  const customTerms = useFormValue((v) => v.customTerms);
  const currency = useFormValue((v) => v.currency);
  const locale = useFormValue((v) => v.locale);
  const actions = useFormActions();
  const currencyOptions = useCurrencyOptions(locale, currency);

  const dueHint =
    terms === "custom"
      ? "Pick any date, or choose terms to set it for you."
      : issueDate
        ? `${getPaymentTerm(terms).label} from ${formatDate(issueDate, locale, "short")}. Change it to pick your own.`
        : undefined;

  return (
    <FormSection
      id="invoice-details"
      step={step}
      title="Invoice details"
      description="Number, dates and the currency you're billing in."
    >
      <SectionGrid>
        <FormField path="number" label="Invoice number" required>
          <Input
            value={number}
            onChange={(event) => actions.update({ number: event.target.value })}
            autoComplete="off"
            spellCheck={false}
            placeholder="INV-0001"
          />
        </FormField>

        <FormField path="currency" label="Currency">
          <Select
            value={currency}
            onChange={(event) => actions.update({ currency: event.target.value })}
            options={currencyOptions}
          />
        </FormField>

        <FormField path="issueDate" label="Issue date" required>
          <DateInput
            value={issueDate}
            onChange={(event) => actions.setIssueDate(event.target.value)}
          />
        </FormField>

        <FormField path="paymentTerms" label="Payment terms">
          <Select
            value={terms}
            onChange={(event) => actions.setPaymentTerms(event.target.value as PaymentTermId)}
            options={paymentTermOptions.map(({ value, label }) => ({ value, label }))}
          />
        </FormField>

        <FormField path="dueDate" label="Due date" hint={dueHint}>
          <DateInput
            value={dueDate}
            min={issueDate || undefined}
            onChange={(event) => actions.setDueDate(event.target.value)}
          />
        </FormField>

        {terms === "custom" ? (
          <FormField
            path="customTerms"
            label="Terms shown on the invoice"
            hint="Optional, e.g. “50% upfront, 50% on delivery”."
          >
            <Input
              value={customTerms}
              onChange={(event) => actions.update({ customTerms: event.target.value })}
              maxLength={80}
            />
          </FormField>
        ) : null}
      </SectionGrid>
    </FormSection>
  );
}
