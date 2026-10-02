"use client";

import { AdjustmentsSection } from "./sections/adjustments-section";
import { InvoiceDetailsSection } from "./sections/invoice-details-section";
import { ItemsSection } from "./sections/items-section";
import { NotesSection } from "./sections/notes-section";
import { PartySection } from "./sections/party-section";
import { PaymentSection } from "./sections/payment-section";
import { TemplateSection } from "./sections/template-section";

/**
 * The invoice form, one section per step. Invoice details come first because
 * the currency chosen there formats every amount below it. Same order on every
 * screen size, so nothing moves when a phone rotates.
 */
export function InvoiceForm() {
  return (
    <form
      aria-label="Invoice"
      noValidate
      // Nothing submits: actions live in the workspace. Enter in a field must not reload the page.
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-4 md:gap-5"
    >
      <InvoiceDetailsSection step={1} />
      <PartySection party="sender" step={2} />
      <PartySection party="recipient" step={3} />
      <ItemsSection step={4} />
      <AdjustmentsSection step={5} />
      <PaymentSection step={6} />
      <NotesSection step={7} />
      <TemplateSection step={8} />
    </form>
  );
}
