import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { InvoiceWorkspace } from "@/features/invoice/workspace/invoice-workspace";
import { STATUS_LABELS, STATUS_TONES } from "@/features/invoices/model";
import { getInvoice } from "@/features/invoices/queries";

export const metadata: Metadata = {
  title: "Edit invoice",
  description: "Update your saved invoice.",
};

/** Open a saved invoice for editing. Unknown ids (or someone else's) 404. */
export default async function EditInvoicePage({ params }: PageProps<"/invoices/[id]">) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  return (
    <>
      <Container className="pt-6">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 lg:max-w-none">
          <Link
            href={routes.dashboard}
            className="inline-flex min-h-11 items-center gap-1.5 text-label text-muted transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden />
            Back to invoices
          </Link>
          <Badge tone={STATUS_TONES[invoice.status]}>{STATUS_LABELS[invoice.status]}</Badge>
        </div>
      </Container>
      <InvoiceWorkspace saved={{ id: invoice.id, invoice: invoice.data }} />
    </>
  );
}
