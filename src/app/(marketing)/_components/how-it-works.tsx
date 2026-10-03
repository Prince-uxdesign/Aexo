"use client";

import { useState } from "react";
import { FileText, Link2, Mail, Printer, Send } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { SegmentedControl, iconSize, iconStroke } from "@/components/ui";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { cn } from "@/lib/utils/cn";
import { revealDelay, scrollOffsets } from "./motion";
import { InlineTile, SectionHeading, sectionClass } from "./section-heading";

type Flow = "create" | "share";

const flows: Record<Flow, { title: string; steps: { title: string; body: string }[] }> = {
  create: {
    title: "Create an invoice",
    steps: [
      {
        title: "Add your details",
        body: "Your business, your client, dates and payment terms. Add a logo if you have one.",
      },
      {
        title: "List the work",
        body: "Items, quantities and rates. Discounts and tax are worked out as you type.",
      },
      {
        title: "Pick a template",
        body: "Classic, Modern, Accent or Compact. Switch anytime without retyping a thing.",
      },
    ],
  },
  share: {
    title: "Share it with your client",
    steps: [
      {
        title: "Download or print",
        body: "Save a crisp A4 PDF or print straight from your browser.",
      },
      {
        title: "Share a private link",
        body: "Your client opens the invoice in any browser. No account needed on their side.",
      },
      {
        title: "Email it from Aexo",
        body: "Send it to your client's inbox with the link included, and see when it went out.",
      },
    ],
  },
};

export function HowItWorks() {
  const [flow, setFlow] = useState<Flow>("create");
  const current = flows[flow];

  return (
    <section id="how-it-works" aria-labelledby="how-title" className={cn(sectionClass, "pt-0")}>
      <Container>
        <SectionHeading
          id="how-title"
          title={
            <>
              How{" "}
              <InlineTile>
                <LogoMark className="size-[0.55em]" />
              </InlineTile>{" "}
              Aexo works
            </>
          }
        />

        <div data-reveal="rise" style={revealDelay(200)} className="mt-10 flex justify-center">
          <SegmentedControl
            label="Show steps for"
            value={flow}
            onValueChange={setFlow}
            fullWidth={false}
            options={[
              {
                value: "create",
                label: "Create",
                icon: <FileText size={iconSize.sm} strokeWidth={iconStroke} />,
              },
              {
                value: "share",
                label: "Share",
                icon: <Send size={iconSize.sm} strokeWidth={iconStroke} />,
              },
            ]}
          />
        </div>

        {/* The sky stage opens out from a smaller rounded window; the app window
            inside settles into place as it scrolls up. Switching tabs re-mounts
            the steps and preview, so they play their entrance again. */}
        <div
          data-reveal="clip"
          data-scene="enter"
          className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-2xl bg-linear-to-b from-sky-600 via-sky-400 to-sky-200 p-3 sm:p-6 lg:p-10"
        >
          <div className="flex items-center gap-3 px-1 pb-4 sm:pb-6">
            <span className="flex size-10 items-center justify-center rounded-pill bg-white shadow-soft">
              <LogoMark className="size-5" />
            </span>
            <p className="rounded-xs bg-ink px-2.5 py-1 text-label text-canvas">{current.title}</p>
          </div>

          <div
            className="scroll-settle grid overflow-hidden rounded-xl bg-white shadow-lift md:grid-cols-2"
            style={scrollOffsets({ y: 90, s: 0.05 })}
          >
            <ol className="flex flex-col gap-1 p-4 sm:p-8 lg:p-10">
              {current.steps.map((step, i) => (
                <li
                  key={step.title}
                  data-reveal="left"
                  style={revealDelay(250 + i * 120)}
                  className="flex gap-4 border-b border-mist-strong py-5 last:border-0"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-sky-50 text-label text-sky-700 tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-h3 text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-body text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="relative bg-mist px-6 pt-8 sm:px-10 sm:pt-10">
              <div key={flow} data-reveal="rise" style={revealDelay(350)}>
                <InvoiceDocument
                  invoice={sampleInvoice}
                  template={flow === "create" ? "modern" : "classic"}
                  aspect="600 / 640"
                  className="rounded-b-none shadow-float"
                />
              </div>
              {flow === "share" ? <ShareCard /> : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ShareCard() {
  const actions = [
    { label: "PDF", icon: FileText },
    { label: "Print", icon: Printer },
    { label: "Email", icon: Mail },
  ];
  return (
    <div
      aria-hidden
      data-reveal="zoom"
      style={revealDelay(550)}
      className="absolute inset-x-4 bottom-6 rounded-lg bg-white p-4 shadow-lift sm:inset-x-auto sm:right-6 sm:w-72"
    >
      <p className="text-label text-ink">Share {sampleInvoice.number}</p>
      <div className="mt-3 flex items-center gap-2 rounded-md bg-mist px-3 py-2.5 text-caption text-muted">
        <Link2 size={iconSize.sm} strokeWidth={iconStroke} className="shrink-0 text-sky-500" />
        <span className="truncate">Private link · /i/7f3c9a…e21a</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {actions.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="flex items-center justify-center gap-1.5 rounded-pill bg-mist py-2 text-caption text-ink"
          >
            <Icon size={14} strokeWidth={iconStroke} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
