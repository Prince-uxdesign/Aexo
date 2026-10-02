"use client";

import { useId } from "react";
import { Maximize2 } from "lucide-react";
import { Button, iconSize, iconStroke } from "@/components/ui";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils/cn";
import { InvoiceDocument } from "../components/invoice-document";
import { usePreviewInvoice } from "../form/form-context";
import { computeTotals } from "../model/totals";
import { getTemplate } from "../templates";

/**
 * Preview at the end of the form on phones and tablets (below 1024px).
 *
 * A whole A4 page on a 390px phone is too small to read, so the essentials
 * (total, due date, client) are repeated above it at full UI size. The page
 * itself keeps its true proportions and opens full screen, where it can be
 * zoomed. On tablets the page is ~700px wide and comfortably readable.
 */
export function MobilePreview({
  onExpand,
  className,
}: {
  onExpand: () => void;
  className?: string;
}) {
  const invoice = usePreviewInvoice();
  const headingId = useId();
  const { name } = getTemplate(invoice.template);
  const { total } = computeTotals(invoice);

  const facts = [
    {
      label: "Total",
      value: formatMoney(total, invoice.currency, invoice.locale),
      emphasis: true,
    },
    {
      label: "Due",
      value: invoice.dueDate ? formatDate(invoice.dueDate, invoice.locale, "short") : "Not set",
    },
    { label: "Bill to", value: invoice.recipient.name },
  ];

  return (
    <section
      id="preview"
      aria-labelledby={headingId}
      className={cn(
        "min-w-0 scroll-mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6",
        className,
      )}
    >
      <header className="mb-5 flex items-start gap-3">
        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-accent" />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={headingId} className="text-h3 text-ink">
            Preview
          </h2>
          <p className="text-label font-normal text-muted">{name} template · updates as you type</p>
        </div>
      </header>

      {/* Values wrap rather than truncate: a clipped total is worse than a taller box. */}
      <dl className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
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

      {/* A tap on the page opens it full screen. Keyboard users have the button below. */}
      <div onClick={onExpand} className="cursor-zoom-in rounded-md bg-surface-alt p-3 sm:p-6">
        <InvoiceDocument
          invoice={invoice}
          overflow="grow"
          label={`Preview of invoice ${invoice.number}`}
          className="shadow-elevated"
        />
      </div>

      <Button
        variant="secondary"
        onClick={onExpand}
        leadingIcon={<Maximize2 size={iconSize.md} strokeWidth={iconStroke} />}
        className="mt-4 w-full sm:w-auto"
      >
        Open full preview
      </Button>
    </section>
  );
}
