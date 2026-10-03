import { cn } from "@/lib/utils/cn";

/*
 * The sky look shared by the landing hero, the auth pages and the signed-in
 * app's banners: a soft blue gradient with faint, twinkling stars.
 * White text only sits on the sky-600 part of the gradient (4.6:1), so put
 * headings near the top of a sky surface, or hold sky-600 longer with
 * `from-<n>%` when the surface is short.
 */

/** Gradient + clipping for a sky surface. Add your own radius. */
export const skySurface =
  "relative isolate overflow-hidden bg-linear-to-b from-sky-600 from-30% via-sky-400 via-75% to-sky-200";

// Fixed positions (percent of the surface) so server and client match.
const stars = [
  [8, 14, 1],
  [18, 38, 0.5],
  [31, 9, 0.5],
  [44, 27, 1],
  [57, 12, 0.5],
  [68, 33, 0.5],
  [81, 18, 1],
  [90, 41, 0.5],
  [12, 56, 0.5],
  [86, 60, 0.5],
] as const;

/** Decorative stars; place as the first child of a `skySurface`. */
export function SkyStars({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      {stars.map(([left, top, size], i) => (
        <span
          key={`${left}-${top}`}
          className={cn(
            "absolute animate-twinkle rounded-pill",
            size === 1 ? "size-1 bg-white/70" : "size-0.5 bg-white/60",
          )}
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${(i * 0.7) % 4}s` }}
        />
      ))}
    </div>
  );
}
