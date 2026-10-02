import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Audiences } from "./_components/audiences";
import { Features } from "./_components/features";
import { FinalCta } from "./_components/final-cta";
import { Hero } from "./_components/hero";
import { HowItWorks } from "./_components/how-it-works";
import { TemplateShowcase } from "./_components/template-showcase";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name}: Create professional invoices in minutes` },
  description: siteConfig.description,
};

export default function LandingPage() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <HowItWorks />
      <TemplateShowcase />
      <Features />
      <Audiences />
      <FinalCta />
    </main>
  );
}
