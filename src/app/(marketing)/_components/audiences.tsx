import { Building2, Camera, Handshake, PenTool, Users, Wrench } from "lucide-react";
import { Container } from "@/components/layout/container";
import { iconSize, iconStroke } from "@/components/ui";
import { SectionHeading } from "./section-heading";

const audiences = [
  { icon: PenTool, name: "Freelancers", body: "Bill clients for projects, hours or retainers." },
  {
    icon: Building2,
    name: "Businesses",
    body: "Send consistent invoices with your logo and details.",
  },
  { icon: Users, name: "Agencies", body: "Itemise phases, retainers and expenses clearly." },
  { icon: Handshake, name: "Consultants", body: "Invoice by the day, the hour or the engagement." },
  { icon: Camera, name: "Creators", body: "Bill brands for content, licensing and usage." },
  { icon: Wrench, name: "Service providers", body: "Charge for jobs, materials and call-outs." },
];

// Statements about how the product works (guide §16), not claims about customers.
const commitments = [
  {
    title: "Start without an account",
    body: "Create, preview, download and print without signing up.",
  },
  {
    title: "Ready to send",
    body: "Download a PDF, print it, or share it with a link or by email.",
  },
  {
    title: "Save when you're ready",
    body: "Create a free account to save, edit and manage your invoices.",
  },
];

/**
 * Who Aexo is for, plus plain product commitments. No testimonials, logos or
 * statistics: Aexo has none yet, so it shows none.
 * - Phones: audiences as a compact list; commitments stacked.
 * - From 640px: a 2-column grid; from 1024px, 3 columns.
 */
export function Audiences() {
  return (
    <section aria-labelledby="audiences-title" className="py-section">
      <Container className="flex flex-col gap-10 md:gap-14">
        <SectionHeading
          id="audiences-title"
          eyebrow="Who it's for"
          title="Made for anyone who bills for their work."
          description="Whether you send one invoice a year or several a week, the invoice should look as considered as the work behind it."
        />

        <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map(({ icon: Icon, name, body }) => (
            <li key={name} className="flex gap-4 bg-surface p-5 sm:flex-col sm:gap-4 sm:p-6 lg:p-8">
              <Icon size={iconSize.lg} strokeWidth={iconStroke} className="shrink-0 text-ink" />
              <div className="flex flex-col gap-1">
                <h3 className="text-body font-medium text-ink sm:text-h3">{name}</h3>
                <p className="text-body text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <ul className="grid gap-8 md:grid-cols-3 md:gap-8 lg:gap-10">
          {commitments.map((item) => (
            <li key={item.title} className="flex flex-col gap-2 border-l-2 border-accent pl-4">
              <h3 className="text-body font-medium text-ink">{item.title}</h3>
              <p className="text-body text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
