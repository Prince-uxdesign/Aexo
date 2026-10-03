"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  Button,
  Dialog,
  FormMessage,
  SegmentedControl,
  iconSize,
  iconStroke,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { createInvoice } from "@/features/invoices/actions";
import { InvoiceDocument } from "../components/invoice-document";
import { SaveInvoiceButton } from "../components/save-invoice-button";
import { usePreviewInvoice } from "../form/form-context";
import { getTemplate } from "../templates";

export type PreviewMode = "preview" | "finish";

type FullPreviewDialogProps = {
  mode: PreviewMode | null;
  onClose: () => void;
  onFinish: () => void;
  /** Keeps a draft on this device (creating a new invoice). */
  onSave: () => void;
  /** Set when editing a saved invoice: finishing saves that record, never a new one. */
  savedRecord?: { id: string; save: () => Promise<boolean>; saving: boolean };
};

/** A4 at 96 dpi: the size the page will print at. */
const ACTUAL_WIDTH = "w-[794px]";

/**
 * The invoice, large. Full screen on phones, a wide dialog from 640px.
 * On phones and tablets "Actual size" shows the page at print size and lets it
 * pan sideways inside the dialog, never the page behind it.
 *
 * In "finish" mode it is the last step. Print, PDF, email and share links live
 * on the saved invoice's page, so finishing means saving: a new invoice goes to
 * the account (or stays a device draft), an edited one saves and opens.
 */
export function FullPreviewDialog({
  mode,
  onClose,
  onFinish,
  onSave,
  savedRecord,
}: FullPreviewDialogProps) {
  const invoice = usePreviewInvoice();
  const router = useRouter();
  const { toast } = useToast();
  const [zoom, setZoom] = useState<"fit" | "actual">("fit");
  const { name } = getTemplate(invoice.template);
  const finishing = mode === "finish";
  const icon = { size: iconSize.md, strokeWidth: iconStroke };

  const saveToAccount = async () => {
    try {
      const id = await createInvoice(invoice);
      toast({ title: "Invoice saved.", tone: "success" });
      router.push(routes.invoice(id));
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Could not save your invoice. Try again.",
        tone: "error",
      });
    }
  };

  const saveAndOpen = async () => {
    if (!savedRecord) return;
    if (await savedRecord.save()) router.push(routes.invoice(savedRecord.id));
  };

  return (
    <Dialog
      open={mode !== null}
      onClose={onClose}
      size="xl"
      mobile="fullscreen"
      title={finishing ? "Your invoice is ready" : "Preview"}
      description={`${invoice.number} · ${name} template`}
      className="sm:max-h-[calc(100dvh-4rem)]"
      footer={
        finishing && savedRecord ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Back to editing
            </Button>
            <Button
              onClick={saveAndOpen}
              loading={savedRecord.saving}
              leadingIcon={<Save {...icon} />}
            >
              Save and open
            </Button>
          </>
        ) : finishing ? (
          <>
            <Button variant="secondary" onClick={onSave} leadingIcon={<Save {...icon} />}>
              Save draft
            </Button>
            <SaveInvoiceButton invoice={invoice} onSave={saveToAccount} />
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Back to editing
            </Button>
            <Button onClick={onFinish}>Finish invoice</Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {finishing ? (
          savedRecord ? (
            <FormMessage tone="info" title="Everything on your invoice is complete">
              Save your changes to print it, download a PDF, email it or share a link from the
              invoice page.
            </FormMessage>
          ) : (
            <FormMessage tone="info" title="Everything on your invoice is complete">
              Save it to your account to print it, download a PDF, email it or share a link. Or keep
              a draft on this device.
            </FormMessage>
          )
        ) : null}

        <SegmentedControl
          label="Zoom"
          value={zoom}
          onValueChange={setZoom}
          options={[
            { value: "fit", label: "Fit to screen" },
            { value: "actual", label: "Actual size" },
          ]}
          fullWidth={false}
          size="sm"
          className="lg:hidden"
        />

        <div
          tabIndex={zoom === "actual" ? 0 : undefined}
          role={zoom === "actual" ? "region" : undefined}
          aria-label={zoom === "actual" ? "Invoice at actual size, scrollable" : undefined}
          className={cn(
            "-mx-6 bg-surface-alt px-4 py-4 sm:-mx-8 sm:px-8 sm:py-6",
            zoom === "actual" && "overflow-x-auto overscroll-x-contain max-lg:px-4",
          )}
        >
          <div
            className={cn(
              "mx-auto",
              zoom === "actual"
                ? `${ACTUAL_WIDTH} max-lg:mx-0 lg:w-full lg:max-w-[794px]`
                : "max-w-[794px]",
            )}
          >
            <InvoiceDocument
              invoice={invoice}
              overflow="grow"
              label={`Invoice ${invoice.number}`}
              className="border border-border shadow-elevated"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
