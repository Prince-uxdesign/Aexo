"use client";

import { createContext, useContext, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { FieldError, FieldHint } from "./field";

type RadioGroupContextValue = {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  describedBy?: string;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

type RadioGroupProps = {
  /** Visible group label, rendered as the fieldset legend. */
  label: ReactNode;
  name?: string;
  /** Controlled value. Leave unset and use `defaultValue` for uncontrolled. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
};

/** A labelled set of radios. Uses fieldset + legend so the group is announced. */
export function RadioGroup({
  label,
  name,
  value,
  defaultValue,
  onValueChange,
  hint,
  error,
  orientation = "vertical",
  className,
  children,
}: RadioGroupProps) {
  const generatedId = useId();
  const groupName = name ?? `radio-${generatedId}`;
  const hintId = hint ? `${groupName}-hint` : undefined;
  const errorId = error ? `${groupName}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <RadioGroupContext.Provider
      value={{ name: groupName, value, defaultValue, onValueChange, describedBy }}
    >
      <fieldset className={cn("flex flex-col gap-2", className)}>
        <legend className="mb-1 text-label text-ink">{label}</legend>
        <div
          className={cn(
            "flex",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-x-6",
          )}
        >
          {children}
        </div>
        {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "name"> & {
  value: string;
  label: ReactNode;
  description?: ReactNode;
};

export function Radio({ value, label, description, className, id, ...props }: RadioProps) {
  const group = useContext(RadioGroupContext);
  const generatedId = useId();
  if (!group) throw new Error("<Radio> must be used inside <RadioGroup>.");

  const inputId = id ?? `radio-${generatedId}`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const describedBy = [descriptionId, group.describedBy].filter(Boolean).join(" ") || undefined;

  const checkedProps =
    group.value !== undefined
      ? { checked: group.value === value }
      : { defaultChecked: group.defaultValue === value };

  return (
    <div className={cn("relative flex min-h-11 items-start gap-3 py-2.5", className)}>
      <span className="relative mt-px flex size-5 shrink-0">
        <input
          id={inputId}
          type="radio"
          name={group.name}
          value={value}
          aria-describedby={describedBy}
          onChange={(event) => group.onValueChange?.(event.target.value)}
          className={cn(
            "peer size-5 cursor-pointer appearance-none rounded-pill border border-muted-soft bg-surface",
            "transition-colors duration-150 ease-standard checked:border-ink hover:border-ink",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          {...checkedProps}
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 m-auto size-2.5 rounded-pill bg-ink opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
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
  );
}
