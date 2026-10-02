import { Download, Eye, FileText, LayoutTemplate, Link2, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/layout/container";
import { iconSize, iconStroke } from "@/components/ui";
import { SectionHeading } from "./section-heading";

const features = [
  {
    icon: FileText,
    title: "Professional by default",
    body: "Clean layouts with clear totals, dates and payment details. Nothing to design.",
  },
  {
    icon: LayoutTemplate,
    title: "Four templates",
    body: "Classic, Modern, Accent and Compact. Switch any time; your details stay put.",
  },
  {
    icon: Eye,
    title: "Live preview",
    body: "See the finished invoice update as you type, exactly as your client will.",
  },
  {
    icon: Download,
    title: "PDF and print",
    body: "Download a print-ready PDF or print straight from your browser.",
  },
  {
    icon: Link2,
    title: "Shareable links",
    body: "Send a link your client can open on any device, or email the invoice directly.",
  },
  {
    icon: SlidersHorizontal,
    title: "Easy to customise",
    body: "Your logo, currency, tax, discount, payment details and notes.",
  },
];

/**
 * - Phones: a compact list (icon beside text) so six items don't become six tall cards.
 * - 768px: two columns. From 1024px: three.
 */
export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-header py-section">
      <Container className="flex flex-col gap-10 md:gap-14">
        <SectionHeading
          id="features-title"
          eyebrow="Features"
          title="Everything an invoice needs. Nothing it doesn't."
        />

        <ul className="grid md:grid-cols-2 md:gap-x-8 lg:grid-cols-3 lg:gap-x-10">
          {features.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex gap-4 border-t border-border py-6 md:flex-col md:gap-5 md:py-8"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-surface-alt text-ink">
                <Icon size={iconSize.md} strokeWidth={iconStroke} />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-body font-medium text-ink md:text-h3">{title}</h3>
                <p className="text-body text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
