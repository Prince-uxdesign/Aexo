import Link from "next/link";
import { ChevronRight, LayoutTemplate } from "lucide-react";
import { Container } from "@/components/layout/container";
import { iconSize } from "@/components/ui";
import { routes } from "@/config/routes";
import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { templates } from "@/features/invoice/templates";
import { cn } from "@/lib/utils/cn";
import { revealDelay } from "./motion";
import { InlineTile, SectionHeading, sectionClass } from "./section-heading";

/** The four real templates, rendered with the same sample data. */
export function TemplateShowcase() {
  return (
    <section
      id="templates"
      aria-labelledby="templates-title"
      className={cn(sectionClass, "pt-0 md:pt-0 lg:pt-0")}
    >
      <Container>
        <SectionHeading
          id="templates-title"
          title={
            <>
              Four <InlineTile icon={LayoutTemplate} /> templates.
              <br className="max-sm:hidden" /> One set of details.
            </>
          }
          description="Every template uses the same invoice, so you can switch the look without retyping anything."
        />

        {/* Swipeable row on phones, grid from 768px. */}
        <ul
          aria-label="Invoice templates"
          className="-mx-gutter mt-14 flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-4 md:mx-0 md:mt-20 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4 xl:gap-6"
        >
          {/* Each card tips up towards the viewer, one after another. */}
          {templates.map((template, i) => (
            <li
              key={template.id}
              data-reveal="tilt"
              style={revealDelay(i * 130)}
              className="w-[80%] max-w-80 shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <Link
                href={routes.createInvoiceWith(template.id)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-mist"
              >
                <div className="px-6 pt-6 sm:px-8 sm:pt-8">
                  <InvoiceDocument
                    invoice={sampleInvoice}
                    template={template.id}
                    aspect="600 / 640"
                    label={`${template.name} template preview`}
                    className="rounded-b-none shadow-float transition-transform duration-200 ease-standard group-hover:-translate-y-1"
                  />
                </div>
                <div className="relative flex flex-1 flex-col p-6">
                  <h3 className="text-h3 text-ink">{template.name}</h3>
                  <p className="mt-1.5 text-body text-muted">{template.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-5 text-button text-ink">
                    Use {template.name}
                    <ChevronRight
                      size={iconSize.sm}
                      strokeWidth={2}
                      className="transition-transform duration-150 ease-standard group-hover:translate-x-0.5"
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
