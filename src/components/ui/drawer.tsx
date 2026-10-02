"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { announceModalChange } from "./top-layer";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible name, e.g. "Menu". */
  label: string;
  /** Full control of the content, including its own header and close button. */
  children: ReactNode;
  className?: string;
};

/**
 * Navigation panel on the native <dialog>: focus trap, Escape, focus return and
 * scroll lock come from the browser.
 * - Phones: full screen, so the menu feels like a native app menu.
 * - From 640px: a panel sliding in from the right, leaving the page visible.
 */
export function Drawer({ open, onClose, label, children, className }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    announceModalChange();
  }, [open]);

  useEffect(() => () => announceModalChange(), []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-0 h-dvh max-h-none w-full max-w-none flex-col overflow-y-auto overscroll-contain bg-canvas p-0 text-foreground open:flex",
        "sm:ml-auto sm:w-96 sm:border-l sm:border-border sm:shadow-elevated",
        // Phones: fade + small rise. From 640px: slide in from the right.
        "translate-y-2 opacity-0 transition-[opacity,translate,overlay,display] transition-discrete duration-200 ease-standard",
        "open:translate-y-0 open:opacity-100 starting:open:translate-y-2 starting:open:opacity-0",
        "sm:translate-x-8 sm:translate-y-0 sm:open:translate-x-0 sm:starting:open:translate-x-8 sm:starting:open:translate-y-0",
        className,
      )}
    >
      {children}
    </dialog>
  );
}
