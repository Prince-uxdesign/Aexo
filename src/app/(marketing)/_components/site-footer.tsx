import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Create an invoice", href: routes.createInvoice },
      { label: "Templates", href: routes.landing.templates },
      { label: "Features", href: routes.landing.features },
      { label: "How it works", href: routes.landing.howItWorks },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: routes.signIn },
      { label: "Create a free account", href: routes.signUp },
    ],
  },
];

/**
 * - Phones: brand, then the two link columns side by side (short lists don't need a row each).
 * - From 768px: brand on the left, link columns on the right.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-10 py-12 md:flex-row md:justify-between md:gap-16 md:py-16">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo className="-ml-0.5 self-start" />
          <p className="text-body text-muted">{siteConfig.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:gap-16">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h2 className="text-label text-ink">{column.title}</h2>
              <ul className="flex flex-col">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-10 items-center text-body text-muted transition-colors duration-150 hover:text-ink pointer-coarse:min-h-11"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <Container className="border-t border-border py-6">
        <p className="text-caption text-muted">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </Container>
    </footer>
  );
}
