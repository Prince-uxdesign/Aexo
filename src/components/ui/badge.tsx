import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error";

// The semantic colors are too light to use as text on cream, so status is shown
// with a colored dot next to ink text. This also keeps color use restrained (§4).
const dotTone: Record<BadgeTone, string> = {
  neutral: "bg-muted",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** Hide the dot for purely informational labels. */
  dot?: boolean;
};

/** Small status label, e.g. invoice status. The text must name the status, not just the color. */
export function Badge({ tone = "neutral", dot = true, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1.5 rounded-pill border border-border bg-surface-alt px-2.5 text-caption font-medium whitespace-nowrap text-ink",
        className,
      )}
      {...props}
    >
      {dot ? (
        <span aria-hidden className={cn("size-1.5 shrink-0 rounded-pill", dotTone[tone])} />
      ) : null}
      {/* Badges are short labels; anything too long for the space is truncated. */}
      <span className="truncate">{children}</span>
    </span>
  );
}
