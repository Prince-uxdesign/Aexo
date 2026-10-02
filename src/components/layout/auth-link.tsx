"use client";

import Link from "next/link";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "@/components/ui";
import { routes } from "@/config/routes";
import { useAuth } from "@/lib/auth/use-auth";

type AuthLinkProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
};

/**
 * "Sign in" for visitors, "Your account" once signed in. Decided in the browser
 * so the landing page can stay static; it renders "Sign in" until it knows.
 */
export function AuthLink({
  variant = "ghost",
  size = "sm",
  fullWidth,
  className,
  onClick,
}: AuthLinkProps) {
  const { isSignedIn } = useAuth();
  return (
    <Link
      href={isSignedIn ? routes.account : routes.signIn}
      onClick={onClick}
      className={buttonStyles({ variant, size, fullWidth, className })}
    >
      {isSignedIn ? "Your account" : "Sign in"}
    </Link>
  );
}
