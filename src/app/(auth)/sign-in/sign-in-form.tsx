"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { Button, Field, FormMessage, Input, PasswordInput } from "@/components/ui";
import { routes } from "@/config/routes";
import { signIn } from "@/lib/auth/actions";
import { withNext } from "@/lib/auth/redirects";
import {
  AuthFooterLink,
  AuthHeading,
  initialFormState,
  useFocusFirstError,
} from "../_components/auth-ui";

export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <>
      <AuthHeading title="Welcome back" description="Sign in to see and manage your invoices." />

      <form ref={formRef} action={action} noValidate className="flex flex-col gap-5">
        {state.message ? (
          <FormMessage>{state.message}</FormMessage>
        ) : notice ? (
          <FormMessage tone="info">{notice}</FormMessage>
        ) : null}

        <input type="hidden" name="next" value={next} />

        <Field label="Email" error={state.fieldErrors?.email}>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={state.values?.email}
          />
        </Field>

        <div className="flex flex-col gap-1">
          <Field label="Password" error={state.fieldErrors?.password}>
            <PasswordInput name="password" autoComplete="current-password" />
          </Field>
          <Link
            href={routes.forgotPassword}
            className="inline-flex min-h-11 items-center self-end text-label text-ink underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={pending}>
          Sign in
        </Button>
      </form>

      <AuthFooterLink prompt="New to Aexo?" href={withNext(routes.signUp, next)}>
        Create an account
      </AuthFooterLink>
    </>
  );
}
