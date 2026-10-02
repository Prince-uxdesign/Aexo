import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    title: "Add your details",
    body: "Your business, your client and what you're billing for. Totals calculate as you type.",
  },
  {
    title: "Customise your invoice",
    body: "Choose a template, set the currency, tax and discount, and add your logo.",
  },
  {
    title: "Send or download",
    body: "Download a PDF, print it, share a link or email it straight to your client.",
  },
];

/**
 * Three steps.
 * - Phones: a vertical timeline (numbers joined by a line), easy to scan with a thumb.
 * - From 768px: three columns joined by a horizontal line.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-header py-section"
    >
      <Container className="flex flex-col gap-10 md:gap-14">
        <SectionHeading
          id="how-it-works-title"
          eyebrow="How it works"
          title="From blank page to sent invoice in three steps."
          description="No setup and no account to start. Everything you add shows up on the invoice straight away."
        />

        <ol className="grid gap-0 md:grid-cols-3 md:gap-8 lg:gap-10">
          {steps.map((step, index) => {
            const last = index === steps.length - 1;
            return (
              <li
                key={step.title}
                className="relative flex gap-5 pb-10 last:pb-0 md:flex-col md:gap-6 md:pb-0"
              >
                {/* Connector: vertical on phones, horizontal from 768px. */}
                {!last ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-12 bottom-1 left-5 w-px bg-border-strong",
                      "md:top-5 md:-right-8 md:bottom-auto md:left-14 md:h-px md:w-auto lg:-right-10",
                    )}
                  />
                ) : null}
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-pill border border-border-strong bg-surface text-label text-ink tabular-nums">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-2 pt-2 md:pt-0">
                  <h3 className="text-h3 text-ink">{step.title}</h3>
                  <p className="max-w-sm text-body text-muted">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
