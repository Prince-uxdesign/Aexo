"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui";
import { todayIso } from "@/lib/format/date";
import { updateInvoice } from "@/features/invoices/actions";
import type { Invoice } from "../model/types";
import { fromInvoice, toInvoice } from "../form/form-mapping";
import type { InvoiceFormStore } from "../form/form-store";
import { createDefaultValues } from "../form/form-values";
import { useAutoSave } from "./use-auto-save";

/** Quiet window before edits write themselves to the record. */
const RECORD_AUTO_SAVE_DELAY_MS = 2500;

export type SavedEditing = {
  id: string;
  invoice: Invoice;
};

/** Move to the first field with an error once React has shown the messages. */
function focusFirstError() {
  requestAnimationFrame(() => {
    const field = document.querySelector<HTMLElement>("[data-invoice-form] [aria-invalid='true']");
    if (!field) return;
    field.focus({ preventScroll: true });
    field.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

/**
 * Editing a saved invoice (dashboard → Open). Loads the record once and
 * ignores the device draft: the two must never mix. Saving validates first,
 * then overwrites the record and keeps the person editing.
 */
export function useSavedSession(store: InvoiceFormStore, saved: SavedEditing | undefined) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  // The record being edited never changes for the life of this page.
  const [target] = useState(saved);

  useEffect(() => {
    if (!target) return;
    const defaults = createDefaultValues({
      today: todayIso(),
      template: target.invoice.template ?? "classic",
    });
    store.actions.load(fromInvoice(target.invoice, defaults));
  }, [store, target]);

  // Silent write shared by the manual button and auto-save. No validation:
  // drafts may be partial; the manual button validates before calling save().
  const persist = useCallback(async () => {
    if (!target) return;
    await updateInvoice(target.id, toInvoice(store.getState().values));
    store.actions.markSaved(new Date().toISOString());
  }, [store, target]);

  useAutoSave(store, {
    enabled: Boolean(target),
    delayMs: RECORD_AUTO_SAVE_DELAY_MS,
    save: persist,
  });

  const save = useCallback(async () => {
    if (!target) return;
    if (!store.actions.revealErrors()) {
      const count = Object.keys(store.getErrors()).length;
      toast({
        title:
          count === 1
            ? "One detail needs your attention."
            : `${count} details need your attention.`,
        description: "We've highlighted what to fix.",
        tone: "error",
      });
      focusFirstError();
      return;
    }
    setSaving(true);
    store.actions.setAutoSaveStatus("saving");
    try {
      await persist();
      store.actions.setAutoSaveStatus("idle");
      toast({ title: "Invoice saved.", tone: "success" });
    } catch (error) {
      store.actions.setAutoSaveStatus("error");
      toast({
        title: error instanceof Error ? error.message : "Could not save your invoice. Try again.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [store, target, toast, persist]);

  return { save, saving };
}
