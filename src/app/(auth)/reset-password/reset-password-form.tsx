"use client";

import { useActionState, useRef } from "react";
import { Button, Field, FormMessage, PasswordInput } from "@/components/ui";
import { updatePassword } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { AuthHeading, initialFormState, useFocusFirstError } from "../_components/auth-ui";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <>
      <AuthHeading
        title="Choose a new password"
        description="You'll use it the next time you sign in."
      />

      <form ref={formRef} action={action} noValidate className="flex flex-col gap-5">
        {state.message ? <FormMessage>{state.message}</FormMessage> : null}

        <Field
          label="New password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={state.fieldErrors?.password}
        >
          <PasswordInput name="password" autoComplete="new-password" />
        </Field>

        <Field label="Confirm new password" error={state.fieldErrors?.confirmPassword}>
          <PasswordInput name="confirmPassword" autoComplete="new-password" />
        </Field>

        <Button type="submit" size="lg" fullWidth loading={pending} className="mt-1">
          Update password
        </Button>
      </form>
    </>
  );
}
