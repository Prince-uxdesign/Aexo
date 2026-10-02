import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui";
import { routes } from "@/config/routes";

/** Closing call to action. The button is full width on phones, natural width from 640px. */
export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="pb-section">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-surface-alt px-6 py-12 text-center sm:px-10 md:py-16 lg:py-20">
          <LogoMark className="size-10" />
          <div className="flex max-w-xl flex-col gap-3">
            <h2 id="final-cta-title" className="text-h1 text-ink">
              Create your first invoice
            </h2>
            <p className="text-body-lg text-muted">
              It takes a few minutes, and you don&apos;t need an account to start.
            </p>
          </div>
          <Link
            href={routes.createInvoice}
            className={buttonStyles({ size: "lg", className: "mt-2 w-full sm:w-auto sm:px-8" })}
          >
            Create an Invoice
          </Link>
        </div>
      </Container>
    </section>
  );
}
