import type { CSSProperties } from "react";
import Link from "next/link";
import { Check, ChevronRight, Clock, FileText, PenLine, Send, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { cn } from "@/lib/utils/cn";
import { revealDelay } from "./motion";
import { Chip, FeatureCard, InlineTile, SectionHeading, sectionClass } from "./section-heading";

export function SaveHoursSection() {
  return (
    <section aria-labelledby="save-hours-title" className={sectionClass}>
      <Container>
        <SectionHeading
          id="save-hours-title"
          title={
            <>
              Save <InlineTile icon={Clock} /> hours
              <br className="max-sm:hidden" /> every month with Aexo
            </>
          }
        />

        <div className="mt-14 grid gap-4 md:mt-20 lg:grid-cols-2 lg:gap-6">
          <FeatureCard data-reveal="rise" className="min-h-136 p-card lg:p-10">
            <Chip icon={FileText}>Invoices</Chip>
            <h3 className="mt-5 max-w-sm text-card text-ink">
              Create a polished, client-ready invoice
            </h3>
            <CreateVisual />
            <CardLink href={routes.createInvoice}>Start an invoice</CardLink>
          </FeatureCard>

          <FeatureCard
            data-reveal="rise"
            style={revealDelay(150)}
            className="min-h-136 p-card lg:p-10"
          >
            <Chip icon={Send}>Share</Chip>
            <h3 className="mt-5 max-w-sm text-card text-ink">
              Send it by link, email or PDF in one step
            </h3>
            <SendVisual />
            <CardLink href={routes.landing.howItWorks}>How sharing works</CardLink>
          </FeatureCard>
        </div>
      </Container>
    </section>
  );
}

export function CardLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start rounded-pill bg-white pr-4 pl-5 text-button text-ink shadow-soft transition-[translate] duration-150 ease-standard hover:-translate-y-px"
    >
      {children}
      <ChevronRight size={iconSize.sm} strokeWidth={2} />
    </Link>
  );
}

function CreateVisual() {
  return (
    <div aria-hidden className="relative my-10 flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Tile title="Your details" hint="Name, logo, address" delay={250} />
          <Tile title="Client details" hint="Who you're billing" delay={350} />
        </div>
        <div
          data-reveal="rise"
          style={revealDelay(450)}
          className="flex min-h-11 items-center gap-2 rounded-md bg-white px-3.5 text-label font-normal text-muted shadow-soft"
        >
          <PenLine size={iconSize.sm} strokeWidth={iconStroke} className="text-muted-soft" />
          Website design · 40 h × $95
          <span className="h-4 w-px animate-pulse bg-ink" />
        </div>
      </div>

      <div className="relative mt-10 h-24 w-40">
        <PdfTile className="left-0 -rotate-6" label="INV-0141" delay={650} />
        <PdfTile className="top-3 left-16 rotate-3" label={sampleInvoice.number} delay={800} />
      </div>
    </div>
  );
}

function Tile({ title, hint, delay }: { title: string; hint: string; delay: number }) {
  return (
    <div
      data-reveal="rise"
      style={revealDelay(delay)}
      className="rounded-md bg-white px-3.5 py-3 shadow-soft"
    >
      <p className="text-label text-ink">{title}</p>
      <p className="mt-0.5 text-caption text-muted">{hint}</p>
    </div>
  );
}

function PdfTile({
  className,
  label,
  delay,
}: {
  className?: string;
  label: string;
  delay: number;
}) {
  return (
    <div
      data-reveal="pop"
      style={revealDelay(delay)}
      className={cn(
        "absolute flex w-24 flex-col items-center gap-2 rounded-md bg-white px-3 pt-4 pb-3 shadow-float",
        className,
      )}
    >
      <span className="relative">
        <FileText size={28} strokeWidth={1.5} className="text-muted-soft" />
        <span className="absolute -bottom-1 -left-2 rounded-xs bg-ink px-1.5 text-caption text-canvas">
          PDF
        </span>
      </span>
      <span className="text-caption text-muted">{label}</span>
    </div>
  );
}

const TICKS = 44;
const LIT = Math.round(TICKS * 0.6);

function SendVisual() {
  return (
    <div aria-hidden className="my-10 flex flex-1 flex-col items-center justify-center">
      {/* The panel zooms in, then the track fills tick by tick, then the
          check and the status pills pop in. */}
      <div
        data-reveal="zoom"
        style={revealDelay(200)}
        className="w-full max-w-md rounded-xl bg-white p-3 shadow-lift"
      >
        <div className="px-2 pt-10 pb-4">
          <p className="text-label text-ink">Sending {sampleInvoice.number}</p>
          <p className="mt-0.5 truncate text-caption text-muted">
            to {sampleInvoice.recipient.email}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-md bg-sky-50 px-3 py-3">
          <X size={iconSize.sm} strokeWidth={2} className="shrink-0 text-sky-600" />
          <div data-reveal="fill" className="flex flex-1 items-center justify-between">
            {Array.from({ length: TICKS }, (_, i) =>
              i < LIT ? (
                <span
                  key={i}
                  data-tick
                  style={{ "--tick-delay": `${600 + i * 28}ms` } as CSSProperties}
                  className="h-3.5 w-0.5 rounded-pill bg-sky-500"
                />
              ) : (
                <span key={i} className="h-3.5 w-0.5 rounded-pill bg-sky-200" />
              ),
            )}
          </div>
          <span
            data-reveal="pop"
            style={revealDelay(600 + LIT * 28)}
            className="flex size-5 shrink-0 items-center justify-center rounded-pill bg-sky-500 text-white"
          >
            <Check size={12} strokeWidth={3} />
          </span>
        </div>
      </div>

      <ol className="mt-6 flex items-center gap-2 text-caption text-muted">
        {["Draft", "Sent", "Paid"].map((step, i) => (
          <li
            key={step}
            data-reveal="pop"
            style={revealDelay(900 + LIT * 28 + i * 180)}
            className="flex items-center gap-2"
          >
            {i > 0 ? <span className="h-px w-5 bg-mist-strong" /> : null}
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3 py-1 shadow-soft">
              <span
                className={cn(
                  "size-1.5 rounded-pill",
                  i === 2 ? "bg-success" : i === 1 ? "bg-sky-500" : "bg-muted-soft",
                )}
              />
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
