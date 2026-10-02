import { InvoiceDocument } from "@/features/invoice/components/invoice-document";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { templates } from "@/features/invoice/templates";
import { Demo } from "./demo-helpers";

/** Every template, full page, same sample data. Check here after changing a template. */
export function TemplatesDemo() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {templates.map((template) => (
        <Demo key={template.id} title={`${template.name}: ${template.description}`}>
          <div className="rounded-lg bg-surface-alt p-4 sm:p-6">
            <InvoiceDocument
              invoice={sampleInvoice}
              template={template.id}
              className="shadow-elevated"
            />
          </div>
        </Demo>
      ))}
    </div>
  );
}
