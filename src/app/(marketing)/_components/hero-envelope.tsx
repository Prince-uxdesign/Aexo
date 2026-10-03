import { Check, PenLine } from "lucide-react";
import { iconSize, iconStroke } from "@/components/ui";
import { lineAmount, computeTotals } from "@/features/invoice/model/totals";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { formatMoney } from "@/lib/format/currency";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";
import { scrollOffsets } from "./motion";

const invoice = sampleInvoice;
const money = (value: number) => formatMoney(value, invoice.currency, invoice.locale);

/**
 * The hero visual: an open envelope holding two pages. On the left, the rough
 * notes people usually start from; on the right, the same work as a clean Aexo
 * invoice (real sample data, real totals). Paper slips peek out on both sides
 * and the whole stage is cut off by the bottom of the hero island.
 *
 * Motion: on load the envelope rises, then each page slides up out of it and
 * the slips fan in. Scrolling away (the hero's "exit" scene) lifts the pages
 * further out and spreads the slips apart.
 */
export function HeroEnvelope() {
  const { total } = computeTotals(invoice);

  return (
    <figure className="relative mx-auto mt-10 h-72 max-w-5xl sm:h-80 md:mt-14 md:h-96">
      <figcaption className="sr-only">
        Before: rough notes for a client job. After: the same job as Aexo invoice {invoice.number}{" "}
        for {invoice.recipient.name}, total {money(total)}.
      </figcaption>

      <div
        aria-hidden
        className="absolute inset-0 animate-envelope-in"
        style={{ animationDelay: "420ms" }}
      >
        {/* Paper slips spilling out either side */}
        <Slip
          className="bottom-6 left-[3%] -rotate-6 max-md:hidden"
          delay={1000}
          style={scrollOffsets({ x: -90, y: 30, r: -6 })}
        />
        <Slip
          className="-bottom-6 left-[13%] rotate-3 max-sm:hidden"
          delay={1120}
          style={scrollOffsets({ x: -50, y: 50, r: -3 })}
        />
        <Slip
          className="right-[12%] -bottom-4 -rotate-3 max-sm:hidden"
          delay={1180}
          style={scrollOffsets({ x: 50, y: 50, r: 3 })}
        />
        <Slip
          className="right-[2%] bottom-8 rotate-6 max-md:hidden"
          delay={1060}
          style={scrollOffsets({ x: 90, y: 30, r: 6 })}
        />

        <div className="absolute inset-x-[3%] bottom-0 h-[86%] sm:inset-x-[16%] lg:inset-x-[22%]">
          {/* Back of the envelope with its flap open */}
          <svg
            viewBox="0 0 600 360"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            <path d="M0 120 L300 0 L600 120 Z" className="fill-sky-50" />
            <rect y="118" width="600" height="242" rx="18" className="fill-sky-100" />
          </svg>

          <BeforePage
            className="top-[18%] left-[3%] w-[54%] -rotate-3 sm:left-[6%] sm:w-[46%]"
            style={{ ...scrollOffsets({ x: -36, y: -60, r: -5 }), animationDelay: "820ms" }}
          />
          <AfterPage
            total={money(total)}
            className="top-[11%] right-[3%] w-[60%] rotate-2 sm:right-[6%] sm:w-[48%]"
            style={{ ...scrollOffsets({ x: 24, y: -130, r: -2 }), animationDelay: "980ms" }}
          />

          {/* Front pocket */}
          <svg
            viewBox="0 0 600 360"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            <path d="M0 196 L300 318 L600 196 L600 360 L0 360 Z" className="fill-sky-200" />
            <path d="M0 202 L300 324 L600 202 L600 360 L0 360 Z" className="fill-sky-50" />
          </svg>
        </div>
      </div>
    </figure>
  );
}

function Slip({
  className,
  delay,
  style,
}: {
  className?: string;
  delay: number;
  style: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "scroll-shift absolute flex w-44 animate-slip-in flex-col gap-2 rounded-lg bg-white/90 p-3.5 shadow-float lg:w-52",
        className,
      )}
      style={{ ...style, animationDelay: `${delay}ms` }}
    >
      <span className="h-3 w-4/5 rounded-pill bg-sky-200" />
      <span className="h-3 w-3/5 rounded-pill bg-sky-100" />
      <span className="h-3 w-2/3 rounded-pill bg-sky-200" />
    </div>
  );
}

function PageLabel({ icon: Icon, children }: { icon: typeof Check; children: string }) {
  return (
    <span className="absolute -top-4 left-5 inline-flex min-h-8 items-center gap-1.5 rounded-pill bg-white px-3.5 text-label text-ink shadow-float">
      <Icon size={iconSize.sm} strokeWidth={iconStroke} className="text-sky-500" />
      {children}
    </span>
  );
}

type PageProps = { className?: string; style?: CSSProperties };

// Pages slide up out of the envelope on load and lift further as the hero scrolls away.
const pageMotion = "scroll-shift animate-page-in";

function BeforePage({ className, style }: PageProps) {
  return (
    <div
      className={cn(
        "absolute h-full rounded-lg bg-white px-4 pt-8 shadow-float",
        pageMotion,
        className,
      )}
      style={style}
    >
      <PageLabel icon={PenLine}>Before</PageLabel>
      <div className="font-serif text-caption text-muted italic">
        <p>Harbor &amp; Pine — invoice??</p>
        <p className="mt-2">brand id 4800 + web 40h × 95</p>
        <p className="mt-1 max-sm:hidden">launch 3 days @ 600 each</p>
        <p className="mt-1">minus 5% (agreed on call)</p>
        <p className="mt-1">vat 7.5% — before or after?</p>
        <p className="mt-2 text-muted-soft line-through decoration-accent">total ≈ 10,9??</p>
      </div>
    </div>
  );
}

function AfterPage({ total, className, style }: PageProps & { total: string }) {
  return (
    <div
      className={cn(
        "absolute h-full rounded-lg bg-white px-4 pt-8 shadow-lift",
        pageMotion,
        className,
      )}
      style={style}
    >
      <PageLabel icon={Check}>After</PageLabel>
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-label text-ink">{invoice.sender.name}</p>
        <p className="shrink-0 text-caption text-muted">{invoice.number}</p>
      </div>
      <p className="mt-0.5 truncate text-caption text-muted">Billed to {invoice.recipient.name}</p>
      <ul className="mt-3 flex flex-col border-t border-mist-strong text-caption tabular-nums">
        {invoice.items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between gap-3 border-b border-mist-strong py-1.5"
          >
            <span className="truncate text-foreground">{item.name}</span>
            <span className="shrink-0 text-muted">{money(lineAmount(item))}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="text-caption text-muted">Total due</span>
        <span className="text-label text-ink tabular-nums">{total}</span>
      </div>
    </div>
  );
}
