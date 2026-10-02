"use client";

import { useCallback, useEffect, useRef } from "react";
import { useToast } from "@/components/ui";
import { todayIso } from "@/lib/format/date";
import { clearDraft, loadDraft, saveDraft } from "../draft/draft-storage";
import { fromInvoice, toInvoice } from "../form/form-mapping";
import type { InvoiceFormStore } from "../form/form-store";
import { createDefaultValues } from "../form/form-values";
import type { TemplateId } from "../model/types";
import { useAutoSave } from "./use-auto-save";

/** Quiet window before the device draft writes itself. */
const DRAFT_AUTO_SAVE_DELAY_MS = 1200;

/**
 * Connects the form to the draft kept on this device.
 * - On arrival: restores a saved draft, or starts a fresh invoice dated today
 *   (today comes from the browser, in the person's time zone).
 * - "Save draft" writes it to this device. No account needed (guide §16).
 * - Warns before leaving with unsaved changes.
 * - `disabled` is for editing a saved invoice: the device draft stays out of
 *   it entirely, but the unsaved-changes warning still applies.
 */
export function useDraftSession(
  store: InvoiceFormStore,
  initialTemplate?: TemplateId,
  opts?: { disabled?: boolean },
) {
  const { toast } = useToast();
  const lastDroppedLogo = useRef(false);

  useEffect(() => {
    if (opts?.disabled) return;
    const defaults = createDefaultValues({ today: todayIso(), template: initialTemplate });
    const draft = loadDraft();
    if (!draft) {
      store.actions.load(defaults);
      return;
    }
    const restored = fromInvoice(draft.invoice, defaults);
    // A template picked on the landing page wins over the one in the draft.
    store.actions.load(initialTemplate ? { ...restored, template: initialTemplate } : restored, {
      savedAt: draft.savedAt || null,
    });
  }, [store, initialTemplate, opts?.disabled]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      const { revision, savedRevision } = store.getState();
      if (revision !== savedRevision) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [store]);

  // Silent write shared by the manual button and auto-save. Throws when the
  // browser refuses storage; the logo-drop detail stays for the manual toast.
  const persist = useCallback(async () => {
    const result = saveDraft(toInvoice(store.getState().values));
    if (!result.ok) throw new Error("draft-storage-unavailable");
    lastDroppedLogo.current = result.droppedLogo;
    store.actions.markSaved(new Date().toISOString());
  }, [store]);

  // Quiet work saves itself; the button is for certainty, not for safety.
  useAutoSave(store, {
    enabled: !opts?.disabled,
    delayMs: DRAFT_AUTO_SAVE_DELAY_MS,
    save: persist,
  });

  const save = useCallback(() => {
    store.actions.setAutoSaveStatus("saving");
    persist().then(
      () => {
        store.actions.setAutoSaveStatus("idle");
        toast({
          title: "Draft saved on this device.",
          description: lastDroppedLogo.current
            ? "Your logo was too large to keep, so add it again when you come back."
            : undefined,
          tone: "success",
        });
      },
      () => {
        store.actions.setAutoSaveStatus("error");
        toast({
          title: "Could not save your draft.",
          description: "This browser isn't letting Aexo store data. Check site storage settings.",
          tone: "error",
        });
      },
    );
  }, [store, toast, persist]);

  const startNew = useCallback(() => {
    clearDraft();
    store.actions.load(
      createDefaultValues({ today: todayIso(), template: store.getState().values.template }),
    );
    toast({ title: "Started a new invoice." });
  }, [store, toast]);

  return { save, startNew };
}
