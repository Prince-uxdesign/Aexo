import type { Metadata } from "next";
import { getAccountUser } from "@/lib/auth/session";
import { listInvoices } from "@/features/invoices/queries";
import { DashboardEmpty } from "./_components/dashboard-empty";
import { DashboardView } from "./_components/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your saved invoices: track, search and manage them.",
};

/** Signed-in home: recent invoices with search and status filtering. */
export default async function DashboardPage() {
  const [user, invoices] = await Promise.all([getAccountUser(), listInvoices()]);
  const firstName = user?.fullName?.split(" ")[0];
  const greeting = firstName ? `Welcome back, ${firstName}` : "Your invoices";

  return <DashboardView invoices={invoices} greeting={greeting} empty={<DashboardEmpty />} />;
}
