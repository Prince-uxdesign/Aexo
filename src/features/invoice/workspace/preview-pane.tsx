"use client";

import { Maximize2 } from "lucide-react";
import { Button, iconSize, iconStroke } from "@/components/ui";
import { InvoiceDocument } from "../components/invoice-document";
import { usePreviewInvoice } from "../form/form-context";
import { getTemplate } from "../templates";

/**
 * Desktop preview (1024px+). Sticks beside the form and scrolls on its own,
 * so the document stays large and readable while the form scrolls past it.
 */
export function PreviewPane({ onExpand }: { onExpand: () => void }) {
  const invoice = usePreviewInvoice();
  const { name } = getTemplate(invoice.template);

  return (
    <div className="flex max-h-[calc(100dvh-var(--spacing-header)-3rem)] flex-col overflow-hidden rounded-xl border border-border bg-surface-alt">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border py-2 pr-2 pl-5">
        <p className="flex min-w-0 items-center gap-2 text-label text-ink">
          {/* Coral: the "live" indicator (guide §4: active indicators). */}
          <span aria-hidden className="size-1.5 shrink-0 rounded-pill bg-accent" />
          <span className="truncate">
            Live preview <span className="font-normal text-muted">· {name}</span>
          </span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          leadingIcon={<Maximize2 size={iconSize.sm} strokeWidth={iconStroke} />}
        >
          Full view
        </Button>
      </div>
      <div
        // Focusable so keyboard users can scroll a long invoice.
        tabIndex={0}
        role="region"
        aria-label="Invoice preview"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 xl:p-6"
      >
        <InvoiceDocument
          invoice={invoice}
          overflow="grow"
          label={`Preview of invoice ${invoice.number}`}
          className="shadow-elevated transition-opacity duration-150"
        />
      </div>
    </div>
  );
}
