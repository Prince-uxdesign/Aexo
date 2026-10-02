"use client";

import { Check } from "lucide-react";
import { Divider, Input, SegmentedControl, Toggle, iconSize } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { ACCENTS, INVOICE_FONTS } from "../../model/customization";
import { InvoiceDocument } from "../../components/invoice-document";
import { templates } from "../../templates";
import { useFormActions, useFormValue, usePreviewInvoice } from "../form-context";
import { FormField } from "../form-field";
import { FormSection, SectionGrid } from "../form-section";

/**
 * Template picker + customization. Each option previews the person's own
 * invoice, so the choice is about how *their* invoice looks. Native radios
 * underneath: arrow keys move between templates.
 *
 * Phones get one stacked card per template (readable, big touch targets);
 * two columns once the viewport allows it.
 */
export function TemplateSection({ step }: { step: number }) {
  const selected = useFormValue((v) => v.template);
  const customization = useFormValue((v) => v.customization);
  const { update, updateCustomization } = useFormActions();
  const invoice = usePreviewInvoice();

  return (
    <FormSection
      id="template"
      step={step}
      title="Template & style"
      description="Change it any time. Your details and totals stay the same."
    >
      <div className="flex flex-col gap-6">
        <fieldset>
          <legend className="sr-only">Invoice template</legend>
          <div className="grid grid-cols-1 gap-3 min-[30rem]:grid-cols-2">
            {templates.map((template) => {
              const checked = template.id === selected;
              return (
                <label
                  key={template.id}
                  className={cn(
                    "group relative flex min-w-0 flex-col gap-3 rounded-md border p-2.5 pb-3",
                    "transition-[border-color,background-color] duration-150 ease-standard",
                    "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                    checked
                      ? "border-ink bg-surface-alt"
                      : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <input
                    type="radio"
                    name="invoice-template"
                    value={template.id}
                    checked={checked}
                    onChange={() => update({ template: template.id })}
                    aria-describedby={`template-${template.id}-description`}
                    className="sr-only"
                  />
                  {/* Visual only: inside a label its text would become the radio's name. */}
                  <span aria-hidden className="pointer-events-none block">
                    <InvoiceDocument
                      invoice={invoice}
                      template={template.id}
                      aspect="600 / 520"
                      className="border border-border"
                    />
                  </span>
                  <span className="flex items-center justify-between gap-2 px-0.5">
                    <span className="truncate text-label text-ink">{template.name}</span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-pill",
                        checked ? "bg-accent text-paper" : "border border-border-strong",
                      )}
                    >
                      {checked ? <Check size={iconSize.sm - 4} strokeWidth={2.25} /> : null}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {/* Outside the labels, so each radio's name is just the template name. */}
          <div hidden>
            {templates.map((template) => (
              <span key={template.id} id={`template-${template.id}-description`}>
                {template.description}
              </span>
            ))}
          </div>
        </fieldset>

        <Divider />

        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-2 text-label text-ink">
              Accent colour
              <span className="mt-0.5 block text-caption font-normal text-muted">
                Used by the Accent template for its details. Other templates stay monochrome.
              </span>
            </legend>
            <div className="grid grid-cols-2 gap-2 min-[30rem]:grid-cols-4">
              {ACCENTS.map((accent) => {
                const checked = accent.id === customization.accent;
                return (
                  <label
                    key={accent.id}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2",
                      "transition-[border-color,background-color] duration-150 ease-standard",
                      "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                      checked
                        ? "border-ink bg-surface-alt"
                        : "border-border bg-surface hover:border-border-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="invoice-accent"
                      value={accent.id}
                      checked={checked}
                      onChange={() => updateCustomization({ accent: accent.id })}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={cn("size-4 shrink-0 rounded-pill", accent.swatchClass)}
                    />
                    <span className="min-w-0 flex-1 truncate text-label text-ink">
                      {accent.name}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-pill",
                        checked ? "bg-ink text-canvas" : "text-transparent",
                      )}
                    >
                      <Check size={iconSize.sm - 4} strokeWidth={2.25} />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <SectionGrid>
            <FormField
              path="customization.title"
              label="Invoice heading"
              hint="Shown at the top of the document."
            >
              <Input
                value={customization.title}
                onChange={(event) => updateCustomization({ title: event.target.value })}
                autoComplete="off"
                placeholder="Invoice"
                maxLength={24}
              />
            </FormField>
            <div className="flex min-w-0 flex-col justify-end">
              <SegmentedControl
                label="Typeface"
                showLabel
                value={customization.font}
                onValueChange={(font) => updateCustomization({ font })}
                options={INVOICE_FONTS.map((font) => ({ value: font.id, label: font.name }))}
              />
            </div>
          </SectionGrid>

          <div className="flex flex-col">
            <Toggle
              label="Show payment details"
              description="Hide them for invoices paid another way. Your saved details stay."
              checked={customization.showPayment}
              onCheckedChange={(showPayment) => updateCustomization({ showPayment })}
            />
            <Toggle
              label="Show notes"
              description="Hide them without deleting what you wrote."
              checked={customization.showNotes}
              onCheckedChange={(showNotes) => updateCustomization({ showNotes })}
            />
          </div>

          <FormField
            path="customization.footerText"
            label="Footer line (optional)"
            hint="One centred line at the bottom, e.g. a thank-you or registration number."
          >
            <Input
              value={customization.footerText}
              onChange={(event) => updateCustomization({ footerText: event.target.value })}
              autoComplete="off"
              placeholder="Thank you for your business."
              maxLength={90}
            />
          </FormField>
        </div>
      </div>
    </FormSection>
  );
}
