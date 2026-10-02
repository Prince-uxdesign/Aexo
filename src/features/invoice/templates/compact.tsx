import type { Invoice } from "../model/types";
import {
  FooterBlock,
  ItemsTable,
  MetaList,
  NotesBlock,
  PartyBlock,
  PaymentBlock,
  SenderMark,
  TotalsBlock,
  invoiceView,
  templateFontClass,
} from "./parts";
import { cn } from "@/lib/utils/cn";

/**
 * Template 04: Compact. For invoices with many line items: denser table,
 * smaller spacing, header and parties on one band. Still readable.
 */
export function CompactTemplate({ invoice }: { invoice: Invoice }) {
  const { custom } = invoiceView(invoice);
  return (
    <div className={cn("flex h-full flex-col gap-5 p-8 text-doc-sm", templateFontClass(invoice))}>
      <header className="flex items-baseline justify-between gap-6 border-b border-ink pb-3">
        <SenderMark invoice={invoice} className="text-doc-md" />
        <p className="shrink-0 text-doc-md">
          <span className="font-medium">{custom.title}</span>{" "}
          <span className="text-muted">{invoice.number}</span>
        </p>
      </header>

      <div className="grid grid-cols-[1fr_1fr_auto] gap-6">
        <PartyBlock label="From" party={invoice.sender} />
        <PartyBlock label="Bill to" party={invoice.recipient} />
        <MetaList invoice={invoice} className="flex flex-col gap-1.5 text-right" />
      </div>

      <ItemsTable invoice={invoice} variant="dense" />

      <div className="grid grid-cols-[1fr_44%] gap-6">
        <div className="flex flex-col gap-4">
          <PaymentBlock invoice={invoice} />
          <NotesBlock invoice={invoice} />
        </div>
        <TotalsBlock
          invoice={invoice}
          className="self-start rounded-sm bg-surface-alt p-3"
          totalClassName="border-t border-border-strong pt-2"
        />
      </div>
      <FooterBlock invoice={invoice} />
    </div>
  );
}
