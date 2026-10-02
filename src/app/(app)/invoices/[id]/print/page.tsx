import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { getInvoice } from "@/features/invoices/queries";
import { PrintTrigger } from "./_components/print-trigger";

export async function generateMetadata({
  params,
}: PageProps<"/invoices/[id]/print">): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) return { title: "Invoice not found" };
  return {
    title: `Print invoice ${invoice.data.number}`,
    description: "Print-friendly invoice.",
    robots: { index: false, follow: false },
  };
}

/**
 * Print view: the same invoice document, framed at the printable width so it
 * renders at true size, with the browser dialog opened automatically. Print
 * or Save-as-PDF from the dialog — both come from this identical source, so
 * the PDF matches the preview. Unknown or foreign ids 404 like elsewhere.
 */
export default async function InvoicePrintPage({ params }: PageProps<"/invoices/[id]/print">) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  return (
    <main id="main" className="print:bg-white flex-1 bg-canvas py-6 print:py-0">
      <Container className="flex max-w-3xl flex-col gap-5 print:max-w-none print:px-0">
        <div
          data-print-screen-only
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 print:hidden"
        >
          <Link
            href={routes.invoice(invoice.id)}
            className="inline-flex min-h-11 items-center gap-1.5 text-label text-muted transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden />
            Back to invoice
          </Link>
          <PrintTrigger />
        </div>

        {/* Printable width (≈190mm): container units resolve to true print size. */}
        <div className="mx-auto w-full max-w-[190mm]">
          <InvoiceDocument
            invoice={invoice.data}
            overflow="grow"
            label={`Invoice ${invoice.data.number}, print version`}
          />
        </div>

        <p data-print-screen-only className="pb-4 text-center text-caption text-muted print:hidden">
          Use your browser&apos;s dialog to print or save as PDF.
        </p>
      </Container>
    </main>
  );
}
