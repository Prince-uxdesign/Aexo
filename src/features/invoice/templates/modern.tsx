import type { Invoice } from "../model/types";
import {
  DocLabel,
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

/** Template 02: Modern. Large invoice number, more whitespace, minimal borders, strong hierarchy. */
export function ModernTemplate({ invoice }: { invoice: Invoice }) {
  const { totals, money, date, custom } = invoiceView(invoice);

  return (
    <div className={cn("flex h-full flex-col gap-8 p-12", templateFontClass(invoice))}>
      <SenderMark invoice={invoice} />

      <header className="flex items-end justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <DocLabel>{custom.title}</DocLabel>
          <p className="text-doc-2xl font-medium tracking-[-0.03em]">{invoice.number}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1 text-right">
          <DocLabel>Amount due</DocLabel>
          <p className="text-doc-xl font-medium tracking-[-0.02em]">{money(totals.total)}</p>
          {invoice.dueDate ? <p className="text-muted">Due {date(invoice.dueDate)}</p> : null}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-10">
        <PartyBlock label="Billed to" party={invoice.recipient} />
        <PartyBlock label="From" party={invoice.sender} />
      </div>

      <MetaList invoice={invoice} className="flex gap-10" />

      <ItemsTable invoice={invoice} variant="minimal" />

      <div className="flex justify-end">
        <TotalsBlock invoice={invoice} className="w-[48%]" totalClassName="pt-2" />
      </div>

      <footer className="mt-auto grid grid-cols-2 gap-10">
        <PaymentBlock invoice={invoice} />
        <NotesBlock invoice={invoice} />
      </footer>
      <FooterBlock invoice={invoice} />
    </div>
  );
}
