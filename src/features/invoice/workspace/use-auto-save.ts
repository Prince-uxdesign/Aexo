"use client";

import { useEffect } from "react";
import { createAutoSaver } from "./auto-save";
import type { InvoiceFormStore } from "../form/form-store";

/**
 * Background saving for the invoice workspace. Watches the store's revision
 * and persists after `delayMs` of quiet — never per keystroke. Flushes when
 * the tab hides or the browser reconnects, so work survives closes and
 * network drops. Progress lands in the store (`Saving… / Saved / Unable`),
 * never in a toast: auto-save must not interrupt typing.
 */
export function useAutoSave(
  store: InvoiceFormStore,
  {
    enabled,
    delayMs,
    save,
  }: {
    enabled: boolean;
    delayMs: number;
    /** Reads current values itself and marks saved on success. */
    save: () => Promise<unknown>;
  },
) {
  useEffect(() => {
    if (!enabled) return;

    const isDirty = () => {
      const state = store.getState();
      return state.ready && state.revision !== state.savedRevision;
    };

    const saver = createAutoSaver({
      delayMs,
      save: async () => {
        // Skip quiet-window saves made stale by a manual save racing us.
        if (!isDirty()) return;
        store.actions.setAutoSaveStatus("saving");
        await save();
      },
      onSettled: (ok) => store.actions.setAutoSaveStatus(ok ? "idle" : "error"),
    });

    let lastRevision = store.getState().revision;
    const unsubscribe = store.subscribe(() => {
      const { revision } = store.getState();
      if (revision === lastRevision) return;
      lastRevision = revision;
      if (isDirty()) saver.notifyDirty();
    });

    const onHidden = () => {
      if (document.visibilityState === "hidden" && isDirty()) saver.flush();
    };
    const onOnline = () => {
      if (isDirty()) saver.flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("online", onOnline);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("online", onOnline);
      saver.dispose();
    };
  }, [store, enabled, delayMs, save]);
}
