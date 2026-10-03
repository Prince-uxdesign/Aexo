import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { revealDelay } from "./motion";
import { marketingNav } from "./nav-items";

const columns = [
  { title: "Home page", links: marketingNav },
  {
    title: "Get started",
    links: [
      { label: "Create an invoice", href: routes.createInvoice },
      { label: "Create a free account", href: routes.signUp },
      { label: "Sign in", href: routes.signIn },
    ],
  },
  {
    title: "Templates",
    links: [
      { label: "Classic", href: routes.createInvoiceWith("classic") },
      { label: "Modern", href: routes.createInvoiceWith("modern") },
      { label: "Accent", href: routes.createInvoiceWith("accent") },
      { label: "Compact", href: routes.createInvoiceWith("compact") },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-white">
      <Container className="grid gap-12 pt-16 pb-10 md:pt-20 lg:grid-cols-[1fr_auto] lg:gap-24">
        <div>
          <Logo className="-ml-0.5" />
          <p className="mt-2 max-w-xs text-body text-muted">{siteConfig.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-x-16 lg:gap-x-24">
          {columns.map((column, i) => (
            <nav
              key={column.title}
              aria-label={column.title}
              data-reveal="rise"
              style={revealDelay(i * 100)}
            >
              <h2 className="text-label text-ink">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-body text-muted transition-colors duration-150 hover:text-ink"
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

      <Container className="flex flex-col gap-2 pt-6 pb-10 text-caption text-muted sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <p>Made for freelancers, studios and small businesses.</p>
      </Container>
    </footer>
  );
}
