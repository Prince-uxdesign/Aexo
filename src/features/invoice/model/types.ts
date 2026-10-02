/**
 * The invoice data model. Pure data: no presentation.
 * Every template renders this same shape (guide §13, §25).
 */

export type TemplateId = "classic" | "modern" | "accent" | "compact";

/** ISO 4217 code, e.g. "USD". Calculation logic never branches on this. */
export type CurrencyCode = string;

/** BCP 47 locale used only for formatting, e.g. "en-US". */
export type LocaleCode = string;

export type DiscountType = "percent" | "fixed";

/** Curated accent set for the Accent template (see `./customization`). */
export type AccentId = "coral" | "ink" | "pine" | "harbor";

/** Document typeface. Sans (Inter) is the default; serif is Georgia. */
export type InvoiceFontId = "sans" | "serif";

export type Party = {
  name: string;
  /** Person to address, when the party is a business. */
  contactName?: string;
  email?: string;
  phone?: string;
  /** Free-form lines, e.g. ["12 Market Street", "Lagos 100001", "Nigeria"]. */
  addressLines?: string[];
  website?: string;
  /** VAT number, EIN, TIN… Shown as "Tax ID". */
  taxId?: string;
};

export type LineItem = {
  id: string;
  name: string;
  description?: string;
  /** Must be finite and >= 0. Decimals allowed (e.g. 1.5 hours). */
  quantity: number;
  /** e.g. "hours", "days", "project". Optional. */
  unit?: string;
  /** Must be finite and >= 0. Decimals allowed. */
  unitPrice: number;
  /** Derived: quantity × unitPrice, rounded. Never stored — always computed. */
  // amount?: never — use `lineAmount(item)` from ./totals.
};

export type Adjustment = {
  type: DiscountType;
  /** Percent: 0–100. Fixed: >= 0, clamped to the subtotal by the engine. */
  value: number;
};

export type PaymentDetails = {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  /** IBAN, SWIFT/BIC, sort code, routing number… shown as label/value pairs. */
  extra?: { label: string; value: string }[];
  /** Free-text instructions, e.g. "Please include the invoice number as reference." */
  instructions?: string;
};

export type InvoiceCustomization = {
  /** Curated accent set — free colour pickers end in neon invoices. */
  accent: AccentId;
  /** Document heading. Blank falls back to "Invoice". */
  title: string;
  font: InvoiceFontId;
  /** Display switches. The underlying data stays even when hidden. */
  showPayment: boolean;
  showNotes: boolean;
  /** One centred line at the bottom of the document. Empty means none. */
  footerText?: string;
};

export type Invoice = {
  number: string;
  /** ISO dates: "2026-10-02". */
  issueDate: string;
  dueDate?: string;
  /** Display text, e.g. "Net 30" or "Due on receipt". */
  paymentTerms?: string;
  /** ISO 4217 code. Currency-independent math; formatting only. */
  currency: CurrencyCode;
  /** Formatting locale for numbers and dates, e.g. "en-US". */
  locale: LocaleCode;
  sender: Party;
  recipient: Party;
  items: LineItem[];
  discount?: Adjustment;
  /** Percentage, applied after discount. */
  taxRate?: number;
  taxLabel?: string;
  payment?: PaymentDetails;
  notes?: string;
  /** Optional logo as a URL or data URL. */
  logoUrl?: string;
  template: TemplateId;
  /** Presentation only — never affects calculations or data. */
  customization?: InvoiceCustomization;
};
