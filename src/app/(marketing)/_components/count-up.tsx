"use client";

import { useEffect, useRef } from "react";

const wholeCurrency = (locale: string, currency: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

type CountUpProps = {
  /** Whole-number amount to count up to, e.g. 10621. */
  value: number;
  currency: string;
  locale: string;
  /** Milliseconds. */
  duration?: number;
};

/**
 * A whole currency amount that counts up from zero the first time it scrolls
 * into view. The server renders the final value, so it's correct without JS,
 * and nothing moves for people who prefer reduced motion (no `[data-motion]` root).
 */
export function CountUp({ value, currency, locale, duration = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el?.closest("[data-motion]")) return;

    const format = wholeCurrency(locale, currency);
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(2, -10 * t); // ease-out-expo
          el.textContent = format.format(Math.round(value * (t === 1 ? 1 : eased)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        el.textContent = format.format(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, currency, locale, duration]);

  const final = wholeCurrency(locale, currency).format(value);
  // The invisible copy reserves the final width, so nothing shifts while counting.
  return (
    <span className="relative inline-block">
      <span className="invisible">{final}</span>
      <span ref={ref} className="absolute inset-y-0 right-0">
        {final}
      </span>
    </span>
  );
}
