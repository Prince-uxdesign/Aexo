import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui";
import { routes } from "@/config/routes";
import { getUserId } from "@/lib/auth/session";
import { AuthHeading } from "../_components/auth-ui";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

/**
 * Reached from the reset email (via /auth/confirm, which signs the person in)
 * or from the account page. Either way a session is required to change the
 * password; without one, explain and offer a new link.
 */
export default async function ResetPasswordPage() {
  const userId = await getUserId();

  if (!userId) {
    return (
      <>
        <AuthHeading
          title="This link has expired"
          description="Password reset links work once and expire after a while. Request a new one to choose your password."
        />
        <Link
          href={routes.forgotPassword}
          className={buttonStyles({ size: "lg", fullWidth: true })}
        >
          Request a new link
        </Link>
      </>
    );
  }

  return <ResetPasswordForm />;
}
