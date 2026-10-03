import type { CSSProperties } from "react";

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Inline script placed first inside the marketing layout's `[data-motion-root]`.
 * It runs while the HTML is parsed (before first paint) on full page loads and
 * turns motion on for that root, so scroll-revealed content starts hidden
 * instead of flashing. <ScrollMotion /> does the same on client navigations.
 * (Not on <html>: React owns its attributes and would report a mismatch.)
 */
export const MOTION_BOOT_SCRIPT = `if(!matchMedia("${REDUCED_MOTION}").matches)document.currentScript.parentElement.dataset.motion=""`;

/*
 * Inline-style helpers for the landing page motion (see globals.css). Custom
 * properties aren't part of CSSProperties, hence the casts.
 */

/** Stagger a `data-reveal` element. */
export function revealDelay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

/** Offsets for `scroll-shift` / `scroll-settle`: px, px, degrees, scale delta. */
export function scrollOffsets({
  x = 0,
  y = 0,
  r = 0,
  s = 0,
}: {
  x?: number;
  y?: number;
  r?: number;
  s?: number;
}): CSSProperties {
  return { "--x": `${x}px`, "--y": `${y}px`, "--r": `${r}deg`, "--s": s } as CSSProperties;
}

/** Delay a keyframe entrance (`animate-rise-in`, …) on page load. */
export function enterDelay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}
