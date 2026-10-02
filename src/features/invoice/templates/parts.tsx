import type { ReactNode } from "react";
import { formatDiscountLine, formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils/cn";
import {
  accentClasses,
  invoiceFontClass,
  resolveCustomization,
  type ResolvedCustomization,
} from "../model/customization";
import { computeTotals, lineAmount } from "../model/totals";
import type { Invoice, Party } from "../model/types";

/**
 * Building blocks shared by the invoice templates. Templates arrange and style
 * these; they never compute or reformat data themselves.
 * Everything here is sized in document units (see .invoice-doc in globals.css).
 */

export function invoiceView(invoice: Invoice) {
  const totals = computeTotals(invoice);
  const custom = resolveCustomization(invoice);
  const money = (value: number) => formatMoney(value, invoice.currency, invoice.locale);
  const date = (iso?: string) => (iso ? formatDate(iso, invoice.locale) : undefined);
  const discountLabel =
    invoice.discount?.type === "percent" ? `Discount (${invoice.discount.value}%)` : "Discount";
  const taxLabel = `${invoice.taxLabel ?? "Tax"}${invoice.taxRate ? ` (${invoice.taxRate}%)` : ""}`;
  return { totals, money, date, discountLabel, taxLabel, custom };
}

/** Class for a template root: the chosen document typeface. */
export function templateFontClass(invoice: Invoice): string {
  return invoiceFontClass(resolveCustomization(invoice).font);
}

/** The document heading ("Invoice" by default). Casing is per-template styling. */
export function DocTitle({
  custom,
  className,
}: {
  custom: ResolvedCustomization;
  className?: string;
}) {
  return <p className={className}>{custom.title}</p>;
}

/** Small solid marker before section labels. Only the Accent template uses it. */
export function AccentMark({
  custom,
  className,
}: {
  custom: ResolvedCustomization;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-xs", accentClasses(custom.accent).solid, className)}
    />
  );
}

export function DocLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-doc-xs font-medium tracking-[0.08em] text-muted uppercase", className)}>
      {children}
    </p>
  );
}

export function PartyBlock({
  label,
  party,
  marker,
}: {
  label: string;
  party: Party;
  /** Optional element before the label (Accent template's coral marker). */
  marker?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {marker}
        <DocLabel>{label}</DocLabel>
      </div>
      <div className="flex flex-col">
        <p className="text-doc-md font-medium">{party.name}</p>
        {party.contactName ? <p className="text-muted">{party.contactName}</p> : null}
        {party.addressLines?.map((line, index) => (
          // Lines can repeat ("Suite 1" twice is unlikely but legal), so index keys.
          <p key={index} className="text-muted">
            {line}
          </p>
        ))}
        {party.email ? <p className="text-muted">{party.email}</p> : null}
        {party.phone ? <p className="text-muted">{party.phone}</p> : null}
        {party.website ? <p className="text-muted">{party.website}</p> : null}
        {party.taxId ? <p className="text-muted">Tax ID {party.taxId}</p> : null}
      </div>
    </div>
  );
}

