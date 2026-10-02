"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { controlStyles, useFieldControl } from "./field";

/**
 * Merge a control's own props with what its <Field> provides.
 * Explicit props win, so a control can still be used outside a Field.
 */
export function useControlProps<T extends { id?: string; required?: boolean }>(props: T) {
  const field = useFieldControl();
  const ariaProps = props as T & { "aria-describedby"?: string; "aria-invalid"?: boolean };

  return {
    ...props,
    id: props.id ?? field?.controlId,
    required: props.required ?? field?.required,
    // Combine the control's own descriptions with the Field's hint and error.
    "aria-describedby":
      [field?.describedBy, ariaProps["aria-describedby"]].filter(Boolean).join(" ") || undefined,
    "aria-invalid": ariaProps["aria-invalid"] ?? (field?.invalid || undefined),
  };
}

/**
 * Frame for inputs with a prefix or suffix (icon, currency symbol, unit).
 * The frame carries the border and focus ring; the input inside is bare.
 */
const shellStyles = cn(
  "flex h-12 w-full items-center rounded-md border border-border-strong bg-surface text-body text-foreground",
  "transition-[border-color,box-shadow] duration-150 ease-standard",
  "focus-within:border-ink focus-within:shadow-focus",
  "has-[[aria-invalid=true]]:border-error has-[[aria-invalid=true]]:focus-within:shadow-focus-error",
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:border-border has-[:disabled]:bg-surface-alt has-[:disabled]:text-muted",
);

const adornmentStyles =
  "flex shrink-0 items-center gap-1 text-muted select-none [&>svg]:text-muted-soft";

export type InputProps = ComponentProps<"input"> & {
  /** Non-interactive content before the value: an icon, "$", "#". */
  leading?: ReactNode;
  /** Non-interactive content after the value: a unit, "%", an icon. */
  trailing?: ReactNode;
  /** Classes for the inner <input> when `leading` or `trailing` is used. */
  inputClassName?: string;
};

export function Input({
  className,
  inputClassName,
  type = "text",
  leading,
  trailing,
  ...props
}: InputProps) {
  const controlProps = useControlProps(props);

  if (!leading && !trailing) {
    return <input type={type} className={cn(controlStyles, "h-12", className)} {...controlProps} />;
  }

  return (
    <div className={cn(shellStyles, className)}>
      {leading ? (
        <span aria-hidden className={cn(adornmentStyles, "pl-3.5")}>
          {leading}
        </span>
      ) : null}
      <input
        type={type}
        className={cn(
          "h-full w-full min-w-0 flex-1 rounded-md bg-transparent py-3 placeholder:text-muted",
          "focus-visible:outline-none disabled:cursor-not-allowed",
          leading ? "pl-2" : "pl-3.5",
          trailing ? "pr-2" : "pr-3.5",
          inputClassName,
        )}
        {...controlProps}
      />
      {trailing ? (
        <span aria-hidden className={cn(adornmentStyles, "pr-3.5")}>
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

export type TextareaProps = ComponentProps<"textarea">;

export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
  const controlProps = useControlProps(props);
  return (
    <textarea
      rows={rows}
      className={cn(controlStyles, "min-h-28 resize-y", className)}
      {...controlProps}
    />
  );
}
