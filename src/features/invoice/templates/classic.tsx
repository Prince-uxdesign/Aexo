import type { Invoice } from "../model/types";
import {
  DocTitle,
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

/** Template 01: Classic. Simple black typography, minimal lines, balanced spacing. Default. */
export function ClassicTemplate({ invoice }: { invoice: Invoice }) {
  const { custom } = invoiceView(invoice);
  return (
    <div className={cn("flex h-full flex-col gap-9 p-11", templateFontClass(invoice))}>
      <header className="flex items-start justify-between gap-6">
        <SenderMark invoice={invoice} />
        <div className="shrink-0 text-right">
          <DocTitle
            custom={custom}
            className="text-doc-xl font-medium tracking-[0.12em] uppercase"
          />
          <p className="mt-1 text-muted">{invoice.number}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-8">
        <PartyBlock label="From" party={invoice.sender} />
        <PartyBlock label="Bill to" party={invoice.recipient} />
      </div>

      <MetaList invoice={invoice} className="grid grid-cols-3 gap-8 border-y border-border py-4" />

      <ItemsTable invoice={invoice} variant="lined" />

      <div className="flex justify-end">
        <TotalsBlock
          invoice={invoice}
          className="w-[52%]"
          totalClassName="border-t border-ink pt-2.5"
        />
      </div>

      <footer className="mt-auto grid grid-cols-2 gap-8 border-t border-border pt-6">
        <PaymentBlock invoice={invoice} />
        <NotesBlock invoice={invoice} />
      </footer>
      <FooterBlock invoice={invoice} />
    </div>
  );
}
