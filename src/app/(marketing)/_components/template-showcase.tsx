import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { iconSize, iconStroke } from "@/components/ui";
import { routes } from "@/config/routes";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { templates } from "@/features/invoice/templates";
import { SectionHeading } from "./section-heading";

/**
 * The four templates, each rendering the same sample invoice.
 * - Phones: a horizontal, snapping showcase. Cards are ~80% of the screen so
 *   each preview is large enough to read its style, and the next card peeks in.
 * - 768–1279px: a 2 × 2 grid.
 * - From 1280px: four columns.
 * Previews show the top of the page (header, parties, items), where templates
 * differ most.
 */
export function TemplateShowcase() {
  return (
    <section
      id="templates"
      aria-labelledby="templates-title"
      className="scroll-mt-header border-y border-border bg-surface-alt py-section"
    >
      <Container className="flex flex-col gap-10 md:gap-14">
        <SectionHeading
          id="templates-title"
          eyebrow="Templates"
          title="Four templates. One set of details."
          description="Every template uses the same information, so you can switch at any time without retyping a thing."
        />

        <ul
          aria-label="Invoice templates"
          // Keyboard users can scroll the row on phones; it's a normal grid from 768px.
          tabIndex={0}
          className="-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4"
        >
          {templates.map((template) => (
            <li
              key={template.id}
              className="w-[80%] max-w-80 shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <Link
                href={routes.createInvoiceWith(template.id)}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-[border-color,translate] duration-200 ease-standard hover:-translate-y-0.5 hover:border-border-strong motion-reduce:hover:translate-y-0"
              >
                <div className="border-b border-border bg-canvas p-4 sm:p-5">
                  <InvoiceDocument
                    invoice={sampleInvoice}
                    template={template.id}
                    aspect="600 / 560"
                    label={`${template.name} template preview`}
                    className="shadow-control"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-h3 text-ink">{template.name}</h3>
                  <p className="text-body text-muted">{template.description}</p>
                  <span className="mt-auto flex items-center gap-1.5 pt-3 text-label text-ink">
                    Use {template.name}
                    <ArrowRight
                      size={iconSize.sm}
                      strokeWidth={iconStroke}
                      className="transition-transform duration-200 ease-standard group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
