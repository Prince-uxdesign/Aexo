"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { Button, Field } from "@/components/ui";
import { routes } from "@/config/routes";
import { signIn } from "@/lib/auth/actions";
import { withNext } from "@/lib/auth/redirects";
import { cn } from "@/lib/utils/cn";
import {
  AuthAlert,
  AuthPasswordInput,
  AuthProgress,
  EmailInput,
  useSubmitCount,
} from "../_components/auth-fields";
import {
  AuthFooterLink,
  AuthHeading,
  AuthTabs,
  enter,
  initialFormState,
  useFocusFirstError,
} from "../_components/auth-ui";

export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);
  const submits = useSubmitCount();
  const formMotion = enter(2);

  return (
    <>
      <AuthProgress active={pending} />
      <AuthTabs current="sign-in" next={next} />
      <AuthHeading title="Welcome back" description="Sign in to see and manage your invoices." />

      <form
        ref={formRef}
        action={action}
        onSubmit={submits.onSubmit}
        noValidate
        data-auth-form
        aria-busy={pending || undefined}
        className={cn("flex flex-col gap-5", formMotion.className)}
        style={formMotion.style}
      >
        {state.message ? (
          <AuthAlert attempt={submits.count}>{state.message}</AuthAlert>
        ) : notice ? (
          <AuthAlert attempt={0} tone="info">
            {notice}
          </AuthAlert>
        ) : null}

        <input type="hidden" name="next" value={next} />

        <Field label="Email" error={state.fieldErrors?.email}>
          <EmailInput name="email" defaultValue={state.values?.email} />
        </Field>

        <div className="flex flex-col gap-1">
          <Field label="Password" error={state.fieldErrors?.password}>
            <AuthPasswordInput name="password" autoComplete="current-password" />
          </Field>
          <Link
            href={routes.forgotPassword}
            className="inline-flex min-h-11 items-center self-end text-label text-ink underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={pending}
          className="auth-submit shadow-float"
        >
          Sign in
        </Button>
      </form>

      <AuthFooterLink prompt="New to Aexo?" href={withNext(routes.signUp, next)}>
        Create an account
      </AuthFooterLink>
    </>
  );
}