export function MetaList({
  invoice,
  className,
  itemClassName,
}: {
  invoice: Invoice;
  className?: string;
  itemClassName?: string;
}) {
  const { date } = invoiceView(invoice);
  const rows = [
    { label: "Issue date", value: date(invoice.issueDate) },
    { label: "Due date", value: date(invoice.dueDate) },
    { label: "Terms", value: invoice.paymentTerms },
  ].filter((row) => row.value);

  return (
    <dl className={className}>
      {rows.map((row) => (
        <div key={row.label} className={cn("flex flex-col gap-0.5", itemClassName)}>
          <dt>
            <DocLabel>{row.label}</DocLabel>
          </dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type ItemsTableProps = {
  invoice: Invoice;
  /** lined: rules between rows · minimal: header rule only · dense: tighter, shaded header. */
  variant?: "lined" | "minimal" | "dense";
};

export function ItemsTable({ invoice, variant = "lined" }: ItemsTableProps) {
  const { money } = invoiceView(invoice);
  const dense = variant === "dense";
  const cell = dense ? "py-1.5" : "py-3";

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className={cn(variant === "dense" ? "bg-surface-alt" : "border-b border-ink")}>
          <th className={cn("w-full pr-3 font-normal", dense ? "py-1.5 pl-2" : "pb-2")}>
            <DocLabel>Item</DocLabel>
          </th>
          <th
            className={cn(
              "px-3 text-right font-normal whitespace-nowrap",
              dense ? "py-1.5" : "pb-2",
            )}
          >
            <DocLabel>Qty</DocLabel>
          </th>
          <th
            className={cn(
              "px-3 text-right font-normal whitespace-nowrap",
              dense ? "py-1.5" : "pb-2",
            )}
          >
            <DocLabel>Price</DocLabel>
          </th>
          <th
            className={cn(
              "pl-3 text-right font-normal whitespace-nowrap",
              dense ? "py-1.5 pr-2" : "pb-2",
            )}
          >
            <DocLabel>Amount</DocLabel>
          </th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((item) => (
          <tr
            key={item.id}
            className={cn(
              variant === "lined" && "border-b border-border",
              variant === "dense" && "border-b border-border",
            )}
          >
            <td className={cn("pr-3 align-top", cell, dense && "pl-2")}>
              <p className="font-medium">{item.name}</p>
              {item.description && !dense ? (
                <p className="text-doc-sm text-muted">{item.description}</p>
              ) : null}
            </td>
            <td className={cn("px-3 text-right align-top whitespace-nowrap", cell)}>
              {item.quantity}
              {item.unit ? <span className="text-muted"> {item.unit}</span> : null}
            </td>
            <td className={cn("px-3 text-right align-top whitespace-nowrap", cell)}>
              {money(item.unitPrice)}
            </td>
            <td
              className={cn("pl-3 text-right align-top whitespace-nowrap", cell, dense && "pr-2")}
            >
              {money(lineAmount(item))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type TotalsProps = {
  invoice: Invoice;
  className?: string;
  /** Classes for the "Total" row, so templates can emphasise it their own way. */
  totalClassName?: string;
  totalLabel?: ReactNode;
};

export function TotalsBlock({
  invoice,
  className,
  totalClassName,
  totalLabel = "Total",
}: TotalsProps) {
  const { totals, money, discountLabel, taxLabel } = invoiceView(invoice);
  const rows = [
    { label: "Subtotal", value: money(totals.subtotal) },
    totals.discount
      ? {
          label: discountLabel,
          value: formatDiscountLine(totals.discount, invoice.currency, invoice.locale),
        }
      : null,
    invoice.taxRate ? { label: taxLabel, value: money(totals.tax) } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <dl className={cn("flex flex-col gap-1.5", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-6">
          <dt className="text-muted">{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
      <div className={cn("mt-1.5 flex items-baseline justify-between gap-6", totalClassName)}>
        <dt className="font-medium">{totalLabel}</dt>
        <dd className="text-doc-lg font-medium">{money(totals.total)}</dd>
      </div>
    </dl>
  );
}

export function PaymentBlock({ invoice, marker }: { invoice: Invoice; marker?: ReactNode }) {
  const { custom } = invoiceView(invoice);
  if (!custom.showPayment) return null;
  const payment = invoice.payment;
  if (!payment) return null;
  const rows = [
    { label: "Bank", value: payment.bankName },
    { label: "Account name", value: payment.accountName },
    { label: "Account number", value: payment.accountNumber },
    ...(payment.extra ?? []),
  ].filter((row) => row.value);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {marker}
        <DocLabel>Payment details</DocLabel>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
        {rows.map((row) => (
          <div key={row.label} className="col-span-2 grid grid-cols-subgrid">
            <dt className="text-muted">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {payment.instructions ? (
        <p className="text-doc-sm text-muted">{payment.instructions}</p>
      ) : null}
    </div>
  );
}

export function NotesBlock({ invoice, marker }: { invoice: Invoice; marker?: ReactNode }) {
  const { custom } = invoiceView(invoice);
  if (!custom.showNotes || !invoice.notes) return null;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {marker}
        <DocLabel>Notes</DocLabel>
      </div>
      <p className="whitespace-pre-line">{invoice.notes}</p>
    </div>
  );
}

/** Logo if provided, otherwise the business name set as a wordmark. */
export function SenderMark({ invoice, className }: { invoice: Invoice; className?: string }) {
  if (invoice.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URLs, printed as-is
      <img
        src={invoice.logoUrl}
        alt={invoice.sender.name}
        // Fixed height, fluid width, never wider than the column: wide and tall
        // logos keep their aspect ratio and can't break the layout.
        className={cn("h-10 w-auto max-w-full object-contain", className)}
      />
    );
  }
  return (
    <p className={cn("min-w-0 text-doc-lg font-medium tracking-[-0.01em]", className)}>
      {invoice.sender.name}
    </p>
  );
}

/** Optional centred footer line. Renders nothing when the text is empty. */
export function FooterBlock({ invoice }: { invoice: Invoice }) {
  const { custom } = invoiceView(invoice);
  if (!custom.footerText) return null;
  return <p className="pt-1 text-center text-doc-sm text-muted">{custom.footerText}</p>;
}
