import type { Invoice } from "../model/types";
import {
  AccentMark,
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
import { accentClasses } from "../model/customization";
import { cn } from "@/lib/utils/cn";

/** Template 03: Accent. Classic structure with small accent details. Still restrained. */
export function AccentTemplate({ invoice }: { invoice: Invoice }) {
  const { custom } = invoiceView(invoice);
  const accent = accentClasses(custom.accent);
  const marker = <AccentMark custom={custom} />;
  return (
    <div className={cn("flex h-full flex-col", templateFontClass(invoice))}>
      <div aria-hidden className={cn("h-1.5 shrink-0", accent.solid)} />
      <div className="flex flex-1 flex-col gap-7 p-11">
        <header className="flex items-start justify-between gap-6">
          <SenderMark invoice={invoice} />
          <div className="shrink-0 text-right">
            <DocTitle custom={custom} className="text-doc-xl font-medium" />
            <p className="mt-1 text-muted">{invoice.number}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-8">
          <PartyBlock label="From" party={invoice.sender} marker={marker} />
          <PartyBlock label="Bill to" party={invoice.recipient} marker={marker} />
        </div>

        <MetaList
          invoice={invoice}
          className="grid grid-cols-3 gap-8 rounded-sm bg-surface-alt px-4 py-3"
        />

        <ItemsTable invoice={invoice} variant="lined" />

        <div className="flex justify-end">
          <TotalsBlock
            invoice={invoice}
            className="w-[52%]"
            totalClassName={cn("border-t-2 pt-2.5", accent.border)}
            totalLabel="Total due"
          />
        </div>

        <footer className="mt-auto grid grid-cols-2 gap-8 border-t border-border pt-6">
          <PaymentBlock invoice={invoice} marker={marker} />
          <NotesBlock invoice={invoice} marker={marker} />
        </footer>
        <FooterBlock invoice={invoice} />
      </div>
    </div>
  );
}
