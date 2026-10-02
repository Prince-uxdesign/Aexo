"use client";

import { useId, useState } from "react";
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
  onSave: () => void;
  saveLabel?: string;
};

/** A4 at 96 dpi: the size the page will print at. */
const ACTUAL_WIDTH = "w-[794px]";

/**
 * The invoice, large. Full screen on phones, a wide dialog from 640px.
 * On phones and tablets "Actual size" shows the page at print size and lets it
 * pan sideways inside the dialog, never the page behind it.
 *
 * In "finish" mode it is the last step. Download, print and send are not built
 * yet, and the dialog says so plainly instead of offering buttons that do nothing.
 */
export function FullPreviewDialog({
  mode,
  onClose,
  onFinish,
  onSave,
  saveLabel = "Save draft",
}: FullPreviewDialogProps) {
  const invoice = usePreviewInvoice();
  const router = useRouter();
  const { toast } = useToast();
  const [zoom, setZoom] = useState<"fit" | "actual">("fit");
  const comingSoonId = useId();
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
        finishing ? (
          <>
            <Button variant="secondary" onClick={onSave} leadingIcon={<Save {...icon} />}>
              {saveLabel}
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
          <div id={comingSoonId}>
            <FormMessage tone="info" title="Download, print and send are coming next">
              Everything on your invoice is complete. Save it to your dashboard to keep it in your
              account, or keep a draft on this device.
            </FormMessage>
          </div>
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
