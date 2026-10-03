import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonStyles, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { BrandBand, BrandPanel } from "./_components/brand-panel";

/**
 * Auth shell, in the landing page's sky design (cool theme on white).
 * - Phones: a compact sky band, then the form, top-aligned so the keyboard
 *   never covers the active field.
 * - Tablets: a taller sky band with the message above a wider form.
 * - From 1024px: split layout. Pinned sky panel left, focused form right.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="theme-cool grid min-h-dvh flex-1 bg-white lg:grid-cols-2 xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <BrandPanel />

      <div className="flex min-w-0 flex-col">
        <BrandBand />

        <header className="hidden h-header shrink-0 items-center justify-between gap-4 px-gutter pt-3 lg:flex">
          <Link href={routes.home} className={buttonStyles({ variant: "ghost", size: "sm" })}>
            <ArrowLeft size={iconSize.sm} strokeWidth={iconStroke} />
            Back to home
          </Link>
          <Link
            href={routes.createInvoice}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            Create an invoice
          </Link>
        </header>

        <main
          id="main"
          className="flex flex-1 flex-col px-gutter pt-8 pb-12 sm:pt-12 lg:justify-center lg:py-12"
        >
          <div className="mx-auto w-full max-w-md">{children}</div>
        </main>

        <footer className="flex flex-col items-center gap-1 px-gutter py-6 text-center text-caption text-muted sm:flex-row sm:justify-center sm:gap-2">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <Link
            href={routes.home}
            className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline lg:hidden"
          >
            Back to home
          </Link>
          <span className="max-lg:hidden">Make an invoice. Send it. Done.</span>
        </footer>
      </div>
    </div>
  );
}
