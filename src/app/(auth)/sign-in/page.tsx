import type { Metadata } from "next";
import { safeNextPath } from "@/lib/auth/redirects";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

const notices: Record<string, string> = {
  "link-expired": "That link has expired or was already used. Sign in, or request a new link.",
  "signed-out": "You've been signed out.",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const notice = typeof params.notice === "string" ? notices[params.notice] : undefined;

  return <SignInForm next={next} notice={notice} />;
}
