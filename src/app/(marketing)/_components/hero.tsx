import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui";
import { routes } from "@/config/routes";
import { HeroPreview } from "./hero-preview";

const outputs = ["PDF", "Print", "Share link", "Email"];

/**
 * Hero (guide §15).
 * - Phones: H1-sized headline (2 lines), one full-width action, preview below
 *   and already in view on a 375px screen.
 * - From 640px: display headline and both actions; preview below.
 * - 768–1279px (tablets): text centred over the centred preview, so wide
 *   tablets don't leave an empty right half.
 * - Up to 1279px: stacked, so the preview can be large.
 * - From 1280px: text and preview side by side, 6 / 6 columns.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="pt-8 pb-section sm:pt-14 xl:pt-20">
      <Container className="grid gap-10 sm:gap-12 md:gap-14 xl:grid-cols-12 xl:items-center xl:gap-12 2xl:gap-16">
        <div className="flex max-w-2xl flex-col gap-6 md:mx-auto md:items-center md:text-center xl:col-span-6 xl:mx-0 xl:max-w-none xl:items-start xl:text-left">
          <p
            className="flex animate-fade-up items-center gap-2 text-label text-muted"
            style={{ animationDelay: "0ms" }}
          >
            <span aria-hidden className="size-1.5 rounded-pill bg-accent" />
            No account needed to start
          </p>
          <h1
            id="hero-title"
            className="animate-fade-up text-h1 text-ink sm:text-display"
            style={{ animationDelay: "40ms" }}
          >
            Create professional invoices in minutes.
          </h1>
          <p
            className="animate-fade-up text-body-lg text-muted md:max-w-xl"
            style={{ animationDelay: "80ms" }}
          >
            Add your details and your client&apos;s, customise the template and watch the invoice
            update as you type. Then download, print or send it.
          </p>

          <div
            className="mt-2 flex animate-fade-up flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-center xl:justify-start"
            style={{ animationDelay: "120ms" }}
          >
            <Link href={routes.createInvoice} className={buttonStyles({ size: "lg" })}>
              Create an Invoice
            </Link>
            <Link
              href={routes.landing.templates}
              className={buttonStyles({
                variant: "secondary",
                size: "lg",
                // Phones get one clear action; Templates is the next section and in the menu.
                className: "hidden sm:inline-flex",
              })}
            >
              View Templates
            </Link>
          </div>

          <ul
            aria-label="What you can do with your invoice"
            className="flex animate-fade-up flex-wrap gap-x-4 gap-y-1 text-caption text-muted md:justify-center xl:justify-start"
            style={{ animationDelay: "160ms" }}
          >
            {outputs.map((output, index) => (
              <li key={output} className="flex items-center gap-4">
                {index > 0 ? (
                  <span aria-hidden className="size-1 rounded-pill bg-border-strong" />
                ) : null}
                {output}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up xl:col-span-6" style={{ animationDelay: "120ms" }}>
          <HeroPreview />
        </div>
      </Container>
    </section>
  );
}
