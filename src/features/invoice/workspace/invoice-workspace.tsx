"use client";

import { useCallback, useState } from "react";
import { Button, FormMessage, useToast } from "@/components/ui";
import { Container } from "@/components/layout/container";
import { InvoiceFormProvider, useFormState } from "../form/form-context";
import { createInvoiceFormStore } from "../form/form-store";
import { createDefaultValues } from "../form/form-values";
import { InvoiceForm } from "../form/invoice-form";
import type { TemplateId } from "../model/types";
import { ActionBar } from "./action-bar";
import { FullPreviewDialog, type PreviewMode } from "./full-preview-dialog";
import { MobilePreview } from "./mobile-preview";
import { PreviewPane } from "./preview-pane";
import { useDraftSession } from "./use-draft-session";
import { useSavedSession, type SavedEditing } from "./use-saved-session";
import { WorkspaceHeading } from "./workspace-heading";

/** Move to the first field with an error once React has shown the messages. */
function focusFirstError() {
  requestAnimationFrame(() => {
    const field = document.querySelector<HTMLElement>("[data-invoice-form] [aria-invalid='true']");
    if (!field) return;
    field.focus({ preventScroll: true });
    field.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

function RestoredNotice({ onStartNew }: { onStartNew: () => void }) {
  // Shown until the first edit: by then they've clearly chosen to continue.
  const visible = useFormState((s) => s.restoredDraft && s.revision === 0);
  if (!visible) return null;
  return (
    <FormMessage tone="info" title="Welcome back" className="mt-5">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span>We restored the draft saved on this device.</span>
        <Button variant="ghost" size="sm" onClick={onStartNew} className="-ml-4 sm:ml-0">
          Start a new invoice
        </Button>
      </div>
    </FormMessage>
  );
}

/**
 * The invoice creator.
 *
 * Phones (< 768): one column. Form sections, then the preview, with actions in
 * a sticky bottom bar.
 * Tablets (768–1023): the same flow in a centred 768px column. Side by side
 * would leave the preview ~370px wide, too small to read, so the preview sits
 * after the form at ~700px and opens full screen from the action bar at any time.
 * Desktop (1024+): form and preview side by side (≈46/54, then 48/52 from
 * 1280px). The preview sticks and scrolls on its own.
 *
 * With `saved`, it edits that record instead: the device draft stays out of
 * it and saving overwrites the record.
 */
export function InvoiceWorkspace({
  initialTemplate,
  saved,
}: {
  initialTemplate?: TemplateId;
  saved?: SavedEditing;
}) {
  // `today` is filled in by the browser on mount (useDraftSession); the server can't know it.
  const [store] = useState(() =>
    createInvoiceFormStore(
      createDefaultValues({ today: "", template: saved?.invoice.template ?? initialTemplate }),
    ),
  );
  const { save, startNew } = useDraftSession(store, initialTemplate, { disabled: Boolean(saved) });
  const { save: saveRecord, saving } = useSavedSession(store, saved);
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState<PreviewMode | null>(null);

  const finish = useCallback(() => {
    if (store.actions.revealErrors()) {
      setPreviewMode("finish");
      return;
    }
    setPreviewMode(null);
    const count = Object.keys(store.getErrors()).length;
    toast({
      title:
        count === 1 ? "One detail needs your attention." : `${count} details need your attention.`,
      description: "We've highlighted what to fix.",
      tone: "error",
    });
    focusFirstError();
  }, [store, toast]);

  const openPreview = useCallback(() => setPreviewMode("preview"), []);

  return (
    <InvoiceFormProvider store={store}>
      <main id="main" data-invoice-workspace className="flex-1 overflow-x-clip">
        <Container className="pt-6 md:pt-8 lg:pb-10">
          <div className="mx-auto w-full max-w-3xl lg:max-w-none">
            <WorkspaceHeading
              mode={saved ? "edit" : "create"}
              saveLabel={saved ? "Save changes" : "Save draft"}
              saving={saving}
              shareInvoiceId={saved?.id}
              onSave={saved ? saveRecord : save}
              onPreview={openPreview}
              onFinish={finish}
              onStartNew={startNew}
            />
            {saved ? null : <RestoredNotice onStartNew={startNew} />}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] lg:items-start xl:grid-cols-[minmax(0,12fr)_minmax(0,13fr)] xl:gap-8">
            <div
              data-invoice-form
              className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4 md:gap-5 lg:max-w-none"
            >
              <InvoiceForm />
              <MobilePreview onExpand={openPreview} className="lg:hidden" />
              <ActionBar onPreview={openPreview} onFinish={finish} className="lg:hidden" />
            </div>

            <aside
              aria-label="Live preview"
              className="hidden lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:block"
            >
              <PreviewPane onExpand={openPreview} />
            </aside>
          </div>
        </Container>
      </main>

      <FullPreviewDialog
        mode={previewMode}
        onClose={() => setPreviewMode(null)}
        onFinish={finish}
        onSave={saved ? saveRecord : save}
        saveLabel={saved ? "Save changes" : undefined}
      />
    </InvoiceFormProvider>
  );
}
