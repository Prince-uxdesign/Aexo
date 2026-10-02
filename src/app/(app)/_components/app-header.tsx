import Link from "next/link";
import { Plus } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { buttonStyles, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { AccountMenu } from "./account-menu";

/**
 * Header for signed-in pages (guide §14: 64px, canvas). Product navigation
 * (Dashboard) joins the logo; creating stays one tap away on every screen.
 * On phones "Create invoice" shrinks to its icon so the account menu fits.
 */
export function AppHeader({ name, email }: { name: string | null; email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas print:hidden">
      <Container className="flex h-header items-center gap-3">
        <Logo />
        <nav aria-label="Product" className="ml-2 hidden sm:block">
          <Link
            href={routes.dashboard}
            className="inline-flex min-h-11 items-center rounded-pill px-3.5 text-label font-normal text-muted transition-colors duration-150 hover:bg-surface-alt hover:text-ink"
          >
            Dashboard
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={routes.createInvoice}
            aria-label="Create invoice"
            className={buttonStyles({ size: "sm", className: "max-sm:w-11 max-sm:px-0" })}
          >
            <Plus size={iconSize.md} strokeWidth={iconStroke} aria-hidden className="sm:hidden" />
            <span className="max-sm:sr-only">Create invoice</span>
          </Link>
          <AccountMenu name={name} email={email} />
        </div>
      </Container>
    </header>
  );
}
