import { Container } from "@/components/layout/container";
import { computeTotals } from "@/features/invoice/model/totals";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { formatMoney } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";
import { scrollOffsets } from "./motion";
import { SectionHeading, sectionClass } from "./section-heading";

const money = (value: number) => formatMoney(value, sampleInvoice.currency, sampleInvoice.locale);

/** "Calculated to the cent": the totals engine, shown as cards rising from an envelope. */
export function PrecisionSection() {
  const totals = computeTotals(sampleInvoice);
  const cards = [
    {
      term: "Discount · 5%",
      value: `−${money(totals.discount)}`,
      body: "Taken off the subtotal before any tax is added.",
      className: "left-0 top-24 -rotate-3 sm:left-[2%] sm:top-28",
      offsets: scrollOffsets({ y: 170, r: -4 }),
    },
    {
      term: `VAT · ${sampleInvoice.taxRate}%`,
      value: `+${money(totals.tax)}`,
      body: "Charged on the discounted amount, never on the original.",
      className: "right-0 top-48 rotate-3 sm:right-[2%] sm:top-32",
      offsets: scrollOffsets({ y: 200, r: 4 }),
    },
    {
      term: "Total due",
      value: money(totals.total),
      body: "Rounded once, so it matches on screen, on paper and in the inbox.",
      className: "left-1/2 top-0 z-10 -translate-x-1/2 -rotate-1",
      offsets: scrollOffsets({ y: 260 }),
    },
  ];

  return (
    <section aria-labelledby="precision-title" className={cn(sectionClass, "overflow-hidden")}>
      <Container>
        <SectionHeading
          id="precision-title"
          title="Calculated to the cent"
          description={
            <>
              Every invoice runs through one engine in a fixed order: lines, subtotal, discount,
              then tax. <span className="text-ink">The total is always the total.</span>
            </>
          }
        />

        {/* As the stage scrolls up, the cards rise out of the envelope's pocket. */}
        <div data-scene="enter" className="relative mx-auto mt-14 h-88 max-w-2xl md:mt-20">
          {/* Soft sky glow behind the envelope */}
          <div
            aria-hidden
            className="absolute inset-x-[8%] top-28 bottom-4 rounded-pill bg-sky-200/70 blur-3xl"
          />

          {/* Envelope back and open flap */}
          <svg
            aria-hidden
            viewBox="0 0 600 300"
            preserveAspectRatio="none"
            className="absolute inset-x-[3%] top-14 h-74 w-[94%]"
          >
            <path d="M0 100 L300 0 L600 100 Z" className="fill-sky-100" />
            <rect y="98" width="600" height="202" rx="22" className="fill-sky-50" />
          </svg>

          <dl className="absolute inset-0">
            {cards.map((card) => (
              <div
                key={card.term}
                className={cn(
                  "scroll-settle absolute w-60 rounded-lg bg-white p-4 shadow-float sm:w-72 sm:p-5",
                  card.className,
                )}
                style={card.offsets}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-label text-ink">{card.term}</dt>
                  <dd className="text-label text-ink tabular-nums">{card.value}</dd>
                </div>
                <dd className="mt-1.5 text-caption text-muted">{card.body}</dd>
              </div>
            ))}
          </dl>

          {/* Front pocket, melting into the page */}
          <svg
            aria-hidden
            viewBox="0 0 600 300"
            preserveAspectRatio="none"
            className="absolute inset-x-[3%] top-14 h-74 w-[94%]"
          >
            <path d="M0 160 L300 262 L600 160 L600 300 L0 300 Z" className="fill-sky-100" />
            <path d="M0 166 L300 268 L600 166 L600 300 L0 300 Z" className="fill-white" />
          </svg>
          <div
            aria-hidden
            className="absolute -inset-x-4 bottom-0 h-20 bg-linear-to-t from-white to-transparent"
          />
        </div>
      </Container>
    </section>
  );
}
