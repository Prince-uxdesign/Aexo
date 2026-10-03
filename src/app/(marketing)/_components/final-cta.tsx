import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui";
import { routes } from "@/config/routes";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { revealDelay, scrollOffsets } from "./motion";
import { SectionHeading, sectionClass } from "./section-heading";

/** Closing section: works on any screen, one last call to action, three devices. */
export function FinalCta() {
  return (
    <section aria-labelledby="devices-title" className={`${sectionClass} overflow-hidden`}>
      <Container>
        <SectionHeading
          id="devices-title"
          tone="muted"
          title={
            <>
              Aexo works on
              <br className="max-sm:hidden" /> every screen you own
            </>
          }
          description={
            <>
              Phone, tablet or laptop:{" "}
              <span className="text-ink">start on one, finish on another.</span> Every template fits
              the screen in front of you and prints the same on paper.
            </>
          }
        />
        <div data-reveal="rise" style={revealDelay(260)} className="mt-8 flex justify-center">
          <Link href={routes.createInvoice} className={buttonStyles({ size: "lg" })}>
            Create an invoice for free
          </Link>
        </div>

        {/* The laptop rises and grows into place; the phone and tablet slide in
            from either side as the stage scrolls up. */}
        <div
          aria-hidden
          data-scene="enter"
          className="relative mx-auto mt-16 flex max-w-6xl items-end justify-center md:mt-24"
        >
          {/* Phone */}
          <div
            className="scroll-settle absolute bottom-6 left-0 z-10 w-28 rounded-xl bg-white p-1.5 shadow-lift sm:left-[4%] sm:w-36 lg:left-0 lg:w-44"
            style={scrollOffsets({ x: -160, y: 60, r: -10 })}
          >
            <div className="overflow-hidden rounded-lg bg-mist px-1.5 pt-5 pb-2">
              <span className="mx-auto mb-2 block h-1.5 w-10 rounded-pill bg-ink" />
              <InvoiceDocument invoice={sampleInvoice} template="compact" aspect="600 / 1000" />
            </div>
          </div>

          {/* Laptop */}
          <div
            className="scroll-settle w-[78%] max-w-2xl"
            style={scrollOffsets({ y: 110, s: 0.1 })}
          >
            <div className="rounded-t-xl bg-white p-2 shadow-lift sm:p-3">
              <div className="grid grid-cols-[2fr_3fr] gap-3 rounded-lg bg-mist p-3 sm:p-5">
                <div className="flex flex-col gap-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="flex flex-col gap-1.5 rounded-sm bg-white p-2">
                      <span className="h-1.5 w-1/2 rounded-pill bg-mist-strong" />
                      <span className="h-2 w-5/6 rounded-pill bg-mist-strong" />
                    </span>
                  ))}
                </div>
                <InvoiceDocument
                  invoice={sampleInvoice}
                  template="classic"
                  aspect="600 / 560"
                  className="shadow-soft"
                />
              </div>
            </div>
            <div className="mx-auto h-3 w-[112%] -translate-x-[5.4%] rounded-b-xl bg-linear-to-b from-mist to-mist-strong shadow-float" />
            <div className="mx-auto mt-6 h-10 w-3/4 rounded-pill bg-muted-soft/20 blur-2xl" />
          </div>

          {/* Tablet */}
          <div
            className="scroll-settle absolute right-0 bottom-14 w-32 rounded-xl bg-white p-1.5 shadow-lift max-sm:hidden sm:right-[2%] sm:w-48 lg:right-0 lg:w-60"
            style={scrollOffsets({ x: 160, y: 60, r: 10 })}
          >
            <div className="overflow-hidden rounded-lg bg-mist p-3">
              <InvoiceDocument invoice={sampleInvoice} template="accent" aspect="600 / 760" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
