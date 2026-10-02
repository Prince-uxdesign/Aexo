"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button, Input, Textarea, iconSize, iconStroke } from "@/components/ui";
import { useFormActions, useFormValue } from "../form-context";
import { FormField } from "../form-field";
import { FormSection, SectionGrid } from "../form-section";
import { LogoField } from "./logo-field";

type PartySectionProps = {
  party: "sender" | "recipient";
  step: number;
};

const copy = {
  sender: {
    id: "sender",
    title: "Your details",
    description: "Who the invoice is from. This is what your client sees.",
    name: "Business name",
    namePlaceholder: "Your business or your name",
    address: "Address",
    more: "Add website and tax ID",
    less: "Hide website and tax ID",
  },
  recipient: {
    id: "recipient",
    title: "Bill to",
    description: "The person or business paying this invoice.",
    name: "Client name",
    namePlaceholder: "Business or person",
    address: "Billing address",
    more: "Add tax ID",
    less: "Hide tax ID",
  },
} as const;

/** Sender and recipient share one layout; the sender also gets a logo and website. */
export function PartySection({ party, step }: PartySectionProps) {
  const values = useFormValue((v) => v[party]);
  const { updateParty } = useFormActions();
  const text = copy[party];
  const isSender = party === "sender";
  const extrasId = useId();

  // Optional fields stay tucked away until asked for, or when they already hold something.
  const [showExtras, setShowExtras] = useState(false);
  const hasExtras = Boolean(values.taxId || (isSender && values.website));
  const extrasOpen = showExtras || hasExtras;

  const set = (patch: Partial<typeof values>) => updateParty(party, patch);

  return (
    <FormSection id={text.id} step={step} title={text.title} description={text.description}>
      <div className="flex flex-col gap-5">
        {isSender ? <LogoField /> : null}

        <SectionGrid>
          <FormField path={`${party}.name`} label={text.name} required className="@md:col-span-2">
            <Input
              value={values.name}
              onChange={(event) => set({ name: event.target.value })}
              autoComplete={isSender ? "organization" : "off"}
              placeholder={text.namePlaceholder}
            />
          </FormField>

          <FormField path={`${party}.email`} label="Email">
            <Input
              type="email"
              inputMode="email"
              value={values.email}
              onChange={(event) => set({ email: event.target.value })}
              autoComplete={isSender ? "email" : "off"}
              spellCheck={false}
              placeholder="name@example.com"
            />
          </FormField>

          <FormField path={`${party}.phone`} label="Phone">
            <Input
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(event) => set({ phone: event.target.value })}
              autoComplete={isSender ? "tel" : "off"}
            />
          </FormField>

          <FormField
            path={`${party}.address`}
            label={text.address}
            hint="Each line appears as it does here."
            className="@md:col-span-2"
          >
            <Textarea
              rows={3}
              value={values.address}
              onChange={(event) => set({ address: event.target.value })}
              autoComplete={isSender ? "street-address" : "off"}
              className="min-h-24"
            />
          </FormField>

          {extrasOpen ? (
            <div id={extrasId} className="contents">
              {isSender ? (
                <FormField path={`${party}.website`} label="Website">
                  <Input
                    type="url"
                    inputMode="url"
                    value={values.website}
                    onChange={(event) => set({ website: event.target.value })}
                    autoComplete="url"
                    spellCheck={false}
                    placeholder="yourbusiness.com"
                  />
                </FormField>
              ) : null}
              <FormField
                path={`${party}.taxId`}
                label="Tax ID"
                hint="VAT, GST, EIN or TIN, if you need to show one."
              >
                <Input
                  value={values.taxId}
                  onChange={(event) => set({ taxId: event.target.value })}
                  autoComplete="off"
                  spellCheck={false}
                />
              </FormField>
            </div>
          ) : null}
        </SectionGrid>

        {hasExtras ? null : (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={extrasOpen}
            aria-controls={extrasOpen ? extrasId : undefined}
            onClick={() => setShowExtras((open) => !open)}
            leadingIcon={
              extrasOpen ? (
                <Minus size={iconSize.sm} strokeWidth={iconStroke} />
              ) : (
                <Plus size={iconSize.sm} strokeWidth={iconStroke} />
              )
            }
            className="-ml-3 self-start"
          >
            {extrasOpen ? text.less : text.more}
          </Button>
        )}
      </div>
    </FormSection>
  );
}
