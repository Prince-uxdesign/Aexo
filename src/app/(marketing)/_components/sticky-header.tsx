"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The landing page `<header>`. Sets `data-scrolled` once the page leaves the
 * very top, so the bar can pick up its own sky background (styled with
 * `data-scrolled:` variants by the caller).
 */
export function StickyHeader({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header ref={ref} className={className}>
      {children}
    </header>
  );
}
