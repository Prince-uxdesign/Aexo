import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Features } from "./_components/features";
import { FinalCta } from "./_components/final-cta";
import { Hero } from "./_components/hero";
import { HowItWorks } from "./_components/how-it-works";
import { PrecisionSection } from "./_components/precision-section";
import { PricingSection } from "./_components/pricing-section";
import { ReduceFrictionSection } from "./_components/reduce-friction-section";
import { SaveHoursSection } from "./_components/save-hours-section";
import { SecuritySection } from "./_components/security-section";
import { SuperchargeSection } from "./_components/supercharge-section";
import { TemplateShowcase } from "./_components/template-showcase";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name}: Invoices, not paperwork` },
  description: siteConfig.description,
};

export default function LandingPage() {
  return (
    <main id="main" className="flex-1 overflow-x-clip">
      <Hero />
      <SaveHoursSection />
      <HowItWorks />
      <Features />
      <PrecisionSection />
      <ReduceFrictionSection />
      <SuperchargeSection />
      <TemplateShowcase />
      <SecuritySection />
      <PricingSection />
      <FinalCta />
    </main>
  );
}
