import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { BrandBand, BrandPanel } from "./_components/brand-panel";

/**
 * Auth shell.
 * - Phones: slim header, then the form, top-aligned so the keyboard never
 *   covers the active field.
 * - Tablets: a brand band above a wider form.
 * - From 1024px: split layout. Brand panel left, focused form column right.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <BrandPanel />

      <div className="flex min-w-0 flex-col">
        <header className="flex h-header shrink-0 items-center justify-between gap-4 px-gutter lg:justify-end">
          <Logo className="lg:hidden" />
          <Link
            href={routes.createInvoice}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            Create an invoice
          </Link>
        </header>

        <BrandBand />

        <main
          id="main"
          className="flex flex-1 flex-col px-gutter pt-8 pb-12 sm:pt-12 lg:justify-center lg:py-16"
        >
          <div className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-md">{children}</div>
        </main>

        <footer className="px-gutter py-6 text-center text-caption text-muted">
          © {new Date().getFullYear()} {siteConfig.name} ·{" "}
          <Link
            href={routes.home}
            className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline"
          >
            Back to home
          </Link>
        </footer>
      </div>
    </div>
  );
}
