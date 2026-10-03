import type { ReactNode } from "react";
import { FileText, FolderOpen, Link2, Mail, MousePointer2, Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { iconSize, iconStroke } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { revealDelay } from "./motion";
import { InlineTile, SectionHeading, sectionClass } from "./section-heading";

/** Three steps from a first invoice to a managed list; the middle one is highlighted. */
export function SuperchargeSection() {
  return (
    <section aria-labelledby="grow-title" className={sectionClass}>
      <Container>
        <SectionHeading
          id="grow-title"
          title={
            <>
              From one invoice
              <br className="max-sm:hidden" /> to <InlineTile icon={FolderOpen} /> all of them
            </>
          }
        />

        <ol className="mx-auto mt-14 grid max-w-6xl gap-4 md:mt-20 lg:grid-cols-3 lg:items-center lg:gap-6">
          <Step
            n={1}
            title="Start without an account"
            body="Open the creator and go. No sign-up, no card, nothing to install."
          >
            <StartVisual />
          </Step>
          <Step
            n={2}
            highlight
            title="Save it to a free account"
            body="Keep every invoice in one place and come back to edit, duplicate or resend."
          >
            <OrbitVisual />
          </Step>
          <Step
            n={3}
            title="Track what's been paid"
            body="Mark invoices sent, paid or overdue. Search and archive as the list grows."
          >
            <TableVisual />
          </Step>
        </ol>
      </Container>
    </section>
  );
}

function Step({
  n,
  title,
  body,
  highlight,
  children,
}: {
  n: number;
  title: string;
  body: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      data-reveal={highlight ? "zoom" : "rise"}
      style={revealDelay((n - 1) * 150)}
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl p-card lg:p-8",
        highlight
          ? "bg-linear-to-b from-sky-600 via-sky-500 to-sky-200 text-white shadow-lift lg:min-h-160"
          : "bg-white shadow-soft lg:min-h-136",
      )}
    >
      <div className="flex gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-pill text-h3 tabular-nums",
            highlight ? "bg-white text-ink" : "text-muted-soft",
          )}
        >
          {n}
        </span>
        <div>
          <h3 className={cn("text-card", highlight ? "text-white" : "text-ink")}>{title}</h3>
          <p className={cn("mt-3 text-body", highlight ? "text-white" : "text-muted")}>{body}</p>
        </div>
      </div>
      <div aria-hidden className="relative mt-10 flex min-h-64 flex-1 items-center justify-center">
        {children}
      </div>
    </li>
  );
}

function StartVisual() {
  return (
    <div className="relative">
      <div className="rounded-xl bg-mist p-5">
        <div className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-soft">
          <span className="h-2.5 w-24 rounded-pill bg-mist-strong" />
          <span className="h-2.5 w-36 rounded-pill bg-mist-strong" />
          <span className="h-2.5 w-28 rounded-pill bg-mist-strong" />
        </div>
        <span className="mt-4 flex justify-center rounded-pill bg-ink px-5 py-2.5 text-button text-canvas">
          Create Invoice
        </span>
      </div>
      <span data-reveal="pop" style={revealDelay(700)} className="absolute -right-3 -bottom-3">
        <MousePointer2
          size={iconSize.lg}
          strokeWidth={iconStroke}
          className="fill-white text-ink"
        />
      </span>
    </div>
  );
}

function OrbitVisual() {
  const nodes = [
    { icon: FileText, className: "left-[12%] top-[8%]" },
    { icon: Link2, className: "right-[10%] top-[16%]" },
    { icon: Mail, className: "bottom-0 left-1/2 -translate-x-1/2" },
  ];
  return (
    <div className="relative size-72">
      {/* The ring and its icons turn slowly; each icon counter-rotates to stay upright. */}
      <div data-reveal="zoom" style={revealDelay(350)} className="absolute inset-0">
        <div className="absolute inset-0 animate-orbit">
          <div className="absolute inset-4 rounded-pill border border-white/50" />
          {nodes.map(({ icon: Icon, className }, i) => (
            <span
              key={i}
              className={cn(
                "absolute flex size-14 animate-orbit-reverse items-center justify-center rounded-pill bg-white text-sky-600 shadow-float",
                className,
              )}
            >
              <Icon size={iconSize.lg} strokeWidth={iconStroke} />
            </span>
          ))}
        </div>
      </div>
      <div
        data-reveal="pop"
        style={revealDelay(650)}
        className="absolute top-1/2 left-1/2 w-60 -translate-1/2 rounded-lg bg-white p-4 text-ink shadow-lift"
      >
        <p className="flex items-center gap-2 text-label">
          <FolderOpen size={iconSize.sm} strokeWidth={iconStroke} className="text-sky-600" />
          Your invoices, in one place
        </p>
        <p className="mt-1.5 text-caption text-muted">
          Drafts, sent and paid, ready whenever you are.
        </p>
      </div>
    </div>
  );
}

const rows = [
  { number: "INV-0142", client: "Harbor & Pine", status: "Paid", dot: "bg-success" },
  { number: "INV-0141", client: "Northwind", status: "Sent", dot: "bg-accent" },
  { number: "INV-0140", client: "Fieldnote", status: "Overdue", dot: "bg-warning" },
  { number: "INV-0139", client: "Oak & Ivy", status: "Draft", dot: "bg-muted-soft" },
];

function TableVisual() {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-white shadow-float">
      <div className="flex items-center gap-2 border-b border-mist-strong px-4 py-3 text-caption text-muted-soft">
        <Search size={14} strokeWidth={iconStroke} />
        Search invoices
      </div>
      <table className="w-full text-left text-caption">
        <thead className="text-muted">
          <tr>
            <th className="px-4 py-2 font-normal">Invoice</th>
            <th className="px-2 py-2 font-normal">Client</th>
            <th className="px-4 py-2 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.number}
              data-reveal="left"
              style={revealDelay(450 + i * 120)}
              className={cn("border-t border-mist-strong", i === 0 && "bg-sky-50")}
            >
              <td className="px-4 py-2.5 text-ink tabular-nums">{row.number}</td>
              <td className="truncate px-2 py-2.5 text-muted">{row.client}</td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <span className={cn("size-1.5 rounded-pill", row.dot)} />
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
