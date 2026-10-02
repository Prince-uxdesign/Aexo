import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui";
import { routes } from "@/config/routes";
import { AuthLink } from "@/components/layout/auth-link";
import { MobileNav } from "./mobile-nav";
import { marketingNav } from "./nav-items";

/**
 * Marketing navigation (guide §14: 64px, canvas background).
 * - From 1024px: logo, section links, Sign in, Create Invoice.
 * - 768–1023px: section links move into the menu; Sign in and Create stay.
 * - Phones: logo, Create Invoice and a menu button.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas">
      <Container className="flex h-header items-center gap-4 lg:gap-8">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {marketingNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-10 items-center rounded-pill px-3.5 text-label font-normal text-muted transition-colors duration-150 hover:bg-surface-alt hover:text-ink pointer-coarse:h-11"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <AuthLink className="hidden md:inline-flex" />
          <Link href={routes.createInvoice} className={buttonStyles({ size: "sm" })}>
            Create Invoice
          </Link>
          <MobileNav className="-mr-2 lg:hidden" />
        </div>
      </Container>
    </header>
  );
}
