"use client";

import { useEffect, useState } from "react";
import { Button, FormMessage, useToast } from "@/components/ui";
import { routes } from "@/config/routes";
import { SaveInvoiceButton } from "@/features/invoice/components/save-invoice-button";
import { clearDraft, loadDraft } from "@/features/invoice/draft/draft-storage";
import { sampleInvoice } from "@/features/invoice/model/sample";
import { Demo } from "./demo-helpers";

/**
 * Exercises the anonymous-save flow before the invoice creator exists.
 * Signed out: opens the account prompt, stores the draft and returns here.
 */
export function SaveGateDemo() {
  const { toast } = useToast();
  const [draftInfo, setDraftInfo] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    // Read once on mount: storage is browser-only.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftInfo(
      draft ? `${draft.invoice.number}, kept ${new Date(draft.savedAt).toLocaleString()}` : null,
    );
  }, []);

  return (
    <Demo title="Save gate: try it signed out, then signed in">
      <div className="flex flex-col gap-4">
        {draftInfo ? (
          <FormMessage tone="info" title="Draft restored from this device">
            {draftInfo}
          </FormMessage>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <SaveInvoiceButton
            invoice={sampleInvoice}
            returnTo={routes.foundation}
            onSave={() => {
              toast({ title: "Signed in: the creator will save here.", tone: "success" });
            }}
          />
          <Button
            variant="ghost"
            onClick={() => {
              clearDraft();
              setDraftInfo(null);
            }}
          >
            Clear stored draft
          </Button>
        </div>
      </div>
    </Demo>
  );
}
