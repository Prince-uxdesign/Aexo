"use client";

import type { ComponentProps } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { controlStyles } from "./field";
import { iconSize, iconStroke } from "./icon";
import { useControlProps } from "./input";

export type DateInputProps = Omit<ComponentProps<"input">, "type">;

/**
 * Date field on the native date input. Phones get their own date wheel or
 * calendar, desktop gets the browser picker, and keyboard entry still works.
 * The value is always an ISO date string ("2026-10-02"), whatever the display locale.
 */
export function DateInput({ className, ...props }: DateInputProps) {
  const controlProps = useControlProps(props);

  return (
    <div className="relative">
      <input
        type="date"
        className={cn(
          controlStyles,
          // iOS collapses empty date inputs, so height and alignment are set explicitly.
          "relative h-12 min-h-12 appearance-none pr-11 text-left",
          className,
        )}
        {...controlProps}
      />
      {/* Shown where the native icon is hidden (Chromium, WebKit). Firefox keeps its own. */}
      <Calendar
        size={iconSize.md}
        strokeWidth={iconStroke}
        className="pointer-events-none absolute top-1/2 right-3.5 hidden -translate-y-1/2 text-muted-soft supports-[selector(::-webkit-calendar-picker-indicator)]:block"
      />
    </div>
  );
}
