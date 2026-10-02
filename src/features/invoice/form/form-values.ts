import { addDays } from "@/lib/format/date";
import { DEFAULT_CUSTOMIZATION, type AccentId, type InvoiceFontId } from "../model/customization";
import type { Adjustment, TemplateId } from "../model/types";

/**
 * What the invoice form holds while someone types.
 *
 * This is deliberately not the `Invoice` model: inputs need empty states
 * (`null` numbers, blank strings), multi-line text for addresses and UI-only
 * choices (which payment-terms preset is selected). `form-mapping.ts` turns
 * these values into an `Invoice` for previews, templates and storage.
 */

export type PartyValues = {
  name: string;
  email: string;
  phone: string;
  /** Multi-line text; each line becomes an address line on the invoice. */
  address: string;
  website: string;
  taxId: string;
};

export type ItemValues = {
  id: string;
  name: string;
  description: string;
  quantity: number | null;
  unit: string;
  unitPrice: number | null;
};

export type LogoValue = {
  /** Data URL of the chosen image. Uploading to storage comes with saved invoices. */
  src: string;
  fileName: string;
};

/** Template presentation. Edits here never touch calculations or data. */
export type CustomizationValues = {
  accent: AccentId;
  /** Blank means the default heading ("Invoice"). */
  title: string;
  font: InvoiceFontId;
  showPayment: boolean;
  showNotes: boolean;
  footerText: string;
};

export type InvoiceFormValues = {
  number: string;
  issueDate: string;
  dueDate: string;
  /** A preset id from `paymentTermOptions`, or "custom". */
  paymentTerms: PaymentTermId;
  /** Free text used when `paymentTerms` is "custom", e.g. "50% upfront". */
  customTerms: string;
  currency: string;
  locale: string;
  sender: PartyValues;
  logo: LogoValue | null;
  recipient: PartyValues;
  items: ItemValues[];
  discount: { type: Adjustment["type"] | "none"; value: number | null };
  tax: { label: string; rate: number | null };
  payment: { bankName: string; accountName: string; accountNumber: string; instructions: string };
  notes: string;
  template: TemplateId;
  customization: CustomizationValues;
};

/* ------------------------------------------------------------- Payment terms */

export const paymentTermOptions = [
  { value: "receipt", label: "Due on receipt", days: 0 },
  { value: "net7", label: "Net 7", days: 7 },
  { value: "net14", label: "Net 14", days: 14 },
  { value: "net30", label: "Net 30", days: 30 },
  { value: "net45", label: "Net 45", days: 45 },
  { value: "net60", label: "Net 60", days: 60 },
  { value: "custom", label: "Custom", days: null },
] as const;

export type PaymentTermId = (typeof paymentTermOptions)[number]["value"];

export function getPaymentTerm(id: PaymentTermId) {
  return paymentTermOptions.find((option) => option.value === id) ?? paymentTermOptions[3];
}

/** The due date a preset implies, or null for custom terms. */
export function dueDateForTerms(issueDate: string, terms: PaymentTermId) {
  const { days } = getPaymentTerm(terms);
  if (days === null || !issueDate) return null;
  return addDays(issueDate, days) || null;
}

/* ---------------------------------------------------------------- Currencies */

/** Offered first; any other ISO 4217 code still renders correctly. */
export const currencyCodes = [
  "USD",
  "EUR",
  "GBP",
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

/* ------------------------------------------------------------------ Defaults */

export const unitSuggestions = ["hours", "days", "items", "project", "months", "words"];

let itemCounter = 0;

/** Stable, unique id for a new line item. Never derived from position. */
export function createItemId() {
  itemCounter += 1;
  return `item-${Date.now().toString(36)}-${itemCounter}`;
}

export function emptyItem(id = createItemId()): ItemValues {
  return {
    id,
    name: "",
    description: "",
    quantity: 1,
    unit: "",
    unitPrice: null,
  };
}

const emptyParty: PartyValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  taxId: "",
};

/**
 * A fresh invoice. `today` is passed in because it must come from the
 * person's browser (their time zone), never from the server or the build.
 */
export function createDefaultValues({
  today,
  template = "classic",
}: {
  today: string;
  template?: TemplateId;
}): InvoiceFormValues {
  return {
    number: "INV-0001",
    issueDate: today,
    dueDate: today ? (dueDateForTerms(today, "net30") ?? "") : "",
    paymentTerms: "net30",
    customTerms: "",
    currency: "USD",
    locale: "en-US",
    sender: { ...emptyParty },
    logo: null,
    recipient: { ...emptyParty },
    // Fixed id: the first render happens on the server too, and must match.
    items: [emptyItem("item-1")],
    discount: { type: "none", value: null },
    tax: { label: "Tax", rate: null },
    payment: { bankName: "", accountName: "", accountNumber: "", instructions: "" },
    notes: "",
    template,
    customization: {
      accent: DEFAULT_CUSTOMIZATION.accent,
      title: "",
      font: DEFAULT_CUSTOMIZATION.font,
      showPayment: true,
      showNotes: true,
      footerText: "",
    },
  };
}
