"use client";

import { useState, type ReactNode } from "react";
import { CircleCheck, LockKeyhole, Mail, UserRound } from "lucide-react";
import {
  FormMessage,
  Input,
  PasswordInput,
  iconSize,
  iconStroke,
  type InputProps,
  type PasswordInputProps,
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";

/*
 * Inputs and feedback for the auth forms. The motion itself lives in
 * globals.css ("Auth form interactions"); these components only add the hooks
 * it needs: the `auth-input` class, a leading icon, a placeholder (so
 * `:placeholder-shown` can tell an empty field from a filled one) and, for
 * email, the valid-check icon.
 */

const icon = (Icon: typeof Mail) => <Icon size={iconSize.md} strokeWidth={iconStroke} />;

export function EmailInput({ className, ...props }: Omit<InputProps, "type">) {
  return (
    <Input
      type="email"
      inputMode="email"
      autoComplete="email"
      autoCapitalize="none"
      spellCheck={false}
      placeholder="you@company.com"
      leading={icon(Mail)}
      trailing={
        <span data-valid-check className="pr-3.5">
          <CircleCheck size={iconSize.md} strokeWidth={iconStroke} />
        </span>
      }
      className={cn("auth-input", className)}
      {...props}
    />
  );
}

export function NameInput({ className, ...props }: InputProps) {
  return (
    <Input
      autoComplete="name"
      placeholder="Ada Mensah"
      leading={icon(UserRound)}
      className={cn("auth-input", className)}
      {...props}
    />
  );
}

export function AuthPasswordInput({ className, ...props }: PasswordInputProps) {
  return (
    <PasswordInput
      placeholder="••••••••"
      leading={icon(LockKeyhole)}
      className={cn("auth-input", className)}
      {...props}
    />
  );
}

/**
 * Counts submits so a repeated error replays its shake: the alert is keyed by
 * the count. Spread `onSubmit` on the form alongside `action`.
 */
export function useSubmitCount() {
  const [count, setCount] = useState(0);
  return { count, onSubmit: () => setCount((n) => n + 1) };
}

/** A form-level message that shakes in when it (re)appears after a submit. */
export function AuthAlert({
  attempt,
  tone,
  children,
}: {
  attempt: number;
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  return (
    <div key={attempt} className={tone === "error" || !tone ? "animate-shake" : "animate-rise-in"}>
      <FormMessage tone={tone}>{children}</FormMessage>
    </div>
  );
}

/**
 * A thin indeterminate sky bar across the top of the screen while a request is
 * in flight. Decorative: the busy button already announces the wait.
 */
export function AuthProgress({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "h-full w-1/3 rounded-pill bg-linear-to-r from-sky-300 via-sky-500 to-sky-300",
          active && "animate-progress",
        )}
      />
    </div>
  );
}

function strength(value: string, min: number) {
  if (!value) return 0;
  if (value.length < min) return 1;
  const extras = [
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value) || value.length >= 14,
  ].filter(Boolean).length;
  return Math.min(4, 2 + Math.max(0, extras - 1));
}

const levels = [
  { label: "", bar: "" },
  { label: "Too short", bar: "bg-error" },
  { label: "Okay", bar: "bg-warning" },
  { label: "Good", bar: "bg-sky-500" },
  { label: "Strong", bar: "bg-success" },
];

/**
 * Four bars that fill and change colour as the password gets stronger, with
 * the level named in text (never colour alone). Collapses when empty.
 */
export function PasswordStrength({ value, min }: { value: string; min: number }) {
  const score = strength(value, min);
  const level = levels[score];

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out-expo",
        score ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div className="flex items-center gap-3 pt-1">
          <div aria-hidden className="grid flex-1 grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <span key={step} className="h-1.5 overflow-hidden rounded-pill bg-mist-strong">
                <span
                  className={cn(
                    "block h-full origin-left rounded-pill transition-[scale,background-color] duration-500 ease-out-expo",
                    level.bar,
                    step <= score ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
            ))}
          </div>
          <p aria-live="polite" className="w-20 shrink-0 text-right text-caption text-muted">
            {level.label ? (
              <>
                <span className="sr-only">Password strength: </span>
                <span className="text-ink">{level.label}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
