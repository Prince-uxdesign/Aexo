import { routes } from "@/config/routes";

export const marketingNav = [
  { label: "How it works", href: routes.landing.howItWorks },
  { label: "Features", href: routes.landing.features },
  { label: "Templates", href: routes.landing.templates },
  { label: "Security", href: routes.landing.security },
  { label: "Pricing", href: routes.landing.pricing },
] as const;
