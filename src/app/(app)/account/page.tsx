import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, KeyRound, LogOut, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import { SkyStars, skySurface } from "@/components/brand/sky";
import { Container } from "@/components/layout/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  FormMessage,
  buttonStyles,
  iconSize,
  iconStroke,
} from "@/components/ui";
import { routes } from "@/config/routes";
import { getAccountUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils/cn";
import { ProfileForm } from "./profile-form";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Your account" };

const notices: Record<string, string> = {
  password: "Your password has been updated.",
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (name ? (parts[1]?.[0] ?? "") : "")).toUpperCase() || "A";
}

/** Small sky icon badge at the top of each account card. */
function SectionIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mb-3 flex size-10 shrink-0 items-center justify-center rounded-pill bg-sky-50 text-sky-600",
        className,
      )}
    >
      <Icon size={iconSize.md} strokeWidth={iconStroke} />
    </span>
  );
}

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await getAccountUser();
  if (!user) redirect(routes.signIn);

  const params = await searchParams;
  const notice = typeof params.updated === "string" ? notices[params.updated] : undefined;
  const welcome = params.welcome === "1";
  const memberSince = formatDate(user.createdAt.slice(0, 10), "en-US");

  const greeting = user.fullName ? `Hi, ${user.fullName.split(" ")[0]}` : "Your account";

  return (
    <main id="main" className="flex-1 py-6 md:py-10">
      <Container width="reading" className="flex flex-col gap-6 md:gap-8">
        {/* Profile banner, in the landing page's sky style. Short, so it holds
            sky-600 longer to keep the white text legible. */}
        <section
          aria-labelledby="account-title"
          className={cn(
            skySurface,
            "rounded-2xl from-70% via-90% px-6 pt-7 pb-6 sm:px-8 sm:pt-9 sm:pb-8",
          )}
        >
          <SkyStars />
          <div className="flex items-center gap-4 sm:gap-5">
            <span
              aria-hidden
              className="flex size-16 shrink-0 animate-rise-in items-center justify-center rounded-pill bg-white text-h2 text-sky-700 shadow-float"
            >
              {initials(user.fullName, user.email)}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h1 id="account-title" className="animate-rise-in text-h1 text-white">
                {greeting}
              </h1>
              <p
                className="animate-rise-in truncate text-body text-white"
                style={{ animationDelay: "100ms" }}
              >
                {user.email}
              </p>
            </div>
          </div>
          <ul
            className="mt-6 flex animate-rise-in flex-wrap gap-2"
            style={{ animationDelay: "200ms" }}
          >
            <li className="inline-flex min-h-9 items-center gap-2 rounded-pill bg-white px-3.5 text-label font-normal text-ink shadow-soft">
              <CalendarDays size={iconSize.sm} strokeWidth={iconStroke} className="text-sky-600" />
              Member since {memberSince}
            </li>
            <li className="inline-flex min-h-9 items-center gap-2 rounded-pill bg-white px-3.5 text-label font-normal text-ink shadow-soft">
              <Sparkles size={iconSize.sm} strokeWidth={iconStroke} className="text-sky-600" />
              Free account
            </li>
          </ul>
        </section>

        {welcome ? (
          <FormMessage tone="success" title="Your email is confirmed">
            Welcome to Aexo. Invoices you save will appear in your account.
          </FormMessage>
        ) : null}
        {notice ? <FormMessage tone="success">{notice}</FormMessage> : null}

        <Card as="section" aria-labelledby="profile-title" className="rounded-2xl">
          <CardHeader>
            <SectionIcon icon={UserRound} />
            <CardTitle as="h2" id="profile-title">
              Profile
            </CardTitle>
            <CardDescription>How Aexo greets you.</CardDescription>
          </CardHeader>
          <ProfileForm fullName={user.fullName ?? ""} email={user.email} />
        </Card>

        <Card as="section" aria-labelledby="security-title" className="rounded-2xl">
          <CardHeader>
            <SectionIcon icon={KeyRound} />
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

        <Card as="section" aria-labelledby="session-title" className="rounded-2xl">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <SectionIcon icon={LogOut} className="mb-0" />
              <div className="min-w-0">
                <h2 id="session-title" className="text-h3 text-ink">
                  Session
                </h2>
                <p className="truncate text-body text-muted">Signed in as {user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </Card>
      </Container>
    </main>
  );
}
