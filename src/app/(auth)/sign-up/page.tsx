import type { Metadata } from "next";
import { safeNextPath } from "@/lib/auth/redirects";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const params = await searchParams;
  // `from=save` means they arrived from "Save invoice" while signed out.
  const fromSave = params.from === "save";
  return <SignUpForm next={safeNextPath(params.next)} fromSave={fromSave} />;
}
