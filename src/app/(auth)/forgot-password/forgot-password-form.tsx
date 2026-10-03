"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button, Field, buttonStyles, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { requestPasswordReset } from "@/lib/auth/actions";
import { AuthAlert, AuthProgress, EmailInput, useSubmitCount } from "../_components/auth-fields";
import { cn } from "@/lib/utils/cn";
import {
  AuthBadge,
  AuthFooterLink,
  AuthHeading,
  enter,
  initialFormState,
  useFocusFirstError,
} from "../_components/auth-ui";

export function ForgotPasswordForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordReset, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);
  const submits = useSubmitCount();
  const formMotion = enter(2);

  if (state.status === "success" && state.values?.email) {
    return (
      <div className="flex flex-col">
        <AuthBadge>
          <MailCheck size={iconSize.lg} strokeWidth={iconStroke} />
        </AuthBadge>
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
      <AuthProgress active={pending} />
      <AuthHeading
        title="Reset your password"
        description="Enter the email you use for Aexo and we'll send you a link to choose a new password."
      />

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
        ) : expired ? (
          <AuthAlert attempt={0} tone="info">
            That reset link has expired or was already used. Request a new one.
          </AuthAlert>
        ) : null}

        <Field label="Email" error={state.fieldErrors?.email}>
          <EmailInput name="email" defaultValue={state.values?.email} />
        </Field>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={pending}
          className="auth-submit shadow-float"
        >
          Send reset link
        </Button>
      </form>

      <AuthFooterLink prompt="Remembered it?" href={routes.signIn}>
        Back to sign in
      </AuthFooterLink>
    </>
  );
}
