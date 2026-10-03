"use client";

import { useEffect, type CSSProperties, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import type { FormState } from "@/lib/auth/actions";
import { withNext } from "@/lib/auth/redirects";
import { cn } from "@/lib/utils/cn";

/*
 * Auth pages enter in a short stagger, in the landing hero's style: the mode
 * switch, then the heading, then the form (`enter(n)`), then the footer link.
 * Reduced-motion users get the final state immediately (globals.css).
 */
const STEP_MS = 90;

/** Entrance class + delay for the nth block of an auth page. */
export function enter(step: number): { className: string; style: CSSProperties } {
  return { className: "animate-rise-in", style: { animationDelay: `${step * STEP_MS}ms` } };
}

/** Page title + one line of context. The only h1 on auth pages. */
export function AuthHeading({ title, description }: { title: ReactNode; description?: ReactNode }) {
  const motion = enter(1);
  return (
    <div className={cn("mb-8 flex flex-col gap-3", motion.className)} style={motion.style}>
      <h1 className="text-h1 text-ink">{title}</h1>
      {description ? <p className="text-body-lg text-muted">{description}</p> : null}
    </div>
  );
}

/**
 * "Sign in | Create account" switch above the heading, styled like the
 * landing page's segmented tabs. Plain links (each is its own page), with the
 * current one marked for assistive tech. Keeps any `next` destination.
 */
export function AuthTabs({ current, next }: { current: "sign-in" | "sign-up"; next: string }) {
  const tabs = [
    { id: "sign-in", label: "Sign in", href: withNext(routes.signIn, next) },
    { id: "sign-up", label: "Create account", href: withNext(routes.signUp, next) },
  ] as const;
  const motion = enter(0);

  return (
    <nav aria-label="Account" className={cn("mb-10", motion.className)} style={motion.style}>
      <ul className="grid grid-cols-2 gap-1 rounded-pill bg-mist p-1">
        {tabs.map((tab) => {
          const active = tab.id === current;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center justify-center rounded-pill px-4 text-label transition-[background-color,color,box-shadow] duration-150 ease-standard pointer-coarse:min-h-11",
                  active
                    ? "bg-white text-ink shadow-soft"
                    : "font-normal text-muted hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Round sky badge for confirmation screens ("Check your email"). It pops in,
 * then two soft rings keep pulsing out from it, like a message going out.
 */
export function AuthBadge({ children }: { children: ReactNode }) {
  const motion = enter(0);
  return (
    <span className={cn("relative mb-8 flex size-14", motion.className)} style={motion.style}>
      <span aria-hidden className="absolute inset-0 animate-ring rounded-pill bg-sky-200" />
      <span
        aria-hidden
        className="absolute inset-0 animate-ring rounded-pill bg-sky-200"
        style={{ animationDelay: "1.2s" }}
      />
      <span className="relative flex size-14 items-center justify-center rounded-pill bg-linear-to-b from-sky-600 to-sky-500 text-white shadow-float">
        {children}
      </span>
    </span>
  );
}

/** Secondary link under a form ("New to Aexo? Create an account"). 44px tall for touch. */
export function AuthFooterLink({
  prompt,
  href,
  children,
}: {
  prompt: string;
  href: string;
  children: ReactNode;
}) {
  const motion = enter(3);
  return (
    <p
      className={cn("mt-8 text-center text-body text-muted", motion.className)}
      style={motion.style}
    >
      {prompt}{" "}
      <Link
        href={href}
        className="inline-flex min-h-11 items-center font-medium text-ink underline-offset-4 hover:underline"
      >
        {children}
      </Link>
    </p>
  );
}

/**
 * After a failed submit, move focus to the first field with an error so
 * keyboard and screen reader users land on it (and phones scroll to it).
 */
export function useFocusFirstError(formRef: RefObject<HTMLFormElement | null>, state: FormState) {
  useEffect(() => {
    const names = Object.entries(state.fieldErrors ?? {})
      .filter(([, message]) => Boolean(message))
      .map(([name]) => name);
    if (!names.length) return;
    const first = formRef.current?.querySelector<HTMLElement>(
      names.map((name) => `[name="${name}"]`).join(","),
    );
    first?.focus();
  }, [formRef, state]);
}

export const initialFormState: FormState = { status: "idle" };
