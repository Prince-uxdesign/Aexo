import { getAccountUser, requireUserId } from "@/lib/auth/session";
import { AppHeader } from "./_components/app-header";

/**
 * Signed-in area. The proxy already redirects signed-out visitors; this is the
 * real check, on the server, for every page in the group.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUserId();
  const user = await getAccountUser();

  return (
    <>
      <AppHeader name={user?.fullName ?? null} email={user?.email ?? ""} />
      {children}
    </>
  );
}
