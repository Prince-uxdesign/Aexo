import type { Adjustment, Invoice, LineItem, Party } from "../model/types";
import { DEFAULT_CUSTOMIZATION } from "../model/customization";
import {
  createItemId,
  getPaymentTerm,
  paymentTermOptions,
  type CustomizationValues,
  type InvoiceFormValues,
  type ItemValues,
  type PartyValues,
} from "./form-values";

/**
 * Conversions between form values and the `Invoice` model. Pure functions:
 * the form never talks to templates directly, and templates never see form
 * state. A future template engine, PDF export or saved invoice only needs
 * `toInvoice`.
 */

const clean = (text: string) => text.trim() || undefined;

function toParty(values: PartyValues): Party {
  const addressLines = values.address
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    name: values.name.trim(),
    email: clean(values.email),
    phone: clean(values.phone),
    addressLines: addressLines.length ? addressLines : undefined,
    website: clean(values.website),
    taxId: clean(values.taxId),
  };
}

function isBlankItem(item: ItemValues) {
  return !item.name.trim() && !item.description.trim() && !item.unitPrice;
}

function toLineItem(item: ItemValues): LineItem {
  return {
    id: item.id,
    name: item.name.trim(),
    description: clean(item.description),
    quantity: item.quantity ?? 0,
    unit: clean(item.unit),
    unitPrice: item.unitPrice ?? 0,
  };
}

/** Items as the invoice lists them: blank rows dropped, empty numbers as 0. */
export function toLineItems(items: ItemValues[]): LineItem[] {
  return items.filter((item) => !isBlankItem(item)).map(toLineItem);
}

/** No discount when switched off or left empty. */
export function toDiscount(discount: InvoiceFormValues["discount"]): Adjustment | undefined {
  if (discount.type === "none" || !discount.value) return undefined;
  return { type: discount.type, value: discount.value };
}

function paymentTermsText(values: InvoiceFormValues) {
  if (values.paymentTerms === "custom") return clean(values.customTerms);
  return getPaymentTerm(values.paymentTerms).label;
}

/** Presentation only. Blank title/footer fall back downstream; data untouched. */
function toCustomization(values: CustomizationValues): Invoice["customization"] {
  return {
    accent: values.accent,
    title: values.title.trim() || DEFAULT_CUSTOMIZATION.title,
    font: values.font,
    showPayment: values.showPayment,
    showNotes: values.showNotes,
    footerText: clean(values.footerText),
  };
}

/** Form values → the invoice exactly as entered. Blank rows are dropped. */
export function toInvoice(values: InvoiceFormValues): Invoice {
  const payment = {
    bankName: clean(values.payment.bankName),
    accountName: clean(values.payment.accountName),
    accountNumber: clean(values.payment.accountNumber),
    instructions: clean(values.payment.instructions),
  };
  const hasPayment = Object.values(payment).some(Boolean);

  return {
    number: values.number.trim(),
    issueDate: values.issueDate,
    dueDate: values.dueDate || undefined,
    paymentTerms: paymentTermsText(values),
    currency: values.currency,
    locale: values.locale,
    sender: toParty(values.sender),
    recipient: toParty(values.recipient),
    items: toLineItems(values.items),
    discount: toDiscount(values.discount),
    taxRate: values.tax.rate || undefined,
    taxLabel: clean(values.tax.label),
    payment: hasPayment ? payment : undefined,
    notes: clean(values.notes),
    logoUrl: values.logo?.src,
    template: values.template,
    customization: toCustomization(values.customization),
  };
}

/**
 * The invoice as the live preview shows it: like `toInvoice`, but blank
 * essentials get neutral stand-ins, so an empty form still previews as a
 * recognisable invoice instead of a page of gaps.
 */
export function toPreviewInvoice(values: InvoiceFormValues): Invoice {
  const invoice = toInvoice(values);
  return {
    ...invoice,
    number: invoice.number || "INV-0001",
    sender: { ...invoice.sender, name: invoice.sender.name || "Your business" },
    recipient: { ...invoice.recipient, name: invoice.recipient.name || "Client name" },
    items: invoice.items.map((item) => ({ ...item, name: item.name || "Untitled item" })),
  };
}

function fromParty(party: Party): PartyValues {
  return {
    name: party.name ?? "",
    email: party.email ?? "",
    phone: party.phone ?? "",
    address: (party.addressLines ?? []).join("\n"),
    website: party.website ?? "",
    taxId: party.taxId ?? "",
  };
}

/** A stored invoice (e.g. a draft kept on this device) → form values. */
export function fromInvoice(invoice: Invoice, fallback: InvoiceFormValues): InvoiceFormValues {
  const preset = paymentTermOptions.find(
    (option) => option.value !== "custom" && option.label === invoice.paymentTerms,
  );

  return {
    ...fallback,
    number: invoice.number,
    issueDate: invoice.issueDate ?? fallback.issueDate,
    dueDate: invoice.dueDate ?? "",
    paymentTerms: preset ? preset.value : "custom",
    customTerms: preset ? "" : (invoice.paymentTerms ?? ""),
    currency: invoice.currency || fallback.currency,
    locale: invoice.locale || fallback.locale,
    sender: fromParty(invoice.sender),
    logo: invoice.logoUrl ? { src: invoice.logoUrl, fileName: "Logo" } : null,
    recipient: fromParty(invoice.recipient),
    items: invoice.items.length
      ? invoice.items.map((item) => ({
          id: item.id || createItemId(),
          name: item.name ?? "",
          description: item.description ?? "",
          quantity: item.quantity ?? null,
          unit: item.unit ?? "",
          unitPrice: item.unitPrice ?? null,
        }))
      : fallback.items,
    discount: invoice.discount
      ? { type: invoice.discount.type, value: invoice.discount.value }
      : { type: "none", value: null },
    tax: { label: invoice.taxLabel ?? "Tax", rate: invoice.taxRate ?? null },
    payment: {
      bankName: invoice.payment?.bankName ?? "",
      accountName: invoice.payment?.accountName ?? "",
      accountNumber: invoice.payment?.accountNumber ?? "",
      instructions: invoice.payment?.instructions ?? "",
    },
    notes: invoice.notes ?? "",
    template: invoice.template ?? fallback.template,
    customization: {
      accent: invoice.customization?.accent ?? fallback.customization.accent,
      // The default heading is stored explicitly, so round-trips preserve it;
      // a blank field still previews as the default.
      title:
        invoice.customization?.title === DEFAULT_CUSTOMIZATION.title
          ? ""
          : (invoice.customization?.title ?? ""),
      font: invoice.customization?.font ?? fallback.customization.font,
      showPayment: invoice.customization?.showPayment ?? true,
      showNotes: invoice.customization?.showNotes ?? true,
      footerText: invoice.customization?.footerText ?? "",
    },
  };
}
