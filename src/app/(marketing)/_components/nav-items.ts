import { routes } from "@/config/routes";

export const marketingNav = [
  { label: "How it works", href: routes.landing.howItWorks },
  { label: "Templates", href: routes.landing.templates },
  { label: "Features", href: routes.landing.features },
] as const;
