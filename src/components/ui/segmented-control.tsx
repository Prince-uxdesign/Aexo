"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** Optional icon or symbol before the label. */
  icon?: ReactNode;
};

export type SegmentedControlProps<T extends string> = {
  /** Accessible group name. Visually hidden unless `showLabel` is set. */
  label: string;
  showLabel?: boolean;
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  /** Stretch segments to fill the width (default). */
  fullWidth?: boolean;
  size?: "sm" | "md";
  className?: string;
};

/**
 * A small set of mutually exclusive options shown side by side ("Percentage |
 * Fixed amount"). Built on native radios, so arrow keys move the selection and
 * screen readers announce a radio group. Each segment is at least 44px tall on
 * touch screens. For more than four options or long labels, use RadioGroup.
 */
export function SegmentedControl<T extends string>({
  label,
  showLabel = false,
  value,
  onValueChange,
  options,
  fullWidth = true,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  const name = `segmented-${useId()}`;

  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-2", className)}>
      <legend className={cn(showLabel ? "mb-2 text-label text-ink" : "sr-only")}>{label}</legend>
      <div
        className={cn(
          "flex gap-1 rounded-pill border border-border-strong bg-surface-alt p-1",
          fullWidth ? "w-full" : "w-fit max-w-full",
        )}
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex min-w-0 items-center justify-center gap-1.5 rounded-pill px-3.5 text-center text-label",
                "transition-[background-color,color,box-shadow] duration-150 ease-standard",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                size === "md"
                  ? "min-h-10 pointer-coarse:min-h-11"
                  : "min-h-8 pointer-coarse:min-h-11",
                fullWidth && "flex-1",
                checked
                  ? "bg-surface text-ink shadow-control"
                  : "font-normal text-muted hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onValueChange(option.value)}
                className="sr-only"
              />
              {option.icon ? (
                <span aria-hidden className="flex shrink-0">
                  {option.icon}
                </span>
              ) : null}
              <span className="truncate">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
