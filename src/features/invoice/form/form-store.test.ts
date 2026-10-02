import { describe, expect, it } from "vitest";
import { createInvoiceFormStore } from "./form-store";
import { createDefaultValues } from "./form-values";

function freshStore() {
  return createInvoiceFormStore(createDefaultValues({ today: "2026-10-02" }));
}

describe("autoSave status", () => {
  it("starts idle and never bumps the revision", () => {
    const store = freshStore();
    expect(store.getState().autoSave).toEqual({ status: "idle" });
    const { revision } = store.getState();
    store.actions.setAutoSaveStatus("saving");
    expect(store.getState().autoSave).toEqual({ status: "saving" });
    expect(store.getState().revision).toBe(revision);
    store.actions.setAutoSaveStatus("error");
    expect(store.getState().revision).toBe(revision);
  });

  it("resets to idle on load", () => {
    const store = freshStore();
    store.actions.setAutoSaveStatus("error");
    store.actions.load(createDefaultValues({ today: "2026-10-03" }));
    expect(store.getState().autoSave).toEqual({ status: "idle" });
  });

  it("notifies subscribers so the status line updates", () => {
    const store = freshStore();
    let calls = 0;
    const stop = store.subscribe(() => {
      calls += 1;
    });
    store.actions.setAutoSaveStatus("saving");
    expect(calls).toBe(1);
    // Same status twice: no redundant render.
    store.actions.setAutoSaveStatus("saving");
    expect(calls).toBe(1);
    stop();
  });
});
