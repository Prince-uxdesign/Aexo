import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SkyStars, skySurface } from "@/components/brand/sky";
import { iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

export type DashboardStat = {
  label: string;
  value: string;
  /** Small line under the value: a count, a hint. */
  note: string;
  icon: ReactNode;
};

const enter = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/**
 * Dashboard banner in the landing hero's sky style: greeting, a one-line
 * money summary and the main action in white on the dark top of the
 * gradient, the overview as white cards on its lighter lower half. Without
 * stats (no invoices yet) the banner is short, so it holds sky-600 longer to
 * keep the white text legible.
 */
export function DashboardHero({
  greeting,
  summary,
  stats,
  showAction,
}: {
  greeting: string;
  summary: string;
  stats?: DashboardStat[];
  /** Off while the list is empty: the empty state carries the same action. */
  showAction: boolean;
}) {
  return (
    <section
      aria-labelledby="dashboard-title"
      className={cn(
        skySurface,
        "rounded-xl px-5 pt-7 pb-5 sm:rounded-3xl sm:px-8 sm:pt-10 sm:pb-8 lg:px-10",
        !stats && "from-70% via-90% pb-10 sm:pb-14",
      )}
    >
      <SkyStars />

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 id="dashboard-title" className="animate-rise-in text-h1 text-white">
            {greeting}
          </h1>
          <p
            className="max-w-xl animate-rise-in text-body-lg text-balance text-white"
            style={enter(120)}
          >
            {summary}
          </p>
        </div>
        {showAction ? (
          <Link
            href={routes.createInvoice}
            className="inline-flex min-h-12 animate-rise-in items-center gap-2 rounded-pill bg-white px-5 text-button text-ink shadow-float transition-[translate,opacity] duration-150 ease-standard hover:-translate-y-px hover:opacity-92 max-sm:w-full max-sm:justify-center"
            style={enter(220)}
          >
            <Plus size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
            Create invoice
          </Link>
        ) : null}
      </div>

      {stats ? (
        <dl
          aria-label="Invoice overview"
          className="mt-6 grid grid-cols-2 gap-2 sm:mt-12 sm:gap-3 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex min-w-0 animate-rise-in flex-col rounded-lg bg-white p-3.5 shadow-soft sm:rounded-xl sm:p-5"
              style={enter(300 + i * 80)}
            >
              <dt className="flex min-w-0 items-center gap-2 text-label font-normal text-muted sm:gap-2.5">
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-sky-50 text-sky-600 sm:size-8"
                >
                  {stat.icon}
                </span>
                <span className="truncate">{stat.label}</span>
              </dt>
              <dd className="mt-3 flex min-w-0 flex-col gap-0.5 sm:mt-4">
                <span
                  className="truncate text-h3 text-ink tabular-nums sm:text-h2"
                  title={stat.value}
                >
                  {stat.value}
                </span>
                <span className="text-caption text-pretty text-muted">{stat.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
