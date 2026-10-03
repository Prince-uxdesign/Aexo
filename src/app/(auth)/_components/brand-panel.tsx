import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Check, Link2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SkyStars, skySurface } from "@/components/brand/sky";
import { iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { computeTotals } from "@/features/invoice/model/totals";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { formatMoney } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";
import { AccountBenefits } from "./account-benefits";

/*
 * The sky side of the auth pages, in the landing hero's language: a rounded
 * sky-blue island with faint twinkling stars, white type, and a real Aexo
 * invoice rising from the bottom edge with a few status cards around it.
 * White text only sits on the sky-600 top of the gradient (4.6:1).
 */

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/** From 1024px: the left half of the split layout, pinned while the form scrolls. */
export function BrandPanel() {
  return (
    <aside className="hidden p-3 lg:block">
      <div
        className={cn(skySurface, "sticky top-3 flex h-[calc(100dvh-1.5rem)] flex-col rounded-3xl")}
      >
        <SkyStars />

        <div className="animate-header-in px-10 pt-8 xl:px-12">
          <Logo inverted />
        </div>

        <div className="px-10 pt-10 xl:px-12 xl:pt-14">
          <p className="max-w-lg animate-rise-in text-section text-white" style={delay(100)}>
            Every invoice,
            <br /> in one place
          </p>
          <p className="mt-5 max-w-md animate-rise-in text-body-lg text-white" style={delay(240)}>
            Save, edit and share your invoices, and see what&apos;s been paid at a glance.
          </p>
          <AccountBenefits className="mt-7 animate-rise-in" style={delay(380)} />
        </div>

        <Showcase />
      </div>
    </aside>
  );
}

/** A real invoice rising out of the bottom edge, with status cards floating around it. */
function Showcase() {
  const total = formatMoney(
    computeTotals(sampleInvoice).total,
    sampleInvoice.currency,
    sampleInvoice.locale,
  );

  return (
    <div aria-hidden className="relative mt-auto min-h-64 flex-1">
      <div
        className="absolute inset-x-[16%] top-12 animate-envelope-in xl:inset-x-[20%]"
        style={delay(420)}
      >
        <InvoiceDocument invoice={sampleInvoice} template="modern" className="shadow-lift" />
      </div>

      <FloatCard className="top-4 right-[6%]" enter={900} float={0}>
        <span className="flex size-8 items-center justify-center rounded-pill bg-sky-50 text-sky-600">
          <Link2 size={iconSize.sm} strokeWidth={iconStroke} />
        </span>
        <span>
          <span className="block text-label text-ink">Share link copied</span>
          <span className="block text-caption text-muted">/i/7f3c9a…e21a</span>
        </span>
      </FloatCard>

      <FloatCard className="top-60 left-[4%]" enter={1080} float={1.5}>
        <span className="flex size-8 items-center justify-center rounded-pill bg-success/12 text-ink">
          <Check size={iconSize.sm} strokeWidth={2.5} />
        </span>
        <span>
          <span className="block text-label text-ink">{sampleInvoice.number} · Paid</span>
          <span className="block text-caption text-muted">{sampleInvoice.recipient.name}</span>
        </span>
      </FloatCard>

      <FloatCard className="right-[8%] bottom-10" enter={1260} float={3}>
        <span>
          <span className="block text-caption text-muted">Total due</span>
          <span className="block text-h3 text-ink tabular-nums">{total}</span>
        </span>
      </FloatCard>
    </div>
  );
}

function FloatCard({
  className,
  enter,
  float,
  children,
}: {
  className: string;
  /** Entrance delay, ms. */
  enter: number;
  /** Phase offset of the idle float, seconds. */
  float: number;
  children: ReactNode;
}) {
  return (
    <div className={cn("absolute z-10 animate-rise-in", className)} style={delay(enter)}>
      <div
        className="flex animate-float items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lift"
        style={{ animationDelay: `${float}s` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Below 1024px: a compact sky band on top with the logo and a way back to the
 * invoice creator. From 640px it also carries the message and a peek of an
 * invoice, so a tall portrait screen isn't mostly empty. Short landscape
 * screens keep only the bar, so the form comes first.
 */
export function BrandBand() {
  return (
    <div className="p-2 sm:p-3 lg:hidden">
      {/* Phones: hold sky-600 longer so the white headline near the bottom stays legible. */}
      <div className={cn(skySurface, "rounded-xl max-sm:from-70% max-sm:via-90% sm:rounded-2xl")}>
        <SkyStars />
        <header className="flex h-header animate-header-in items-center justify-between gap-4 px-4 sm:px-6">
          <Logo inverted />
          <Link
            href={routes.createInvoice}
            className="inline-flex min-h-11 items-center rounded-pill px-3 text-label text-white transition-colors duration-150 hover:bg-white/12"
          >
            Create an invoice
          </Link>
        </header>

        <div className="px-4 pt-2 pb-7 sm:hidden short:hidden">
          <p className="animate-rise-in text-h2 text-white" style={delay(100)}>
            Every invoice, in one place
          </p>
        </div>

        <div className="hidden grid-cols-[1fr_auto] items-end gap-8 px-6 pt-4 sm:grid md:px-10 short:hidden">
          <div className="pb-10">
            <p className="animate-rise-in text-h1 text-white" style={delay(100)}>
              Every invoice,
              <br /> in one place
            </p>
            <AccountBenefits className="mt-6 animate-rise-in" style={delay(240)} />
          </div>
          <div aria-hidden className="w-40 animate-envelope-in md:w-48" style={delay(300)}>
            <InvoiceDocument
              invoice={sampleInvoice}
              template="modern"
              aspect="600 / 560"
              className="rounded-b-none shadow-lift"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
