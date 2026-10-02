import {
  createItemId,
  dueDateForTerms,
  emptyItem,
  type CustomizationValues,
  type InvoiceFormValues,
  type ItemValues,
  type PartyValues,
  type PaymentTermId,
} from "./form-values";
import { validateInvoiceForm, type FormErrors } from "./form-validation";

/**
 * State for one invoice being edited, outside React.
 *
 * Components subscribe to the slice they render (`useFormValue`), so typing in
 * the recipient's email re-renders the recipient section and nothing else.
 * The preview reads a deferred snapshot of the whole invoice. Edits go through
 * `actions`, which keep related fields consistent (terms ↔ due date).
 */

export type FormState = {
  values: InvoiceFormValues;
  /** Fields the person has left at least once; their errors become visible. */
  touched: Partial<Record<string, true>>;
  /** Set when they try to finish: every error shows. */
  showAllErrors: boolean;
  /** Bumped on every edit; compared with `savedRevision` to spot unsaved changes. */
  revision: number;
  savedRevision: number;
  /** ISO timestamp of the last save on this device. */
  savedAt: string | null;
  /**
   * Background save state for the subtle "Saving… / Saved / Unable to save"
   * line. Manual and automatic saves share it; edits never touch it.
   */
  autoSave: { status: "idle" | "saving" | "error" };
  /** False until the browser has set dates and restored any draft. */
  ready: boolean;
  /** The values came from a draft kept on this device. */
  restoredDraft: boolean;
};

type PartyKey = "sender" | "recipient";

export function createInvoiceFormStore(initial: InvoiceFormValues) {
  let state: FormState = {
    values: initial,
    touched: {},
    showAllErrors: false,
    revision: 0,
    savedRevision: 0,
    savedAt: null,
    autoSave: { status: "idle" },
    ready: false,
    restoredDraft: false,
  };
  const listeners = new Set<() => void>();
  let errorCache: { values: InvoiceFormValues; errors: FormErrors } | null = null;

  const set = (patch: Partial<FormState>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };

  const edit = (recipe: (values: InvoiceFormValues) => InvoiceFormValues) => {
    set({ values: recipe(state.values), revision: state.revision + 1 });
  };

  const getErrors = () => {
    if (errorCache?.values !== state.values) {
      errorCache = { values: state.values, errors: validateInvoiceForm(state.values) };
    }
    return errorCache.errors;
  };

  const actions = {
    update(patch: Partial<InvoiceFormValues>) {
      edit((values) => ({ ...values, ...patch }));
    },

    updateParty(party: PartyKey, patch: Partial<PartyValues>) {
      edit((values) => ({ ...values, [party]: { ...values[party], ...patch } }));
    },

    updatePayment(patch: Partial<InvoiceFormValues["payment"]>) {
      edit((values) => ({ ...values, payment: { ...values.payment, ...patch } }));
    },

    updateDiscount(patch: Partial<InvoiceFormValues["discount"]>) {
      edit((values) => ({ ...values, discount: { ...values.discount, ...patch } }));
    },

    updateTax(patch: Partial<InvoiceFormValues["tax"]>) {
      edit((values) => ({ ...values, tax: { ...values.tax, ...patch } }));
    },

    /** Presentation only — never touches calculations or data. */
    updateCustomization(patch: Partial<CustomizationValues>) {
      edit((values) => ({
        ...values,
        customization: { ...values.customization, ...patch },
      }));
    },

    updateItem(id: string, patch: Partial<ItemValues>) {
      edit((values) => ({
        ...values,
        items: values.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      }));
    },

    /** Adds an empty line and returns its id, so the caller can focus it. */
    addItem() {
      const item = emptyItem();
      edit((values) => ({ ...values, items: [...values.items, item] }));
      return item.id;
    },

    removeItem(id: string) {
      edit((values) => {
        const items = values.items.filter((item) => item.id !== id);
        // Always keep one line to type into.
        return { ...values, items: items.length ? items : [emptyItem()] };
      });
    },

    /** Copies a line directly below the original and returns the new id. */
    duplicateItem(id: string) {
      const source = state.values.items.find((item) => item.id === id);
      if (!source) return id;
      const copy: ItemValues = { ...source, id: createItemId() };
      edit((values) => {
        const index = values.items.findIndex((item) => item.id === id);
        const items = [...values.items];
        items.splice(index + 1, 0, copy);
        return { ...values, items };
      });
      return copy.id;
    },

    /** Moving the issue date moves a preset due date with it. */
    setIssueDate(issueDate: string) {
      edit((values) => ({
        ...values,
        issueDate,
        dueDate: dueDateForTerms(issueDate, values.paymentTerms) ?? values.dueDate,
      }));
    },

    setPaymentTerms(paymentTerms: PaymentTermId) {
      edit((values) => ({
        ...values,
        paymentTerms,
        dueDate: dueDateForTerms(values.issueDate, paymentTerms) ?? values.dueDate,
      }));
    },

    /** Picking a date a preset doesn't produce switches the terms to custom. */
    setDueDate(dueDate: string) {
      edit((values) => {
        const fromTerms = dueDateForTerms(values.issueDate, values.paymentTerms);
        const keepsPreset = fromTerms === null || fromTerms === dueDate;
        return { ...values, dueDate, paymentTerms: keepsPreset ? values.paymentTerms : "custom" };
      });
    },

    touch(path: string) {
      if (state.touched[path]) return;
      set({ touched: { ...state.touched, [path]: true } });
    },

    /** Show every error (used when finishing). Returns whether the form is valid. */
    revealErrors() {
      set({ showAllErrors: true });
      return Object.keys(getErrors()).length === 0;
    },

    /** Replace everything, e.g. with a restored draft or a fresh invoice. */
    load(values: InvoiceFormValues, draft?: { savedAt: string | null }) {
      set({
        values,
        touched: {},
        showAllErrors: false,
        revision: 0,
        savedRevision: 0,
        savedAt: draft?.savedAt ?? null,
        autoSave: { status: "idle" },
        ready: true,
        restoredDraft: Boolean(draft),
      });
    },

    markSaved(savedAt: string) {
      set({ savedAt, savedRevision: state.revision });
    },

    /** Background save progress. Never bumps the revision. */
    setAutoSaveStatus(status: "idle" | "saving" | "error") {
      if (state.autoSave.status === status) return;
      set({ autoSave: { status } });
    },
  };

  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getErrors,
    /** The message to show for a field right now, if any. */
    visibleError(path: string) {
      if (!state.showAllErrors && !state.touched[path]) return undefined;
      return getErrors()[path];
    },
    actions,
  };
}

export type InvoiceFormStore = ReturnType<typeof createInvoiceFormStore>;
export type FormActions = InvoiceFormStore["actions"];
