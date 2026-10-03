import Link from "next/link";
import { Check } from "lucide-react";
import { buttonStyles, iconSize } from "@/components/ui";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import { revealDelay, scrollOffsets } from "./motion";

const plans = [
  {
    name: "Without an account",
    price: "Free",
    blurb: "For a quick invoice, right now.",
    features: ["All four templates", "PDF download and print", "Discounts, tax, 15 currencies"],
    cta: { label: "Start for free", href: routes.createInvoice, variant: "secondary" as const },
  },
  {
    name: "Free account",
    price: "Free",
    blurb: "For people who invoice every month.",
    features: [
      "Save and edit every invoice",
      "Private share links",
      "Email invoices to clients",
      "Track status, search and archive",
    ],
    cta: { label: "Create a free account", href: routes.signUp, variant: "primary" as const },
    note: "No credit card required",
    featured: true,
  },
];

// Soft cloud shapes: blurred white pills along the island's lower edges.
// They part (drift outward, at different speeds) as the island scrolls past.
const clouds = [
  { className: "-left-16 bottom-24 h-40 w-96", x: -160 },
  { className: "-left-10 bottom-0 h-48 w-md", x: -90 },
  { className: "left-1/4 -bottom-20 h-40 w-lg", x: -50 },
  { className: "-right-20 bottom-28 h-44 w-96", x: 160 },
  { className: "-right-10 -bottom-6 h-56 w-lg", x: 90 },
  { className: "right-1/4 -bottom-24 h-40 w-md", x: 50 },
];

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-6 p-2 sm:p-3">
      <div
        data-scene
        className="relative isolate overflow-hidden rounded-xl bg-linear-to-b from-sky-600 via-sky-500 via-40% to-sky-200 px-gutter py-20 sm:rounded-3xl md:py-28"
      >
        <div aria-hidden className="absolute inset-0 -z-10">
          {clouds.map((cloud) => (
            <span
              key={cloud.className}
              className={cn(
                "scroll-shift absolute rounded-pill bg-white/60 blur-3xl",
                cloud.className,
              )}
              style={scrollOffsets({ x: cloud.x, y: -30 })}
            />
          ))}
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h2 id="pricing-title" data-reveal="blur" className="text-hero text-white">
            Simple pricing
          </h2>
          <p data-reveal="rise" style={revealDelay(150)} className="mt-5 text-body-lg text-white">
            Make your first invoice in seconds. Sign up only when you want to keep it.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-3xl gap-4 md:mt-16 md:grid-cols-2 md:items-center md:gap-6">
          {plans.map((plan, i) => (
            <li
              key={plan.name}
              data-reveal={plan.featured ? "zoom" : "rise"}
              style={revealDelay(250 + i * 150)}
              className={cn(
                "flex flex-col rounded-xl bg-white p-6 sm:p-7",
                plan.featured ? "shadow-lift md:min-h-120" : "shadow-float md:min-h-108",
              )}
            >
              <h3 className="text-label text-ink">{plan.name}</h3>
              <p className="mt-2 text-display text-ink">{plan.price}</p>
              <p className="mt-3 text-body text-muted">{plan.blurb}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-body text-foreground">
                    <Check size={iconSize.sm} strokeWidth={2} className="shrink-0 text-ink" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Link
                  href={plan.cta.href}
                  className={buttonStyles({
                    variant: plan.cta.variant,
                    size: "lg",
                    fullWidth: true,
                    className:
                      plan.cta.variant === "secondary"
                        ? "border-0 bg-mist hover:bg-mist-strong active:bg-mist-strong"
                        : undefined,
                  })}
                >
                  {plan.cta.label}
                </Link>
                {plan.note ? (
                  <p className="mt-2.5 text-center text-caption text-muted">{plan.note}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
