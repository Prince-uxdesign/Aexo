import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type LoadingDotsProps = HTMLAttributes<HTMLSpanElement> & {
  /** Announced to screen readers. Pass `null` when a parent already announces loading. */
  label?: string | null;
};

/**
 * Three pulsing dots. Used instead of a spinner because the guide avoids spinning UI.
 * Inherits text color, so it works on ink buttons and on the canvas.
 */
export function LoadingDots({ label = "Loading", className, ...props }: LoadingDotsProps) {
  return (
    <span
      role={label ? "status" : undefined}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden
          className="size-1.5 animate-loading-dot rounded-pill bg-current motion-reduce:animate-none motion-reduce:opacity-60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * Placeholder block for content that is loading. Size it with classes
 * (e.g. `h-4 w-32`). Skeletons are hidden from assistive tech, so wrap a group
 * of them in an element with `aria-busy` or pair them with a LoadingDots label.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-sm bg-surface-alt motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  message?: string;
};

/** Centered loading indicator for a page or section with nothing to show yet. */
export function LoadingState({ message = "Loading", className, ...props }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center text-muted",
        className,
      )}
      {...props}
    >
      <LoadingDots label={null} className="text-ink" />
      <p className="text-label">{message}</p>
    </div>
  );
}
