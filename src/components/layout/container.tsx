import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** `page` (1440px) for app screens, `reading` (640px) for reading-width content. */
  width?: "page" | "reading";
};

/**
 * Horizontal page frame: centered, capped width, responsive gutter
 * (16 → 20 → 24 → 32px). Use it instead of adding page padding by hand.
 */
export function Container({
  as: Component = "div",
  width = "page",
  className,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-gutter",
        width === "page" ? "max-w-page" : "max-w-reading",
        className,
      )}
      {...props}
    />
  );
}
