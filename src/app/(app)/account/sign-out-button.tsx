"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { Button, iconSize, iconStroke } from "@/components/ui";
import { signOut } from "@/lib/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      loading={pending}
      leadingIcon={<LogOut size={iconSize.md} strokeWidth={iconStroke} />}
      className="w-full sm:w-auto"
    >
      Sign out
    </Button>
  );
}

/** A real form, so signing out works even before JavaScript loads. */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton />
    </form>
  );
}
