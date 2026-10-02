import { publicEnv } from "@/lib/env";

export const siteConfig = {
  name: "Aexo",
  tagline: "Make an invoice. Send it. Done.",
  description: "Create professional invoices in minutes. No account needed to get started.",
  url: publicEnv.siteUrl,
} as const;
