"use client";

import {
  createContext,
  useContext,
  useDeferredValue,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Invoice } from "../model/types";
import { toPreviewInvoice } from "./form-mapping";
import type { FormState, InvoiceFormStore } from "./form-store";
import type { InvoiceFormValues } from "./form-values";

const FormStoreContext = createContext<InvoiceFormStore | null>(null);

export function InvoiceFormProvider({
  store,
  children,
}: {
  store: InvoiceFormStore;
  children: ReactNode;
}) {
  return <FormStoreContext.Provider value={store}>{children}</FormStoreContext.Provider>;
}

export function useFormStore() {
  const store = useContext(FormStoreContext);
  if (!store) throw new Error("Invoice form hooks must be used inside <InvoiceFormProvider>.");
  return store;
}

/**
 * Subscribe to part of the store. The selector must return something stable:
 * a primitive, or an object the store already holds (`s => s.values.sender`).
 */
export function useFormState<T>(selector: (state: FormState) => T): T {
  const store = useFormStore();
  const read = () => selector(store.getState());
  return useSyncExternalStore(store.subscribe, read, read);
}

export function useFormValue<T>(selector: (values: InvoiceFormValues) => T): T {
  return useFormState((state) => selector(state.values));
}

export function useFormActions() {
  return useFormStore().actions;
}

/** The message to show under a field, once it has been visited or on finish. */
export function useFieldError(path: string) {
  const store = useFormStore();
  const read = () => store.visibleError(path);
  return useSyncExternalStore(store.subscribe, read, read);
}

/**
 * The invoice as the preview should render it. Deferred, so the preview
 * catches up a beat after typing instead of slowing every keystroke.
 */
export function usePreviewInvoice(): Invoice {
  const values = useFormValue((v) => v);
  const deferred = useDeferredValue(values);
  return useMemo(() => toPreviewInvoice(deferred), [deferred]);
}
