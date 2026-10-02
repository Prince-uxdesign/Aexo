"use client";

import { useEffect, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import type { FormState } from "@/lib/auth/actions";

/** Page title + one line of context. The only h1 on auth pages. */
export function AuthHeading({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="text-h1 text-ink">{title}</h1>
      {description ? <p className="text-body-lg text-muted">{description}</p> : null}
    </div>
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
  return (
    <p className="mt-8 border-t border-border pt-6 text-center text-body text-muted">
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
