import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  FormMessage,
  buttonStyles,
} from "@/components/ui";
import { routes } from "@/config/routes";
import { getAccountUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format/date";
import { ProfileForm } from "./profile-form";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Your account" };

const notices: Record<string, string> = {
  password: "Your password has been updated.",
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await getAccountUser();
  if (!user) redirect(routes.signIn);

  const params = await searchParams;
  const notice = typeof params.updated === "string" ? notices[params.updated] : undefined;
  const welcome = params.welcome === "1";
  const memberSince = formatDate(user.createdAt.slice(0, 10), "en-US");

  return (
    <main id="main" className="flex-1 py-10 md:py-14">
      <Container width="reading" className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-h1 text-ink">
            {user.fullName ? `Hi, ${user.fullName.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="text-body-lg text-muted">Member since {memberSince}</p>
        </header>

        {welcome ? (
          <FormMessage tone="success" title="Your email is confirmed">
            Welcome to Aexo. Invoices you save will appear in your account.
          </FormMessage>
        ) : null}
        {notice ? <FormMessage tone="success">{notice}</FormMessage> : null}

        <Card as="section" aria-labelledby="profile-title">
          <CardHeader>
            <CardTitle as="h2" id="profile-title">
              Profile
            </CardTitle>
            <CardDescription>How Aexo greets you.</CardDescription>
          </CardHeader>
          <ProfileForm fullName={user.fullName ?? ""} email={user.email} />
        </Card>

        <Card as="section" aria-labelledby="security-title">
          <CardHeader>
            <CardTitle as="h2" id="security-title">
              Password
            </CardTitle>
            <CardDescription>Choose a new password at any time.</CardDescription>
          </CardHeader>
          <Link
            href={routes.resetPassword}
            className={buttonStyles({ variant: "secondary", className: "w-full sm:w-auto" })}
          >
            Change password
          </Link>
        </Card>

        <div className="flex flex-col items-stretch gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body text-muted">Signed in as {user.email}</p>
          <SignOutButton />
        </div>
      </Container>
    </main>
  );
}
