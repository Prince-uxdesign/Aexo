"use client";

import { useActionState, useRef, useState } from "react";
import { Button, Field } from "@/components/ui";
import { updatePassword } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { cn } from "@/lib/utils/cn";
import {
  AuthAlert,
  AuthPasswordInput,
  AuthProgress,
  PasswordStrength,
  useSubmitCount,
} from "../_components/auth-fields";
import { AuthHeading, enter, initialFormState, useFocusFirstError } from "../_components/auth-ui";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);
  const submits = useSubmitCount();
  const [password, setPassword] = useState("");
  const formMotion = enter(2);

  return (
    <>
      <AuthProgress active={pending} />
      <AuthHeading
        title="Choose a new password"
        description="You'll use it the next time you sign in."
      />

      <form
        ref={formRef}
        action={action}
        onSubmit={submits.onSubmit}
        onReset={() => setPassword("")}
        noValidate
        data-auth-form
        aria-busy={pending || undefined}
        className={cn("flex flex-col gap-5", formMotion.className)}
        style={formMotion.style}
      >
        {state.message ? <AuthAlert attempt={submits.count}>{state.message}</AuthAlert> : null}

        <Field
          label="New password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={state.fieldErrors?.password}
        >
          <AuthPasswordInput
            name="password"
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <PasswordStrength value={password} min={MIN_PASSWORD_LENGTH} />

        <Field label="Confirm new password" error={state.fieldErrors?.confirmPassword}>
          <AuthPasswordInput name="confirmPassword" autoComplete="new-password" />
        </Field>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={pending}
          className="auth-submit mt-1 shadow-float"
        >
          Update password
        </Button>
      </form>
    </>
  );
}
