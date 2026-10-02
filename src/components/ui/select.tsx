"use client";

import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { controlStyles } from "./field";
import { iconSize, iconStroke } from "./icon";
import { useControlProps } from "./input";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options?: SelectOption[];
  /** Shown as an empty first option. Pair it with `required` to force a choice. */
  placeholder?: string;
};

/**
 * Styled native <select>. Native keeps keyboard, screen reader and mobile pickers
 * working for free. Pass `options`, or <option> children for grouped lists.
 */
export function Select({ className, options, placeholder, children, ...props }: SelectProps) {
  const controlProps = useControlProps(props);
  const isUncontrolled = props.value === undefined && props.defaultValue === undefined;

  return (
    <div className="relative">
      <select
        className={cn(controlStyles, "h-12 cursor-pointer appearance-none pr-11", className)}
        defaultValue={placeholder && isUncontrolled ? "" : undefined}
        {...controlProps}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown
        size={iconSize.md}
        strokeWidth={iconStroke}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-soft"
      />
    </div>
  );
}
