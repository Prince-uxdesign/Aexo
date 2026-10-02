"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  iconSize,
  iconStroke,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import {
  INVOICE_STATUSES,
  STATUS_LABELS,
  STATUS_TONES,
  type InvoiceStatus,
  type SavedInvoiceSummary,
} from "@/features/invoices/model";
import { deleteInvoice, duplicateInvoice, setInvoiceStatus } from "@/features/invoices/actions";
import { ShareDialog } from "@/features/invoices/components/share-dialog";

const icon = { size: iconSize.md, strokeWidth: iconStroke };

/** Static classes: Tailwind only compiles class names it can see. */
const dotClass: Record<InvoiceStatus, string> = {
  draft: "bg-muted",
  sent: "bg-accent",
  paid: "bg-success",
  overdue: "bg-warning",
  cancelled: "bg-muted",
};

function useAction() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const run = (task: () => Promise<unknown>, messages: { ok: string }) => {
    start(async () => {
      try {
        await task();
        router.refresh();
        toast({ title: messages.ok, tone: "success" });
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : "Something went wrong. Try again.",
          tone: "error",
        });
      }
    });
  };

  return { pending, run };
}

/** The status badge is also the control that changes the status. */
export function StatusMenu({ invoice }: { invoice: SavedInvoiceSummary }) {
  const { pending, run } = useAction();

  return (
    <Menu
      label={`Change status for ${invoice.number}`}
      align="end"
      trigger={
        <button
          type="button"
          aria-label={`Status: ${STATUS_LABELS[invoice.status]}. Change status for ${invoice.number}.`}
          className="inline-flex min-h-11 items-center gap-1 rounded-pill border border-border bg-surface-alt pr-1.5 pl-2.5 text-caption font-medium text-ink transition-colors duration-150 hover:border-border-strong sm:min-h-6"
        >
          <Badge tone={STATUS_TONES[invoice.status]} className="border-0 bg-transparent p-0">
            {STATUS_LABELS[invoice.status]}
          </Badge>
          <ChevronDown
            size={iconSize.sm}
            strokeWidth={iconStroke}
            aria-hidden
            className="text-muted"
          />
        </button>
      }
    >
      {INVOICE_STATUSES.map((status) => {
        const current = status === invoice.status;
        return (
          <MenuItem
            key={status}
            disabled={pending}
            onSelect={() =>
              !current &&
              run(() => setInvoiceStatus(invoice.id, status), {
                ok: `Marked as ${STATUS_LABELS[status].toLowerCase()}.`,
              })
            }
            icon={<span aria-hidden className={cn("size-1.5 rounded-pill", dotClass[status])} />}
          >
            <span className="flex items-center justify-between gap-4">
              {STATUS_LABELS[status]}
              {current ? (
                <Check size={iconSize.sm} strokeWidth={iconStroke} aria-label="Current status" />
              ) : null}
            </span>
          </MenuItem>
        );
      })}
    </Menu>
  );
}

export function InvoiceMenu({ invoice }: { invoice: SavedInvoiceSummary }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleting, startDelete] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startDelete(async () => {
      try {
        await deleteInvoice(invoice.id);
        setConfirmOpen(false);
        router.refresh();
        toast({ title: "Invoice deleted.", tone: "success" });
      } catch (error) {
        toast({
          title:
            error instanceof Error ? error.message : "Could not delete your invoice. Try again.",
          tone: "error",
        });
      }
    });
  };

  return (
    <>
      <Menu
        label={`Actions for ${invoice.number}`}
        align="end"
        trigger={
          <IconButton label={`Actions for ${invoice.number}`} icon={<MoreHorizontal {...icon} />} />
        }
      >
        <MenuItem
          icon={<Eye {...icon} />}
          disabled={pending}
          onSelect={() => router.push(routes.invoice(invoice.id))}
        >
          Open
        </MenuItem>
        <MenuItem
          icon={<Pencil {...icon} />}
          disabled={pending}
          onSelect={() => router.push(routes.invoiceEdit(invoice.id))}
        >
          Edit
        </MenuItem>
        <MenuItem
          icon={<Copy {...icon} />}
          disabled={pending}
          onSelect={() =>
            run(() => duplicateInvoice(invoice.id), { ok: "Invoice duplicated as a draft." })
          }
        >
          Duplicate
        </MenuItem>
        <MenuItem
          icon={<Share2 {...icon} />}
          disabled={pending}
          onSelect={() => setShareOpen(true)}
        >
          Share invoice
        </MenuItem>
        <MenuItem icon={<Trash2 {...icon} />} destructive onSelect={() => setConfirmOpen(true)}>
          Delete
        </MenuItem>
      </Menu>

      <ShareDialog
        invoiceId={invoice.id}
        number={invoice.number}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        size="sm"
        title={`Delete ${invoice.number}?`}
        description="This permanently deletes the invoice. It can't be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive-solid" loading={deleting} onClick={handleDelete}>
              Delete invoice
            </Button>
          </>
        }
      />
    </>
  );
}
