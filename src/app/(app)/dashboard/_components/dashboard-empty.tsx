import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonStyles, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { sampleInvoice } from "@/features/invoice/model/sample";

const steps = ["Add your details", "Pick a template", "Send, share or download"];

/**
 * First visit, no invoices yet: what to do next, and (from 768px) a real
 * invoice peeking up from the panel's bottom edge, like the auth pages.
 */
export function DashboardEmpty() {
  return (
    <section
      aria-labelledby="empty-title"
      className="grid overflow-hidden rounded-xl bg-mist sm:rounded-3xl md:grid-cols-[1fr_auto]"
    >
      <div className="flex flex-col items-start gap-4 p-6 sm:p-10">
        <h2 id="empty-title" className="text-h2 text-ink">
          No invoices yet.
        </h2>
        <p className="max-w-md text-body text-muted">
          Create your first invoice and it will appear here, ready to send, track and get paid.
        </p>
        <ol className="flex flex-col gap-2.5 py-2">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-body text-ink">
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-white text-caption font-medium text-sky-700 shadow-soft"
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <Link href={routes.createInvoice} className={buttonStyles({ className: "shadow-soft" })}>
          <Plus size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
          Create invoice
        </Link>
      </div>

      <div
        aria-hidden
        className="hidden w-64 self-end pt-10 pr-10 md:block lg:w-80 lg:pr-14 xl:w-96"
      >
        <InvoiceDocument
          invoice={sampleInvoice}
          template="modern"
          aspect="600 / 520"
          className="animate-envelope-in rounded-b-none shadow-lift"
        />
      </div>
    </section>
  );
}
