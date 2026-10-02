"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import {
  Button,
  Field,
  FormMessage,
  Input,
  buttonStyles,
  iconSize,
  iconStroke,
} from "@/components/ui";
import { routes } from "@/config/routes";
import { requestPasswordReset } from "@/lib/auth/actions";
import {
  AuthFooterLink,
  AuthHeading,
  initialFormState,
  useFocusFirstError,
} from "../_components/auth-ui";

export function ForgotPasswordForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordReset, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  if (state.status === "success" && state.values?.email) {
    return (
      <div className="flex flex-col">
        <span className="mb-6 flex size-12 items-center justify-center rounded-pill bg-surface-alt text-ink">
          <MailCheck size={iconSize.lg} strokeWidth={iconStroke} />
        </span>
        {/* Same message whether or not the account exists, so emails can't be probed. */}
        <AuthHeading
          title="Check your email"
          description={
            <>
              If there&apos;s an account for{" "}
              <span className="break-all text-ink">{state.values.email}</span>, you&apos;ll get a
              link to choose a new password. Open it on this device.
            </>
          }
        />
        <Link
          href={routes.signIn}
          className={buttonStyles({ variant: "secondary", size: "lg", fullWidth: true })}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <AuthHeading
        title="Reset your password"
        description="Enter the email you use for Aexo and we'll send you a link to choose a new password."
      />

      <form ref={formRef} action={action} noValidate className="flex flex-col gap-5">
        {state.message ? (
          <FormMessage>{state.message}</FormMessage>
        ) : expired ? (
          <FormMessage tone="info">
            That reset link has expired or was already used. Request a new one.
          </FormMessage>
        ) : null}

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

        <Button type="submit" size="lg" fullWidth loading={pending}>
          Send reset link
        </Button>
      </form>

      <AuthFooterLink prompt="Remembered it?" href={routes.signIn}>
        Back to sign in
      </AuthFooterLink>
    </>
  );
}
