import {
  Calculator,
  CalendarDays,
  Check,
  Coins,
  FileText,
  ImagePlus,
  LayoutTemplate,
  PenLine,
  Percent,
  Receipt,
  Save,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { iconSize, iconStroke } from "@/components/ui";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { computeTotals } from "@/features/invoice/model/totals";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { formatMoney } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";
import { revealDelay, scrollOffsets } from "./motion";
import {
  Chip,
  FeatureCard,
  InlineTile,
  SectionHeading,
  SmallFeature,
  sectionClass,
} from "./section-heading";

const money = (value: number) => formatMoney(value, sampleInvoice.currency, sampleInvoice.locale);

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className={sectionClass}>
      <Container>
        <SectionHeading
          id="features-title"
          title={
            <>
              Invoicing <InlineTile icon={FileText} /> has
              <br className="max-sm:hidden" /> never been easier
            </>
          }
        />

        <div className="mt-14 grid gap-4 md:mt-20 lg:grid-cols-2 lg:gap-6">
          <FeatureCard data-reveal="rise" className="min-h-136 p-card lg:p-10">
            <Chip icon={LayoutTemplate}>Four templates</Chip>
            <h3 className="mt-5 max-w-sm text-card text-ink">
              Pick a look that fits your business
            </h3>
            <TemplateFan />
            <p className="max-w-md text-body text-muted">
              <span className="text-ink">Switch templates anytime.</span> Your details stay put, so
              changing the look never means retyping the invoice.
            </p>
          </FeatureCard>

          <FeatureCard
            data-reveal="rise"
            style={revealDelay(150)}
            className="min-h-136 p-card lg:p-10"
          >
            <Chip icon={Calculator}>Totals that add up</Chip>
            <h3 className="mt-5 max-w-sm text-card text-ink">
              Discounts, tax and currency, handled for you
            </h3>
            <TotalsVisual />
            <p className="max-w-md text-body text-muted">
              <span className="text-ink">Enter quantities and rates.</span> Add a discount or a tax
              rate and Aexo works out every line, then the total.
            </p>
          </FeatureCard>
        </div>

        <ul className="mt-4 grid gap-4 md:grid-cols-3 lg:mt-6 lg:gap-6">
          <SmallFeature icon={ImagePlus} title="Your logo, your brand">
            Upload a logo, choose an accent and a typeface. Every template keeps it crisp.
          </SmallFeature>
          <SmallFeature icon={Coins} title="15 currencies" index={1}>
            From US dollars to naira, cedis and rand, formatted the way your client reads money.
          </SmallFeature>
          <SmallFeature icon={Save} title="Drafts that save themselves" index={2}>
            Your work in progress is kept on this device as you type, so a closed tab never costs
            you an invoice.
          </SmallFeature>
        </ul>
      </Container>
    </section>
  );
}

/** Three real templates. They start stacked and fan out as the card scrolls up. */
function TemplateFan() {
  const pages = [
    {
      id: "classic",
      className: "left-[6%] top-8 -rotate-6 w-[42%]",
      offsets: scrollOffsets({ x: 110, y: 40, r: 6 }),
    },
    {
      id: "accent",
      className: "right-[6%] top-8 rotate-6 w-[42%]",
      offsets: scrollOffsets({ x: -110, y: 40, r: -6 }),
    },
    {
      id: "modern",
      className: "left-1/2 top-2 w-[46%] -translate-x-1/2 z-10 shadow-lift",
      offsets: scrollOffsets({ y: 70, s: 0.06 }),
    },
  ] as const;

  return (
    <div
      aria-hidden
      data-scene="enter"
      className="relative my-10 h-72 flex-1 overflow-hidden sm:h-80"
    >
      {pages.map((page) => (
        <div
          key={page.id}
          className={cn("scroll-settle absolute", page.className)}
          style={page.offsets}
        >
          <InvoiceDocument
            invoice={sampleInvoice}
            template={page.id}
            aspect="600 / 700"
            className="rounded-md shadow-float"
          />
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-mist to-transparent" />
    </div>
  );
}

function TotalsVisual() {
  const totals = computeTotals(sampleInvoice);
  const sources = [
    { label: "Discount", icon: Percent },
    { label: "Tax", icon: Receipt },
    { label: "Currency", icon: Coins },
    { label: "Due date", icon: CalendarDays },
  ];

  return (
    <div aria-hidden className="my-10 flex flex-1 flex-col items-center">
      <p data-reveal="rise" className="text-label text-sky-700">
        Add what applies:
      </p>
      <ul className="mt-3 flex gap-2">
        {sources.map(({ label, icon: Icon }, i) => (
          <li
            key={label}
            title={label}
            data-reveal="pop"
            style={revealDelay(200 + i * 110)}
            className={cn(
              "flex size-12 items-center justify-center rounded-md bg-white text-muted shadow-float",
              i % 2 ? "-translate-y-1.5 rotate-3" : "-rotate-3",
            )}
          >
            <Icon size={iconSize.md} strokeWidth={iconStroke} />
          </li>
        ))}
      </ul>

      <div className="mt-8 grid w-full max-w-md grid-cols-[2fr_3fr] gap-3 sm:grid-cols-2">
        <MiniPage label="Before" icon={PenLine} reveal="left" delay={650}>
          <div className="font-serif text-caption text-muted italic">
            <p>10,400 − 5%</p>
            <p>+ vat 7.5%?</p>
            <p className="line-through decoration-accent">= 10,920</p>
          </div>
        </MiniPage>
        <MiniPage label="After" icon={Check} reveal="right" delay={800}>
          <dl className="flex flex-col gap-1 text-caption tabular-nums">
            <Row label="Subtotal" value={money(totals.subtotal)} />
            <Row label="Discount" value={`−${money(totals.discount)}`} />
            <Row label="VAT 7.5%" value={money(totals.tax)} />
            <div className="mt-1 flex justify-between border-t border-mist-strong pt-1.5 text-ink">
              <dt>Total</dt>
              <dd className="whitespace-nowrap">{money(totals.total)}</dd>
            </div>
          </dl>
        </MiniPage>
      </div>
    </div>
  );
}

function MiniPage({
  label,
  icon: Icon,
  reveal,
  delay,
  children,
}: {
  label: string;
  icon: typeof Check;
  reveal: "left" | "right";
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div
      data-reveal={reveal}
      style={revealDelay(delay)}
      className="relative rounded-lg bg-white px-3.5 pt-7 pb-4 shadow-float"
    >
      <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-pill bg-white px-3 py-1 text-label text-sky-700 shadow-soft">
        <Icon size={14} strokeWidth={iconStroke} />
        {label}
      </span>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-muted">
      <dt>{label}</dt>
      <dd className="whitespace-nowrap">{value}</dd>
    </div>
  );
}
