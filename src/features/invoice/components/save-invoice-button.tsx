"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  Button,
  Dialog,
  FormMessage,
  iconSize,
  iconStroke,
  type ButtonProps,
} from "@/components/ui";
import { routes } from "@/config/routes";
import { useAuth } from "@/lib/auth/use-auth";
import { withNext } from "@/lib/auth/redirects";
import { saveDraft } from "../draft/draft-storage";
import type { Invoice } from "../model/types";

type SaveInvoiceButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  invoice: Invoice;
  /** Called when a signed-in person saves. The invoice creator provides the real save. */
  onSave?: (invoice: Invoice) => void | Promise<void>;
  /** Where to come back to after signing up or in. Defaults to the invoice creator. */
  returnTo?: string;
};

/**
 * "Save invoice" that never blocks creation (guide §16).
 * - Signed in: saves straight away.
 * - Signed out: explains why an account is needed, keeps the invoice on this
 *   device, and brings the person back to it after they sign up or in.
 */
export function SaveInvoiceButton({
  invoice,
  onSave,
  returnTo = routes.createInvoice,
  ...buttonProps
}: SaveInvoiceButtonProps) {
  const router = useRouter();
  const { status, isSignedIn } = useAuth();
  const [gateOpen, setGateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);

  const handleSave = async () => {
    if (isSignedIn) {
      setSaving(true);
      try {
        await onSave?.(invoice);
      } finally {
        setSaving(false);
      }
      return;
    }
    setStorageFailed(false);
    setGateOpen(true);
  };

  const continueTo = (path: string) => {
    const result = saveDraft(invoice);
    if (!result.ok) {
      // Don't send them away if we couldn't keep their work.
      setStorageFailed(true);
      return;
    }
    const target = withNext(path, returnTo);
    router.push(`${target}${target.includes("?") ? "&" : "?"}from=save`);
  };

  return (
    <>
      <Button
        {...buttonProps}
        leadingIcon={<Save size={iconSize.md} strokeWidth={iconStroke} />}
        loading={saving || status === "loading"}
        onClick={handleSave}
      >
        Save invoice
      </Button>

      <Dialog
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        size="sm"
        title="Save your invoice"
        description="Create a free account to save and manage your invoices."
        footer={
          <>
            <Button variant="secondary" onClick={() => continueTo(routes.signIn)}>
              I have an account
            </Button>
            <Button onClick={() => continueTo(routes.signUp)}>Create free account</Button>
          </>
        }
      >
        {storageFailed ? (
          <FormMessage>
            We couldn&apos;t keep a copy of this invoice on your device, so we haven&apos;t left the
            page. Download it as a PDF first, or allow site storage and try again.
          </FormMessage>
        ) : (
          <p className="text-body text-muted">
            Your invoice stays on this device while you sign up and will be here when you come back.
            You can still download, print or share it without an account.
          </p>
        )}
      </Dialog>
    </>
  );
}
