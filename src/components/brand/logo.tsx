import Link from "next/link";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

/** The Aexo mark: an ink tile (a page) with a coral dot. Colors come from tokens. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6 shrink-0", className)}>
      <rect width="24" height="24" rx="7" className="fill-ink" />
      <rect x="6.5" y="7" width="8" height="1.75" rx="0.875" className="fill-canvas" />
      <rect x="6.5" y="11.125" width="11" height="1.75" rx="0.875" className="fill-canvas" />
      <circle cx="16.5" cy="17" r="2" className="fill-accent" />
    </svg>
  );
}

/** Mark + wordmark, linking home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={routes.home}
      aria-label={`${siteConfig.name} home`}
      className={cn("inline-flex min-h-11 items-center gap-2 rounded-sm", className)}
    >
      <LogoMark />
      <span className="text-h3 text-ink">{siteConfig.name}</span>
    </Link>
  );
}
