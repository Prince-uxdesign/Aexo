"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Download, Pencil, Printer, Share2, Trash2 } from "lucide-react";
import { Button, Dialog, buttonStyles, iconSize, iconStroke, useToast } from "@/components/ui";
import { routes } from "@/config/routes";
import { deleteInvoice, duplicateInvoice } from "@/features/invoices/actions";
import { ShareDialog } from "@/features/invoices/components/share-dialog";

/**
 * Detail page actions. Phones get full-width stacked buttons; larger screens
 * get a wrapping row. Edit is a plain link; the rest run through transitions
 * with human feedback. Delete confirms first. Print and Download PDF open the
 * print-optimized view of this same invoice in a new tab, where the browser
 * dialog chooses the destination.
 */
export function DetailActions({ id, number }: { id: string; number: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [working, startWork] = useTransition();
  const icon = { size: iconSize.md, strokeWidth: iconStroke };

  const fail = (fallback: string) => (error: unknown) =>
    toast({
      title: error instanceof Error ? error.message : fallback,
      tone: "error",
    });

  const handleDuplicate = () => {
    startWork(async () => {
      try {
        const copyId = await duplicateInvoice(id);
        toast({ title: "Invoice duplicated as a draft.", tone: "success" });
        router.push(routes.invoiceEdit(copyId));
      } catch (error) {
        fail("Could not duplicate your invoice. Try again.")(error);
      }
    });
  };

  const handleDelete = () => {
    startWork(async () => {
      try {
        await deleteInvoice(id);
        toast({ title: "Invoice deleted.", tone: "success" });
        router.push(routes.dashboard);
      } catch (error) {
        fail("Could not delete your invoice. Try again.")(error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={routes.invoiceEdit(id)}
          aria-label={`Edit ${number}`}
          className={buttonStyles()}
        >
          <Pencil {...icon} aria-hidden />
          Edit invoice
        </Link>
        <Button
          variant="secondary"
          onClick={() => setShareOpen(true)}
          leadingIcon={<Share2 {...icon} />}
        >
          Share invoice
        </Button>
        <Button
          variant="secondary"
          onClick={handleDuplicate}
          loading={working}
          leadingIcon={<Copy {...icon} />}
        >
          Duplicate
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.open(routes.invoicePrint(id), "_blank", "noopener")}
          leadingIcon={<Printer {...icon} />}
        >
          Print
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.open(routes.invoicePrint(id), "_blank", "noopener")}
          leadingIcon={<Download {...icon} />}
        >
          Download PDF
        </Button>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Delete
        </Button>
      </div>

      <ShareDialog
        invoiceId={id}
        number={number}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        size="sm"
        title={`Delete ${number}?`}
        description="This permanently deletes the invoice. It can't be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="destructive-solid"
              loading={working}
              onClick={handleDelete}
              leadingIcon={<Trash2 {...icon} />}
            >
              Delete invoice
            </Button>
          </>
        }
      />
    </>
  );
}
