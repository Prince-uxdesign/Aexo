"use client";

import { useActionState } from "react";
import { Button, Field, FormMessage, Input } from "@/components/ui";
import { updateProfile, type FormState } from "@/lib/auth/actions";

const initial: FormState = { status: "idle" };

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, initial);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state.status === "error" && state.message ? (
        <FormMessage>{state.message}</FormMessage>
      ) : null}

      <Field label="Name" error={state.fieldErrors?.fullName}>
        <Input
          name="fullName"
          autoComplete="name"
          defaultValue={state.values?.fullName ?? fullName}
        />
      </Field>

      <Field label="Email" hint="Your sign-in email. Changing it will come later.">
        <Input type="email" value={email} readOnly disabled />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          loading={pending}
          successLabel={state.status === "success" && !pending ? "Saved" : undefined}
          className="w-full sm:w-auto"
        >
          Save profile
        </Button>
        {/* Announced for screen readers; the button shows "Saved" visually. */}
        <span role="status" className="sr-only">
          {state.status === "success" ? state.message : ""}
        </span>
      </div>
    </form>
  );
}
