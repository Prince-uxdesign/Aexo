import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { LoadingDots } from "./loading";

type IconButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type IconButtonSize = "sm" | "md";

const variants: Record<IconButtonVariant, string> = {
  primary: "bg-ink text-canvas hover:opacity-88 active:opacity-80",
  secondary: "border border-border-strong bg-surface-alt text-ink hover:bg-border active:bg-border",
  ghost: "text-ink hover:bg-surface-alt active:bg-border",
  destructive: "text-error-strong hover:bg-error/8 active:bg-error/14",
};

const sizes: Record<IconButtonSize, string> = {
  sm: "size-9 pointer-coarse:size-11",
  md: "size-11",
};

export type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  /** Accessible name. Required because the button has no visible text. */
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
};

/** Circular, icon-only button (§6: icon buttons are circular). */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  loading = false,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill transition-[opacity,background-color] duration-150 ease-standard",
        "disabled:pointer-events-none disabled:opacity-40 aria-busy:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <LoadingDots label={null} /> : icon}
    </button>
  );
}
