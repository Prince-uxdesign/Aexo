"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

const items = [
  // Invoice pages live under the dashboard as far as navigation is concerned.
  { label: "Dashboard", href: routes.dashboard, match: [routes.dashboard, routes.invoices] },
  { label: "Account", href: routes.account, match: [routes.account] },
];

/** Product navigation in the app header; the current section gets a soft pill. */
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Product" className="ml-2 hidden sm:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = item.match.some(
            (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
          );
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-pill px-3.5 text-label transition-colors duration-150 pointer-coarse:min-h-11",
                  active
                    ? "bg-mist text-ink"
                    : "font-normal text-muted hover:bg-mist hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
