import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

/** The dashboard is the single invoice list; /invoices stays a valid bookmark. */
export default function InvoicesPage() {
  redirect(routes.dashboard);
}
