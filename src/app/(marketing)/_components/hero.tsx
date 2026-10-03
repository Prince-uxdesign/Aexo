import Link from "next/link";
import { buttonStyles } from "@/components/ui";
import { routes } from "@/config/routes";
import { HeroEnvelope } from "./hero-envelope";
import { enterDelay, scrollOffsets } from "./motion";
import { SiteHeader } from "./site-header";

// Faint "stars" in the sky. Fixed positions (percent of the island) so the
// server and client render the same thing.
const stars = [
  [6, 22, 1],
  [14, 48, 0.5],
  [21, 31, 0.5],
  [27, 64, 1],
  [33, 18, 0.5],
  [41, 52, 0.5],
  [58, 14, 1],
  [63, 41, 0.5],
  [71, 26, 0.5],
  [79, 58, 1],
  [86, 19, 0.5],
  [92, 44, 0.5],
  [11, 72, 0.5],
  [88, 70, 0.5],
] as const;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="p-2 sm:p-3">
      <div
        data-scene="exit"
        className="relative isolate overflow-hidden rounded-xl bg-linear-to-b from-sky-600 from-30% via-sky-400 via-75% to-sky-200 sm:rounded-3xl"
      >
        {/* Stars twinkle out of step and drift up a little slower than the page. */}
        <div
          aria-hidden
          className="scroll-shift pointer-events-none absolute inset-0 -z-10"
          style={scrollOffsets({ y: 120 })}
        >
          {stars.map(([left, top, size], i) => (
            <span
              key={`${left}-${top}`}
              className={
                size === 1
                  ? "absolute size-1 animate-twinkle rounded-pill bg-white/70"
                  : "absolute size-0.5 animate-twinkle rounded-pill bg-white/60"
              }
              style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${(i * 0.7) % 4}s` }}
            />
          ))}
        </div>

        <SiteHeader />

        {/* Load: each word rises out of a blur, then the copy and buttons follow.
            Scroll: the whole block drifts down, shrinks a touch and fades. */}
        <div
          className="scroll-shift scroll-fade px-gutter pt-12 text-center sm:pt-16 lg:pt-20"
          style={scrollOffsets({ y: 180, s: -0.06 })}
        >
          <h1 id="hero-title" className="text-hero text-white">
            <span className="inline-block animate-rise-in" style={enterDelay(80)}>
              Invoices,
            </span>
            <br className="sm:hidden" />{" "}
            <span className="inline-block animate-rise-in" style={enterDelay(200)}>
              not
            </span>
            <br className="max-sm:hidden" />{" "}
            <span className="inline-block animate-rise-in" style={enterDelay(320)}>
              paperwork
            </span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-lg animate-rise-in text-body-lg text-balance text-white md:mt-8"
            style={enterDelay(480)}
          >
            Make invoices that <strong className="font-medium text-white">look like you</strong>.
            Enjoy <strong className="font-medium text-white">four polished templates</strong> and
            totals that always add up.{" "}
            <strong className="font-medium text-white">Send it in minutes</strong>, not hours.
          </p>

          <div
            className="mt-8 flex animate-rise-in flex-col items-center justify-center gap-3 sm:flex-row md:mt-10"
            style={enterDelay(620)}
          >
            <Link
              href={routes.createInvoice}
              className={buttonStyles({ size: "lg", className: "w-full shadow-float sm:w-auto" })}
            >
              Create an invoice for free
            </Link>
            <Link
              href={routes.landing.templates}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-pill bg-white px-6 text-button text-ink shadow-soft transition-[translate,opacity] duration-150 ease-standard hover:-translate-y-px hover:opacity-92 sm:w-auto"
            >
              See the templates
            </Link>
          </div>
          <p className="mt-4 animate-rise-in text-caption text-white" style={enterDelay(740)}>
            No account needed to start.
          </p>
        </div>

        <HeroEnvelope />
      </div>
    </section>
  );
}
