"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { iconSize, iconStroke } from "./icon";

type FieldContextValue = {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Lets a control read the id and ARIA attributes from its surrounding <Field>.
 * Outside a Field it returns nothing, so controls still work on their own.
 */
export function useFieldControl() {
  return useContext(FieldContext);
}

type FieldProps = {
  label: ReactNode;
  /** Short guidance shown under the control. */
  hint?: ReactNode;
  /** Human-readable message, e.g. "Enter a valid email address." Marks the control invalid. */
  error?: ReactNode;
  required?: boolean;
  /** Set when you need a predictable id (e.g. to link from elsewhere). */
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps one form control with its label, hint and error.
 * The control inside (Input, Textarea, Select) picks up id, aria-describedby,
 * aria-invalid and required automatically.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  id,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ controlId, describedBy, invalid: Boolean(error), required }}>
      <div className={cn("flex flex-col gap-2", className)}>
        <FieldLabel htmlFor={controlId} required={required}>
          {label}
        </FieldLabel>
        {children}
        {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </div>
    </FieldContext.Provider>
  );
}

type FieldLabelProps = {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FieldLabel({ htmlFor, required, children, className }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn("text-label text-ink", className)}>
      {children}
      {required ? (
        // Restrained required marker (§9). The control's `required` attribute is what
        // screen readers announce, so the marker itself is hidden from them.
        <span aria-hidden className="ml-0.5 text-accent">
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-caption text-muted">
      {children}
    </p>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-caption text-error-strong">
      <CircleAlert size={iconSize.sm} strokeWidth={iconStroke} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/**
 * Shared look for text-like controls (§9): 48px tall, 12px radius, ink border on
 * focus with a soft ring. 16px text also stops iOS from zooming on focus.
 */
export const controlStyles = cn(
  "w-full rounded-md border border-border-strong bg-surface px-3.5 py-3 text-body text-foreground",
  "placeholder:text-muted",
  "transition-[border-color,box-shadow] duration-150 ease-standard",
  "focus-visible:border-ink focus-visible:shadow-focus focus-visible:outline-none",
  "aria-invalid:border-error aria-invalid:focus-visible:shadow-focus-error",
  "disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-alt disabled:text-muted",
);

/**
 * Lays out Fields: one column on phones, two from 640px. Give a Field
 * `className="sm:col-span-2"` to span the full width.
 */
export function FieldGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("grid gap-x-6 gap-y-6 sm:grid-cols-2", className)}>{children}</div>;
}
