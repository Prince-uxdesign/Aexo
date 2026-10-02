import { calcSubtotal, validateDiscount, validateTaxRate } from "../model/totals";
import type { InvoiceFormValues, ItemValues } from "./form-values";

/**
 * Field-level checks for the invoice form. Messages are human and say how to
 * fix the problem (guide §21). Keys are field paths ("sender.email",
 * "items.<id>.name") that the form uses to place each message.
 *
 * Item/discount/tax rules delegate to the calculation engine
 * (`../model/totals`) so the form and the engine can never disagree.
 */
export type FormErrors = Partial<Record<string, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const itemPath = (id: string, field: keyof ItemValues) => `items.${id}.${field}`;

function isBlankItem(item: ItemValues) {
  return !item.name.trim() && !item.description.trim() && !item.unitPrice;
}

export function validateInvoiceForm(values: InvoiceFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.number.trim()) errors.number = "Add an invoice number, like INV-0001.";
  if (!values.issueDate) errors.issueDate = "Choose the date this invoice is issued.";
  if (values.dueDate && values.issueDate && values.dueDate < values.issueDate) {
    errors.dueDate = "The due date can't be before the issue date.";
  }

  if (!values.sender.name.trim()) errors["sender.name"] = "Add your business name or your name.";
  if (!values.recipient.name.trim()) errors["recipient.name"] = "Add who you're billing.";
  for (const party of ["sender", "recipient"] as const) {
    const email = values[party].email.trim();
    if (email && !EMAIL.test(email)) {
      errors[`${party}.email`] = "Enter a valid email address, like name@example.com.";
    }
  }

  const filled = values.items.filter((item) => !isBlankItem(item));
  if (filled.length === 0 && values.items[0]) {
    errors[itemPath(values.items[0].id, "name")] = "Add at least one product or service.";
  }
  for (const item of filled) {
    if (!item.name.trim()) errors[itemPath(item.id, "name")] = "Add a name for this item.";
    if (item.quantity === null || !Number.isFinite(item.quantity)) {
      errors[itemPath(item.id, "quantity")] = "Enter a quantity.";
    } else if (item.quantity <= 0) {
      errors[itemPath(item.id, "quantity")] = "Enter a quantity above 0.";
    }
    if (item.unitPrice === null || !Number.isFinite(item.unitPrice)) {
      errors[itemPath(item.id, "unitPrice")] = "Enter a valid price.";
    } else if (item.unitPrice < 0) {
      errors[itemPath(item.id, "unitPrice")] = "Enter a valid price.";
    }
  }

  // Subtotal of entered (non-blank) lines, so fixed-discount validation
  // matches what the totals show.
  const subtotal = calcSubtotal(
    filled.map((item) => ({
      quantity: item.quantity ?? 0,
      unitPrice: item.unitPrice ?? 0,
    })),
  );
  const discountError = validateDiscount(values.discount, subtotal);
  if (discountError) errors["discount.value"] = discountError;

  const taxError = validateTaxRate(values.tax.rate);
  if (taxError) errors["tax.rate"] = taxError;

  return errors;
}
