"use client";

import { Input, Textarea } from "@/components/ui";
import { useFormActions, useFormValue } from "../form-context";
import { FormField } from "../form-field";
import { FormSection, SectionGrid } from "../form-section";

export function PaymentSection({ step }: { step: number }) {
  const payment = useFormValue((v) => v.payment);
  const { updatePayment } = useFormActions();

  return (
    <FormSection
      id="payment"
      step={step}
      title="Payment details"
      description="How your client can pay you. Leave it empty to skip this block."
    >
      <SectionGrid>
        <FormField path="payment.bankName" label="Bank name">
          <Input
            value={payment.bankName}
            onChange={(event) => updatePayment({ bankName: event.target.value })}
            autoComplete="off"
          />
        </FormField>
        <FormField path="payment.accountName" label="Account name">
          <Input
            value={payment.accountName}
            onChange={(event) => updatePayment({ accountName: event.target.value })}
            autoComplete="off"
          />
        </FormField>
        <FormField
          path="payment.accountNumber"
          label="Account number"
          hint="Or IBAN. Shown exactly as typed."
          className="@md:col-span-2"
        >
          <Input
            value={payment.accountNumber}
            onChange={(event) => updatePayment({ accountNumber: event.target.value })}
            autoComplete="off"
            spellCheck={false}
            className="tabular-nums"
          />
        </FormField>
        <FormField
          path="payment.instructions"
          label="Payment instructions"
          className="@md:col-span-2"
        >
          <Textarea
            rows={2}
            value={payment.instructions}
            onChange={(event) => updatePayment({ instructions: event.target.value })}
            placeholder="e.g. Please use the invoice number as your payment reference."
            className="min-h-20"
          />
        </FormField>
      </SectionGrid>
    </FormSection>
  );
}
