import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { iconSize, iconStroke } from "@/components/ui";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { computeTotals } from "@/features/invoice/model/totals";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { getSharedInvoice } from "@/features/invoices/queries";
import { cn } from "@/lib/utils/cn";

export async function generateMetadata({ params }: PageProps<"/i/[shareId]">): Promise<Metadata> {
  const { shareId } = await params;
  const shared = await getSharedInvoice(shareId);
  if (!shared) return { title: "Invoice not available" };
  const sender = shared.data.sender.name || "A business";
  return {
    title: `Invoice ${shared.data.number} from ${sender}`,
    description: `Invoice ${shared.data.number} from ${sender}. View the amount due and payment details.`,
    // Shared-by-link pages must never appear in search results.
    robots: { index: false, follow: false },
  };
}

/**
 * The public invoice page. No account needed. Renders the owner's selected
 * template from the live invoice data, plus a full-size summary (amount due,
 * due date, bill-to) so a phone recipient never needs to pinch-zoom.
 * Only invoice content is shown: no ids, no account data, no metadata.
 */
export default async function SharedInvoicePage({ params }: PageProps<"/i/[shareId]">) {
  const { shareId } = await params;
  const shared = await getSharedInvoice(shareId);
  if (!shared) notFound();

  const invoice = shared.data;
  const { total } = computeTotals(invoice);
  const sender = invoice.sender.name || "A business";
  const email = invoice.sender.email?.trim() || "";
  const facts = [
    {
      label: "Amount due",
      value: formatMoney(total, invoice.currency, invoice.locale),
      emphasis: true,
    },
    {
      label: "Due",
      value: invoice.dueDate ? formatDate(invoice.dueDate, invoice.locale, "short") : "Not set",
    },
    { label: "Bill to", value: invoice.recipient.name || "—" },
  ];

  return (
    <main id="main" className="flex-1 py-6 md:py-10">
      <Container className="flex max-w-3xl flex-col gap-5 md:gap-6">
        <section
          aria-labelledby="shared-heading"
          className="min-w-0 rounded-lg border border-border bg-surface p-5 sm:p-6"
        >
          <p className="text-label font-normal text-muted">Shared invoice</p>
          <h1 id="shared-heading" className="mt-1 text-h2 break-words text-ink">
            {invoice.number} from {sender}
          </h1>

          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
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

          {email ? (
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-label text-ink underline-offset-4 hover:underline"
            >
              <Mail size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
              Questions? Contact {sender}
            </a>
          ) : null}
        </section>

        <InvoiceDocument
          invoice={invoice}
          overflow="grow"
          label={`Invoice ${invoice.number} from ${sender}`}
          className="border border-border shadow-elevated"
        />

        <footer className="flex flex-col items-center gap-1 pb-4 text-center">
          <p className="text-caption text-muted">
            Sent with {siteConfig.name} ·{" "}
            <Link href={routes.home} className="underline underline-offset-4 hover:text-ink">
              Create your own professional invoices
            </Link>
          </p>
        </footer>
      </Container>
    </main>
  );
}
