import { Check, Download, Mail, Printer, Send, User } from "lucide-react";
import { Container } from "@/components/layout/container";
import { iconSize, iconStroke } from "@/components/ui";
import { computeTotals } from "@/features/invoice/model/totals";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { formatMoney } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";
import { CountUp } from "./count-up";
import { revealDelay } from "./motion";
import { Chip, FeatureCard, InlineTile, SectionHeading, sectionClass } from "./section-heading";

/** "Get paid faster": export and email, the two ways an invoice leaves Aexo. */
export function ReduceFrictionSection() {
  return (
    <section aria-labelledby="paid-title" className={cn(sectionClass, "pt-0 md:pt-0 lg:pt-0")}>
      <Container>
        <SectionHeading
          id="paid-title"
          title={
            <>
              Get paid <InlineTile icon={Send} /> faster
              <br className="max-sm:hidden" /> with less back-and-forth
            </>
          }
        />

        <div className="mt-14 grid gap-4 md:mt-20 lg:grid-cols-2 lg:gap-6">
          <FeatureCard data-reveal="rise" className="min-h-128 p-card lg:p-10">
            <Chip icon={Download}>Download &amp; print</Chip>
            <h3 className="mt-5 max-w-sm text-card text-ink">
              Print-ready PDFs that look the same everywhere
            </h3>
            <ExportVisual />
          </FeatureCard>

          <FeatureCard
            data-reveal="rise"
            style={revealDelay(150)}
            className="min-h-128 p-card lg:p-10"
          >
            <Chip icon={Mail}>Email</Chip>
            <h3 className="mt-5 max-w-sm text-card text-ink">
              Send it straight to your client&apos;s inbox
            </h3>
            <EmailVisual />
          </FeatureCard>
        </div>
      </Container>
    </section>
  );
}

function ExportVisual() {
  const amount = computeTotals(sampleInvoice).total;
  const cents = formatMoney(amount, sampleInvoice.currency, sampleInvoice.locale).split(".")[1];

  return (
    <div aria-hidden className="mt-10 flex flex-1 items-end justify-center">
      {/* The export panel slides up from the card's edge and the total counts up. */}
      <div
        data-reveal="rise"
        style={revealDelay(250)}
        className="w-full max-w-sm overflow-hidden rounded-t-xl bg-white shadow-lift"
      >
        <div className="flex items-center justify-between bg-mist px-4 py-2.5 text-caption text-muted">
          <span>Export complete</span>
          <span data-reveal="pop" style={revealDelay(1700)}>
            <Check size={iconSize.sm} strokeWidth={2} className="text-ink" />
          </span>
        </div>
        <div className="flex flex-col items-center px-6 pt-6 pb-8">
          <p className="text-caption tracking-wide text-muted-soft uppercase">
            {sampleInvoice.number} · A4
          </p>
          <p className="mt-2 text-display text-ink tabular-nums">
            <CountUp
              value={Math.floor(amount)}
              currency={sampleInvoice.currency}
              locale={sampleInvoice.locale}
            />
            {cents ? <span className="text-muted-soft">.{cents}</span> : null}
          </p>
          <div className="mt-5 flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-ink px-4 py-2 text-label text-canvas">
              <Download size={iconSize.sm} strokeWidth={iconStroke} />
              Save PDF
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-mist px-4 py-2 text-label text-ink">
              <Printer size={iconSize.sm} strokeWidth={iconStroke} />
              Print
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailVisual() {
  const first = sampleInvoice.recipient.contactName?.split(" ")[0] ?? "there";
  return (
    <div aria-hidden className="mt-10 flex flex-1 flex-col justify-end gap-3">
      {/* Plays out like a conversation: your message, then the client's view. */}
      <div data-reveal="right" style={revealDelay(300)} className="ml-auto w-full max-w-xs">
        <div className="relative overflow-hidden rounded-xl rounded-br-xs bg-sky-600 px-4 py-3.5 text-body text-white shadow-float">
          Hi {first}, here&apos;s invoice {sampleInvoice.number} for the brand and website work. You
          can view or download it from the link. Thank you!
        </div>
        <div className="mt-1.5 flex justify-between px-1 text-caption text-muted">
          <span>You</span>
          <span>Sent · 09:42</span>
        </div>
      </div>

      <div data-reveal="left" style={revealDelay(900)} className="flex max-w-xs items-end gap-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-white text-muted shadow-soft">
          <User size={iconSize.md} strokeWidth={iconStroke} />
        </span>
        <div className="rounded-xl rounded-bl-xs bg-white px-4 py-3.5 shadow-float">
          <p className="text-label text-ink">Invoice {sampleInvoice.number}</p>
          <p className="mt-0.5 text-caption text-muted">From {sampleInvoice.sender.name}</p>
          <span className="mt-3 inline-flex rounded-pill bg-ink px-3.5 py-1.5 text-caption text-canvas">
            View invoice
          </span>
        </div>
      </div>
    </div>
  );
}
