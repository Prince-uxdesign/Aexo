import type { Metadata } from "next";
import { InvoiceWorkspace } from "@/features/invoice/workspace/invoice-workspace";
import { templates } from "@/features/invoice/templates";
import type { TemplateId } from "@/features/invoice/model/types";

export const metadata: Metadata = {
  title: "Create an invoice",
  description: "Add your details, choose a template and see your invoice as you type.",
};

function isTemplateId(value: unknown): value is TemplateId {
  return templates.some((template) => template.id === value);
}

/** `?template=modern` (from the landing page's template showcase) preselects a template. */
export default async function CreatePage({ searchParams }: PageProps<"/create">) {
  const { template } = await searchParams;
  return <InvoiceWorkspace initialTemplate={isTemplateId(template) ? template : undefined} />;
}
