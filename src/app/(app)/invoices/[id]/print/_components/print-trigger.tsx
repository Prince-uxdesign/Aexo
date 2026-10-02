"use client";

import { useEffect, useRef } from "react";
import { Printer } from "lucide-react";
import { Button, iconSize, iconStroke } from "@/components/ui";

/**
 * Opens the browser print dialog shortly after mount (fonts and layout get a
 * beat to settle), so Print / Download PDF land straight in the dialog where
 * the destination — printer or Save as PDF — is chosen. The manual button
 * covers blocked dialogs and repeat prints.
 */
export function PrintTrigger({ label = "Print" }: { label?: string }) {
  const printed = useRef(false);

  useEffect(() => {
    if (printed.current) return;
    printed.current = true;
    const timer = setTimeout(() => window.print(), 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Button
      variant="secondary"
      onClick={() => window.print()}
      leadingIcon={<Printer size={iconSize.md} strokeWidth={iconStroke} />}
    >
      {label}
    </Button>
  );
}
