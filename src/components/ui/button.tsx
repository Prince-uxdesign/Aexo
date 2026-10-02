import type { ComponentProps, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { iconSize, iconStroke } from "./icon";
import { LoadingDots } from "./loading";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "destructive-solid";
export type ButtonSize = "sm" | "md" | "lg";

// Labels may wrap (balanced, centered) instead of overflowing a narrow screen,
// so heights are minimums rather than fixed.
const base =
  "relative inline-flex max-w-full shrink-0 items-center justify-center gap-2 rounded-pill text-center text-button text-balance select-none " +
  "transition-[opacity,translate,background-color,border-color,color] duration-150 ease-standard " +
  "disabled:pointer-events-none disabled:opacity-40 aria-busy:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  // Ink is the primary action color (§8). Hover: ~0.88 opacity + 1px lift.
  // Hover styles only apply on devices that can hover (Tailwind v4 default),
  // and `active` gives touch users immediate press feedback.
  primary:
    "bg-ink text-canvas hover:-translate-y-px hover:opacity-88 active:translate-y-0 active:opacity-80 motion-reduce:hover:translate-y-0",
  secondary:
    "border border-border-strong bg-surface-alt text-ink hover:bg-border active:border-muted-soft/40 active:bg-border",
  ghost: "text-ink hover:bg-surface-alt active:bg-border",
  destructive: "text-error-strong hover:bg-error/8 active:bg-error/14",
  // Filled destructive: only inside confirmation dialogs (§8).
  "destructive-solid": "bg-error-strong text-canvas hover:opacity-88 active:opacity-80",
};

// Heights follow §8 (44–48px). `sm` is for dense desktop toolbars and grows
// back to 44px on touch devices so touch targets stay at least 44px.
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-1.5 pointer-coarse:min-h-11",
  md: "min-h-11 px-5 py-2",
  lg: "min-h-12 px-6 py-2.5",
};

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

/**
 * Button classes without the element. Use it to style a Next.js <Link> as a button:
 * `<Link href="/x" className={buttonStyles({ variant: "secondary" })}>`.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: ButtonStyleOptions = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

export type ButtonProps = ComponentProps<"button"> &
  Omit<ButtonStyleOptions, "className"> & {
    /** Shows loading dots, keeps the button's width and blocks repeat clicks. */
    loading?: boolean;
    /**
     * Brief confirmation after an action ("Copied", "Saved"). Replaces the label
     * and leading icon; pair it with a toast or live region for screen readers.
     */
    successLabel?: ReactNode;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
  };

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  successLabel,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const success = Boolean(successLabel) && !loading;

  return (
    <button
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    >
      <span
        className={cn(
          "inline-flex min-w-0 items-center justify-center gap-2 [&>svg]:shrink-0",
          loading && "opacity-0",
        )}
      >
        {success ? <Check size={iconSize.md} strokeWidth={iconStroke} /> : leadingIcon}
        <span className="min-w-0">{success ? successLabel : children}</span>
        {success ? null : trailingIcon}
      </span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingDots label={null} />
        </span>
      ) : null}
    </button>
  );
}
