import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  /** Optional centered text, e.g. "or". Horizontal only. */
  label?: ReactNode;
  className?: string;
};

export function Divider({ orientation = "horizontal", label, className }: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("w-px self-stretch bg-border", className)}
      />
    );
  }

  if (label) {
    return (
      <div role="separator" className={cn("flex items-center gap-3", className)}>
        <span aria-hidden className="h-px flex-1 bg-border" />
        <span className="text-caption text-muted">{label}</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return <hr className={cn("h-px border-0 bg-border", className)} />;
}
