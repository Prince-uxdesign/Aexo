"use client";

import { useState } from "react";
import { Eye, FilePlus2, MoreHorizontal, Save, Share2 } from "lucide-react";
import { Button, Dialog, IconButton, Menu, MenuItem, iconSize, iconStroke } from "@/components/ui";
import { ShareDialog } from "@/features/invoices/components/share-dialog";
import { useFormState, useFormValue } from "../form/form-context";

type WorkspaceHeadingProps = {
  onSave: () => void;
  onPreview: () => void;
  onFinish: () => void;
  onStartNew: () => void;
  /** "edit" is the dashboard editor: account save, no device wording, no reset. */
  mode?: "create" | "edit";
  saveLabel?: string;
  saving?: boolean;
  /** Saved record id: shows the Share button (edit mode only). */
  shareInvoiceId?: string;
};

const icon = { size: iconSize.md, strokeWidth: iconStroke };

function SaveStatus({ mode }: { mode: "create" | "edit" }) {
  const ready = useFormState((s) => s.ready);
  const savedAt = useFormState((s) => s.savedAt);
  const dirty = useFormState((s) => s.revision !== s.savedRevision);
  const autoSave = useFormState((s) => s.autoSave.status);

  let text = mode === "create" ? "Works without an account." : "Editing your saved invoice.";
  if (ready && autoSave === "saving") {
    text = "Saving…";
  } else if (ready && autoSave === "error") {
    text =
      mode === "create"
        ? "Couldn't save on this device. Your work is still here."
        : "Couldn't save. We'll retry — your work is still here.";
  } else if (ready && savedAt && !dirty) {
    const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
      new Date(savedAt),
    );
    text = mode === "create" ? `Saved on this device at ${time}.` : `Saved at ${time}.`;
  } else if (ready && savedAt && dirty) {
    text = "Unsaved changes.";
  } else if (ready && !savedAt && mode === "edit") {
    text = "Unsaved changes.";
  }

  return (
    <p role="status" className="text-label font-normal text-muted">
      {text}
    </p>
  );
}

/**
 * Page title, save status and actions. From 1024px all actions sit here; on
 * phones and tablets Preview and Finish move to the action bar at the bottom.
 */
export function WorkspaceHeading({
  onSave,
  onPreview,
  onFinish,
  onStartNew,
  mode = "create",
  saveLabel = "Save draft",
  saving = false,
  shareInvoiceId,
}: WorkspaceHeadingProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const invoiceNumber = useFormValue((v) => v.number);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-h2 text-ink">{mode === "edit" ? "Edit invoice" : "New invoice"}</h1>
        <SaveStatus mode={mode} />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onSave}
          loading={saving}
          leadingIcon={<Save {...icon} />}
          className="lg:min-h-11 lg:px-5"
        >
          {saveLabel}
        </Button>
        {mode === "edit" && shareInvoiceId ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShareOpen(true)}
            leadingIcon={<Share2 {...icon} />}
            className="lg:min-h-11 lg:px-5"
          >
            Share
          </Button>
        ) : null}
        <Button
          variant="secondary"
          onClick={onPreview}
          leadingIcon={<Eye {...icon} />}
          className="hidden lg:inline-flex"
        >
          Preview
        </Button>
        <Button onClick={onFinish} className="hidden lg:inline-flex">
          Finish invoice
        </Button>
        {mode === "create" ? (
          <Menu
            label="More actions"
            align="end"
            trigger={<IconButton label="More actions" icon={<MoreHorizontal {...icon} />} />}
          >
            <MenuItem icon={<FilePlus2 {...icon} />} onSelect={() => setConfirmOpen(true)}>
              Start a new invoice
            </MenuItem>
          </Menu>
        ) : null}
      </div>

      {mode === "create" ? (
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          size="sm"
          title="Start a new invoice?"
          description="This clears the form and the draft saved on this device. It can't be undone."
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Keep editing
              </Button>
              <Button
                variant="destructive-solid"
                onClick={() => {
                  setConfirmOpen(false);
                  onStartNew();
                }}
              >
                Start new
              </Button>
            </>
          }
        />
      ) : null}

      {mode === "edit" && shareInvoiceId ? (
        <ShareDialog
          invoiceId={shareInvoiceId}
          number={invoiceNumber.trim() || "Invoice"}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </div>
  );
}
