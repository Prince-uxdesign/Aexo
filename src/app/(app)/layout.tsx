import { getAccountUser, requireUserId } from "@/lib/auth/session";
import { AppHeader } from "./_components/app-header";

/**
 * Signed-in area. The proxy already redirects signed-out visitors; this is the
 * real check, on the server, for every page in the group.
 * Uses the landing page's cool theme (white and mist neutrals, sky accents);
 * invoice documents keep their own neutrals (see globals.css).
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUserId();
  const user = await getAccountUser();

  return (
    <div className="theme-cool flex flex-1 flex-col bg-canvas">
      <AppHeader name={user?.fullName ?? null} email={user?.email ?? ""} />
      {children}
    </div>
  );
}
