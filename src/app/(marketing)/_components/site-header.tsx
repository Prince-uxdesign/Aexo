import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AuthLink } from "@/components/layout/auth-link";
import { routes } from "@/config/routes";
import { MobileNav } from "./mobile-nav";
import { marketingNav } from "./nav-items";

/**
 * Marketing navigation, drawn inside the sky hero (white on sky-600).
 * - From 1024px: logo, centred section links, Sign in, Create Invoice.
 * - 768–1023px: section links move into the menu; Sign in and Create stay.
 * - Phones: logo, Create Invoice and a menu button.
 */
export function SiteHeader() {
  return (
    <header className="relative z-20 animate-header-in">
      <div className="flex h-header items-center gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Logo inverted className="justify-self-start" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {marketingNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-10 items-center rounded-pill px-3.5 text-label font-normal text-white/90 transition-colors duration-150 hover:bg-white/12 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 justify-self-end">
          <AuthLink className="hidden text-white hover:bg-white/12 active:bg-white/20 md:inline-flex" />
          <Link
            href={routes.createInvoice}
            className="inline-flex min-h-10 items-center rounded-pill bg-white px-5 text-button text-ink shadow-soft transition-[translate,opacity] duration-150 ease-standard hover:-translate-y-px hover:opacity-92 pointer-coarse:min-h-11"
          >
            Create Invoice
          </Link>
          <MobileNav className="-mr-2 text-white hover:bg-white/12 active:bg-white/20 lg:hidden" />
        </div>
      </div>
    </header>
  );
}
