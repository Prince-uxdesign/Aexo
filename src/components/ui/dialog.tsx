"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { iconSize, iconStroke } from "./icon";
import { IconButton } from "./icon-button";
import { announceModalChange } from "./top-layer";

type DialogSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<DialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-2xl",
  /** Document previews: wide enough for an A4 page at full size. */
  xl: "sm:max-w-4xl",
};

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Action buttons. They stack full-width on phones and sit in a row from 640px. */
  footer?: ReactNode;
  size?: DialogSize;
  /**
   * Phone presentation. `sheet` (default) docks to the bottom and fits its
   * content: good for confirmations. `fullscreen` suits long forms.
   */
  mobile?: "sheet" | "fullscreen";
  /** Set false for flows that must not be dismissed by Escape or a backdrop click. */
  dismissible?: boolean;
  className?: string;
};

/**
 * Modal built on the native <dialog>. The browser provides focus trapping, Escape
 * handling, the top layer and returning focus to the trigger.
 *
 * Header and footer stay in place while long content scrolls between them, so
 * actions are always reachable on short phone screens. From 640px it is a
 * centered dialog.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  mobile = "sheet",
  dismissible = true,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    announceModalChange();
  }, [open]);

  // If the dialog unmounts while open, let listeners know it's gone.
  useEffect(() => () => announceModalChange(), []);

  const fullscreen = mobile === "fullscreen";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape: keep `open` controlled by the parent instead of letting the browser close it.
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      // A click on the <dialog> element itself (not its content) is a backdrop click.
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-0 w-full max-w-none flex-col overflow-hidden bg-surface p-0 text-foreground shadow-elevated open:flex",
        // Phone
        fullscreen
          ? "h-dvh max-h-none rounded-none"
          : "mt-auto max-h-[calc(100dvh-1.5rem)] rounded-t-xl",
        // From 640px: centered
        "sm:m-auto sm:h-auto sm:max-h-[min(calc(100dvh-4rem),48rem)] sm:w-[calc(100%-2*var(--spacing-gutter))] sm:rounded-xl",
        sizes[size],
        // Open/close transition (§19: short opacity + translate).
        "translate-y-4 opacity-0 transition-[opacity,translate,overlay,display] transition-discrete duration-200 ease-standard",
        "open:translate-y-0 open:opacity-100 starting:open:translate-y-4 starting:open:opacity-0",
        className,
      )}
    >
      {fullscreen ? null : (
        // Grab handle: signals a sheet on phones. Decorative only.
        <span
          aria-hidden
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-pill bg-border-strong sm:hidden"
        />
      )}

      <header
        className={cn(
          "flex shrink-0 items-start justify-between gap-4 px-6 pb-4 sm:px-8 sm:pt-8",
          fullscreen
            ? "border-b border-border pt-[max(1rem,env(safe-area-inset-top))] sm:border-0"
            : "pt-4",
        )}
      >
        <div className="flex min-w-0 flex-col gap-1.5 pt-2">
          <h2 id={titleId} className="text-h3 break-words text-ink">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="text-body text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {dismissible ? (
          <IconButton
            label="Close"
            icon={<X size={iconSize.md} strokeWidth={iconStroke} />}
            onClick={onClose}
            className="-mt-1 -mr-2"
          />
        ) : null}
      </header>

      {children ? (
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2 sm:px-8",
            // The full-screen header has a divider; give content room below it.
            fullscreen && "pt-6 sm:pt-2",
          )}
        >
          {children}
        </div>
      ) : null}

      {footer ? (
        <footer className="flex shrink-0 flex-col-reverse gap-3 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-8 sm:pb-8 [&>*]:w-full sm:[&>*]:w-auto">
          {footer}
        </footer>
      ) : (
        <div className="h-[max(1.5rem,env(safe-area-inset-bottom))] shrink-0 sm:h-8" />
      )}
    </dialog>
  );
}
