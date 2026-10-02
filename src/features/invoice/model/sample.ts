import type { Invoice } from "./types";

/**
 * Example invoice used for previews on the landing page and in template
 * thumbnails. Names are fictional.
 */
export const sampleInvoice: Invoice = {
  number: "INV-0142",
  issueDate: "2026-10-02",
  dueDate: "2026-11-01",
  paymentTerms: "Net 30",
  currency: "USD",
  locale: "en-US",
  template: "classic",
  sender: {
    name: "Lumen Studio",
    contactName: "Ada Mensah",
    email: "hello@lumenstudio.example",
    addressLines: ["48 Harbour Road", "Accra, Ghana"],
  },
  recipient: {
    name: "Harbor & Pine Co.",
    contactName: "Daniel Reyes",
    email: "accounts@harborpine.example",
    addressLines: ["210 Market Street", "San Francisco, CA 94105"],
  },
  items: [
    {
      id: "1",
      name: "Brand identity",
      description: "Logo, colour system and typography",
      quantity: 1,
      unit: "project",
      unitPrice: 4800,
    },
    {
      id: "2",
      name: "Website design",
      description: "Six responsive page designs",
      quantity: 40,
      unit: "hours",
      unitPrice: 95,
    },
    { id: "3", name: "Launch support", quantity: 3, unit: "days", unitPrice: 600 },
  ],
  discount: { type: "percent", value: 5 },
  taxRate: 7.5,
  taxLabel: "VAT",
  payment: {
    bankName: "First Coast Bank",
    accountName: "Lumen Studio Ltd",
    accountNumber: "0123 4567 89",
    instructions: "Please use INV-0142 as the payment reference.",
  },
  notes: "Thank you for working with us.",
};
