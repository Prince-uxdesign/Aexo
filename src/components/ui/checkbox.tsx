"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FieldError } from "./field";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  /** e.g. "Accept the terms to continue." Marks the checkbox invalid. */
  error?: ReactNode;
};

/**
 * Native checkbox with Aexo styling. The whole row (box, label, description) is
 * the click target and is at least 44px tall for touch.
 */
export function Checkbox({ label, description, error, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? `checkbox-${generatedId}`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative flex min-h-11 items-start gap-3 py-2.5">
        <span className="relative mt-px flex size-5 shrink-0">
          <input
            id={inputId}
            type="checkbox"
            aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              "peer size-5 cursor-pointer appearance-none rounded-xs border border-muted-soft bg-surface",
              "transition-colors duration-150 ease-standard",
              "checked:border-ink checked:bg-ink hover:border-ink",
              "aria-invalid:border-error",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
            {...props}
          />
          <Check
            size={14}
            strokeWidth={2.5}
            className="pointer-events-none absolute inset-0 m-auto text-canvas opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
          />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          {/* The ::after overlay stretches the label over the whole row. */}
          <label
            htmlFor={inputId}
            className={cn(
              "text-body leading-5 break-words text-foreground after:absolute after:inset-0 after:content-['']",
              props.disabled && "cursor-not-allowed opacity-40",
            )}
          >
            {label}
          </label>
          {description ? (
            <span id={descriptionId} className="text-caption text-muted">
              {description}
            </span>
          ) : null}
        </span>
      </div>
      {error ? (
        <div className="pl-8">
          <FieldError id={errorId}>{error}</FieldError>
        </div>
      ) : null}
    </div>
  );
}
