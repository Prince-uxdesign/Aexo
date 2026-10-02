import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { computeTotals } from "@/features/invoice/model/totals";
import { getTemplate } from "@/features/invoice/templates";
import { STATUS_LABELS, STATUS_TONES } from "@/features/invoices/model";
import { getInvoice } from "@/features/invoices/queries";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils/cn";
import { DetailActions } from "./_components/detail-actions";

export async function generateMetadata({ params }: PageProps<"/invoices/[id]">): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) return { title: "Invoice not found" };
  return {
    title: `Invoice ${invoice.data.number}`,
    description: `View invoice ${invoice.data.number}.`,
  };
}

/**
 * The invoice detail page: complete state at a glance, rendered through the
 * existing preview system (selected template, logo included automatically).
 * Editing lives one tap away; this page never edits. Unknown or foreign ids
 * 404 without leaking anything.
 */
export default async function InvoiceDetailPage({ params }: PageProps<"/invoices/[id]">) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const data = invoice.data;
  const { total } = computeTotals(data);
  const { name: templateName } = getTemplate(data.template);
  const facts = [
    {
      label: "Total",
      value: formatMoney(total, data.currency, data.locale),
      emphasis: true,
    },
    {
      label: "Issued",
      value: data.issueDate ? formatDate(data.issueDate, data.locale, "short") : "—",
    },
    {
      label: "Due",
      value: data.dueDate ? formatDate(data.dueDate, data.locale, "short") : "Not set",
    },
    { label: "Bill to", value: data.recipient.name || "—" },
  ];

  return (
    <main id="main" className="flex-1 py-6 md:py-8">
      <Container className="flex max-w-3xl flex-col gap-5 md:gap-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={routes.dashboard}
            className="inline-flex min-h-11 items-center gap-1.5 text-label text-muted transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden />
            Back to invoices
          </Link>
          <Badge tone={STATUS_TONES[invoice.status]}>{STATUS_LABELS[invoice.status]}</Badge>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-h2 break-words text-ink">{data.number || "Untitled invoice"}</h1>
          <p className="text-label font-normal text-muted">{templateName} template</p>
        </div>

        <DetailActions id={invoice.id} number={data.number || "Untitled invoice"} />

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className={cn(
                "flex min-w-0 flex-col gap-0.5 bg-surface-alt px-4 py-3",
                fact.emphasis && "col-span-2 sm:col-span-1",
              )}
            >
              <dt className="text-caption text-muted">{fact.label}</dt>
              <dd
                className={cn(
                  "break-words text-ink tabular-nums",
                  fact.emphasis ? "text-h3" : "text-body",
                )}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <InvoiceDocument
          invoice={data}
          overflow="grow"
          label={`Invoice ${data.number}`}
          className="border border-border shadow-elevated"
        />
      </Container>
    </main>
  );
}
