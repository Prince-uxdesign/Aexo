import type { ComponentType } from "react";
import type { Invoice, TemplateId } from "../model/types";
import { AccentTemplate } from "./accent";
import { ClassicTemplate } from "./classic";
import { CompactTemplate } from "./compact";
import { ModernTemplate } from "./modern";

export type TemplateDefinition = {
  id: TemplateId;
  name: string;
  description: string;
  Component: ComponentType<{ invoice: Invoice }>;
};

/** Order here is the order templates are offered to people. Classic is the default. */
export const templates: TemplateDefinition[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Simple black type and minimal lines. Works for any business.",
    Component: ClassicTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    description: "A large invoice number, generous whitespace and very few borders.",
    Component: ModernTemplate,
  },
  {
    id: "accent",
    name: "Accent",
    description: "Classic structure with small coral details. Still restrained.",
    Component: AccentTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    description: "Denser layout for invoices with many line items.",
    Component: CompactTemplate,
  },
];

export function getTemplate(id: TemplateId) {
  return templates.find((template) => template.id === id) ?? templates[0];
}
