"use client";

import { useActionState, useRef, useState } from "react";
import { MailCheck } from "lucide-react";
import {
  Button,
  Field,
  FormMessage,
  Input,
  PasswordInput,
  iconSize,
  iconStroke,
} from "@/components/ui";
import { routes } from "@/config/routes";
import { resendConfirmation, signUp } from "@/lib/auth/actions";
import { withNext } from "@/lib/auth/redirects";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import {
  AuthFooterLink,
  AuthHeading,
  initialFormState,
  useFocusFirstError,
} from "../_components/auth-ui";

export function SignUpForm({ next, fromSave }: { next: string; fromSave: boolean }) {
  // Changing the key remounts the form, which is how "Use a different email" resets it.
  const [attempt, setAttempt] = useState(0);
  return (
    <SignUpFlow
      key={attempt}
      next={next}
      fromSave={fromSave}
      onRestart={() => setAttempt((n) => n + 1)}
    />
  );
}

function SignUpFlow({
  next,
  fromSave,
  onRestart,
}: {
  next: string;
  fromSave: boolean;
  onRestart: () => void;
}) {
  const [state, action, pending] = useActionState(signUp, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  if (state.status === "success" && state.values?.email) {
    return <CheckEmail email={state.values.email} next={next} onRestart={onRestart} />;
  }

  return (
    <>
      <AuthHeading
        title="Create your account"
        description={
          fromSave
            ? "Your invoice is safe on this device. Create a free account to save it and manage all your invoices."
            : "Free, and only needed to save and manage invoices."
        }
      />

      <form ref={formRef} action={action} noValidate className="flex flex-col gap-5">
        {state.message ? <FormMessage>{state.message}</FormMessage> : null}
        <input type="hidden" name="next" value={next} />

        <Field
          label="Name"
          hint="Optional. How we greet you in Aexo."
          error={state.fieldErrors?.fullName}
        >
          <Input name="fullName" autoComplete="name" defaultValue={state.values?.fullName} />
        </Field>

        <Field label="Email" required error={state.fieldErrors?.email}>
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

        <Field
          label="Password"
          required
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={state.fieldErrors?.password}
        >
          <PasswordInput name="password" autoComplete="new-password" />
        </Field>

        <Button type="submit" size="lg" fullWidth loading={pending} className="mt-1">
          Create account
        </Button>
      </form>

      <AuthFooterLink prompt="Already have an account?" href={withNext(routes.signIn, next)}>
        Sign in
      </AuthFooterLink>
    </>
  );
}

function CheckEmail({
  email,
  next,
  onRestart,
}: {
  email: string;
  next: string;
  onRestart: () => void;
}) {
  const [state, action, pending] = useActionState(resendConfirmation, initialFormState);

  return (
    <div className="flex flex-col">
      <span className="mb-6 flex size-12 items-center justify-center rounded-pill bg-surface-alt text-ink">
        <MailCheck size={iconSize.lg} strokeWidth={iconStroke} />
      </span>
      <AuthHeading
        title="Check your email"
        description={
          <>
            We sent a confirmation link to <span className="break-all text-ink">{email}</span>. Open
            it on this device to finish creating your account.
          </>
        }
      />

      {state.message ? (
        <FormMessage tone={state.status === "error" ? "error" : "success"} className="mb-5">
          {state.message}
        </FormMessage>
      ) : null}

      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" size="lg" fullWidth loading={pending}>
          Send the link again
        </Button>
        <Button type="button" variant="ghost" size="lg" fullWidth onClick={onRestart}>
          Use a different email
        </Button>
      </form>

      <p className="mt-6 text-caption text-muted">
        Can&apos;t find it? Check your spam or promotions folder.
      </p>
    </div>
  );
}
