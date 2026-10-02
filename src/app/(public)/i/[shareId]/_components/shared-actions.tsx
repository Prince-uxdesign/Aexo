"use client";

import { Download } from "lucide-react";
import { Button, iconSize, iconStroke } from "@/components/ui";

/**
 * Client-side actions on the public invoice page. The browser dialog chooses
 * the destination (printer or Save as PDF), so one button covers both — on a
 * phone this lands in the share sheet, where "Save to Files" keeps a PDF.
 * Never auto-prints: the recipient opened a link, not a print job.
 */
export function SharedInvoiceActions({ number }: { number: string }) {
  return (
    <div
      data-print-screen-only
      className="flex flex-col gap-2 sm:flex-row sm:justify-end print:hidden"
    >
      <Button
        variant="secondary"
        onClick={() => window.print()}
        aria-label={`Print or save invoice ${number} as PDF`}
        leadingIcon={<Download size={iconSize.md} strokeWidth={iconStroke} aria-hidden />}
      >
        Print / Save PDF
      </Button>
    </div>
  );
}
