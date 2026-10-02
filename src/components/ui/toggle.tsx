"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ToggleProps = {
  label: ReactNode;
  description?: ReactNode;
  /** Controlled state. Leave unset and use `defaultChecked` for uncontrolled. */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** `end` (default) suits settings rows; `start` suits inline options. */
  switchPosition?: "start" | "end";
  name?: string;
  className?: string;
};

/**
 * On/off switch for settings that apply immediately ("Show tax line").
 * For choices confirmed later with a submit button, use Checkbox instead.
 * The whole row is the touch target and is at least 44px tall.
 */
export function Toggle({
  label,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  switchPosition = "end",
  name,
  className,
}: ToggleProps) {
  const id = `toggle-${useId()}`;
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked ?? internal;

  const toggle = () => {
    if (checked === undefined) setInternal(!isOn);
    onCheckedChange?.(!isOn);
  };

  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-4 py-2",
        switchPosition === "end" ? "justify-between" : "flex-row-reverse justify-end",
        disabled && "opacity-40",
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <label
          htmlFor={id}
          className={cn("text-body text-foreground", disabled && "cursor-not-allowed")}
        >
          {label}
        </label>
        {description ? (
          <span id={`${id}-description`} className="text-caption text-muted">
            {description}
          </span>
        ) : null}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          // 44px wide; the vertical touch area comes from the row's 44px height
          // via the before: overlay.
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill",
          "before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-['']",
          "transition-colors duration-200 ease-standard disabled:cursor-not-allowed",
          isOn ? "bg-ink" : "bg-muted-soft",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-5 rounded-pill bg-canvas shadow-control transition-transform duration-200 ease-standard",
            isOn ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
      {name ? <input type="hidden" name={name} value={isOn ? "on" : "off"} /> : null}
    </div>
  );
}
