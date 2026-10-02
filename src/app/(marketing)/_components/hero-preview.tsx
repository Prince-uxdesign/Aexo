import { Download, Link2, Printer } from "lucide-react";
import { Badge, iconSize, iconStroke } from "@/components/ui";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { computeTotals } from "@/features/invoice/model/totals";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils/cn";

/**
 * The hero visual: a real Aexo invoice rendered by the Classic template, plus a
 * summary card at normal UI size.
 *
 * The document scales with its frame. On phones it is a recognisable page but
 * too small to read, so the summary card carries the important figures at a
 * readable size on every screen. Proportions per breakpoint:
 * - Phones: page ~74% of the stage, card overlapping its lower right.
 * - 640–1279px (tablets): page and card side by side, centred. The page is
 *   capped at 480px so it stays shorter than a landscape tablet screen.
 * - From 1280px: page ~88% of the column, running off the bottom of a 704px
 *   stage, with the card overlapping its lower left.
 */
export function HeroPreview() {
  const invoice = sampleInvoice;
  const totals = computeTotals(invoice);
  const total = formatMoney(totals.total, invoice.currency, invoice.locale);
  const due = invoice.dueDate ? formatDate(invoice.dueDate, invoice.locale, "monthDay") : undefined;

  return (
    <figure
      className={cn(
        "relative rounded-xl border border-border bg-surface-alt p-4",
        "sm:flex sm:items-center sm:justify-center sm:gap-6 sm:p-8 md:gap-8",
        // From 1280px the stage has a fixed height and the page runs off its bottom
        // edge, so the document stays large without making the hero taller than the screen.
        "xl:block xl:h-176 xl:overflow-hidden xl:p-10 xl:pb-0",
      )}
    >
      <div className="w-[74%] sm:w-[60%] sm:max-w-120 xl:ml-auto xl:w-[88%] xl:max-w-none">
        <InvoiceDocument invoice={invoice} className="shadow-elevated" />
      </div>

      <div
        className={cn(
          "absolute right-4 bottom-4 w-[58%] max-w-72",
          "sm:static sm:w-[36%] sm:max-w-72",
          "xl:absolute xl:bottom-10 xl:left-10 xl:w-64 2xl:w-72",
        )}
      >
        <SummaryCard
          number={invoice.number}
          recipient={invoice.recipient.name}
          total={total}
          due={due}
        />
      </div>

      <figcaption className="sr-only">
        Example invoice {invoice.number} from {invoice.sender.name} to {invoice.recipient.name},
        total {total}
        {due ? `, due ${due}` : ""}.
      </figcaption>
    </figure>
  );
}

function SummaryCard({
  number,
  recipient,
  total,
  due,
}: {
  number: string;
  recipient: string;
  total: string;
  due?: string;
}) {
  const outputs = [
    { label: "PDF", icon: Download },
    { label: "Print", icon: Printer },
    { label: "Link", icon: Link2 },
  ];

  return (
    <div aria-hidden className="rounded-lg bg-surface p-4 shadow-elevated sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-caption text-muted">{number}</p>
        {due ? <Badge tone="accent">Due {due}</Badge> : null}
      </div>
      <p className="mt-3 text-caption text-muted">Total due</p>
      <p className="text-h3 text-ink tabular-nums xl:text-h2">{total}</p>
      <p className="mt-1 truncate text-caption text-muted">{recipient}</p>
      <div className="mt-4 flex gap-1.5 border-t border-border pt-3">
        {outputs.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="flex flex-1 items-center justify-center gap-1 rounded-pill bg-surface-alt py-1.5 text-caption text-ink"
          >
            <Icon size={iconSize.sm} strokeWidth={iconStroke} className="shrink-0" />
            <span className="hidden xl:inline">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
