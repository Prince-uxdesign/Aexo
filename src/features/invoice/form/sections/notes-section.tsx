"use client";

import { Textarea } from "@/components/ui";
import { useFormActions, useFormValue } from "../form-context";
import { FormField } from "../form-field";
import { FormSection } from "../form-section";

const MAX_NOTES = 1000;

export function NotesSection({ step }: { step: number }) {
  const notes = useFormValue((v) => v.notes);
  const { update } = useFormActions();
  const nearLimit = notes.length > MAX_NOTES * 0.8;

  return (
    <FormSection
      id="notes"
      step={step}
      title="Notes"
      description="A thank-you, terms or anything else your client should know."
    >
      <FormField
        path="notes"
        label="Notes"
        hint={nearLimit ? `${MAX_NOTES - notes.length} characters left.` : "Optional."}
      >
        <Textarea
          rows={3}
          value={notes}
          maxLength={MAX_NOTES}
          onChange={(event) => update({ notes: event.target.value })}
          placeholder="Thank you for your business."
          className="min-h-24"
        />
      </FormField>
    </FormSection>
  );
}
