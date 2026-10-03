"use client";

import { useActionState, useRef, useState } from "react";
import { MailCheck } from "lucide-react";
import { Button, Field, FormMessage, iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { resendConfirmation, signUp } from "@/lib/auth/actions";
import { withNext } from "@/lib/auth/redirects";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { cn } from "@/lib/utils/cn";
import {
  AuthAlert,
  AuthPasswordInput,
  AuthProgress,
  EmailInput,
  NameInput,
  PasswordStrength,
  useSubmitCount,
} from "../_components/auth-fields";
import {
  AuthBadge,
  AuthFooterLink,
  AuthHeading,
  AuthTabs,
  enter,
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
  const submits = useSubmitCount();
  // Mirrors the password field for the strength meter. React resets the form
  // after each submit, so the reset handler clears it too.
  const [password, setPassword] = useState("");
  const formMotion = enter(2);

  if (state.status === "success" && state.values?.email) {
    return <CheckEmail email={state.values.email} next={next} onRestart={onRestart} />;
  }

  return (
    <>
      <AuthProgress active={pending} />
      <AuthTabs current="sign-up" next={next} />
      <AuthHeading
        title="Create your account"
        description={
          fromSave
            ? "Your invoice is safe on this device. Create a free account to save it and manage all your invoices."
            : "Free, and only needed to save and manage invoices."
        }
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
        <input type="hidden" name="next" value={next} />

        <Field
          label="Name"
          hint="Optional. How we greet you in Aexo."
          error={state.fieldErrors?.fullName}
        >
          <NameInput name="fullName" defaultValue={state.values?.fullName} />
        </Field>

        <Field label="Email" required error={state.fieldErrors?.email}>
          <EmailInput name="email" defaultValue={state.values?.email} />
        </Field>

        <Field
          label="Password"
          required
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

        <div className="mt-1 flex flex-col gap-3">
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={pending}
            className="auth-submit shadow-float"
          >
            Create account
          </Button>
          <p className="text-center text-caption text-muted">
            Free account · No credit card required
          </p>
        </div>
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
      <AuthProgress active={pending} />
      <AuthBadge>
        <MailCheck size={iconSize.lg} strokeWidth={iconStroke} />
      </AuthBadge>
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
        <FormMessage
          tone={state.status === "error" ? "error" : "success"}
          className={cn("mb-5", state.status === "error" ? "animate-shake" : "animate-rise-in")}
        >
          {state.message}
        </FormMessage>
      ) : null}

      <form
        action={action}
        className={cn("flex flex-col gap-3", enter(2).className)}
        style={enter(2).style}
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          fullWidth
          loading={pending}
          className="auth-submit"
        >
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
