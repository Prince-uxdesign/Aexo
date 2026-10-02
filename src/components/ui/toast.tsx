"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { iconSize, iconStroke } from "./icon";
import { isModalOpen, MODAL_CHANGE } from "./top-layer";

export type ToastTone = "default" | "success" | "error";

export type ToastOptions = {
  /** Short and human: "Invoice saved.", "Could not save invoice. Try again." */
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before it hides. Errors stay a little longer by default. */
  duration?: number;
};

type ToastItem = ToastOptions & { id: number };

type ToastContextValue = {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

/** Mount once in the root layout. Components then call `useToast()`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current, { ...options, id }].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  // While a modal dialog is open, everything outside it is inert: a toast would
  // cover the dialog's buttons and couldn't be dismissed or announced. So toasts
  // wait until the modal closes, then show with their full duration (their
  // timers start when they render). Feedback inside a dialog should be inline.
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    const sync = () => setModalOpen(isModalOpen());
    document.addEventListener(MODAL_CHANGE, sync);
    return () => document.removeEventListener(MODAL_CHANGE, sync);
  }, []);

  // The region sits in the top layer (a manual popover) so it stays above
  // anything with a z-index and above earlier popovers.
  const regionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const region = regionRef.current;
    if (region && !region.matches(":popover-open")) region.showPopover();
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* The live region is always mounted so new toasts are announced reliably. */}
      <section
        ref={regionRef}
        popover="manual"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 top-auto bottom-0 flex w-full max-w-none justify-center px-gutter pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end"
      >
        <ol
          aria-live="polite"
          className="flex w-full flex-col gap-2 sm:w-auto sm:max-w-sm sm:min-w-80"
        >
          {modalOpen
            ? null
            : toasts.map((item) => <ToastCard key={item.id} item={item} onDismiss={dismiss} />)}
        </ol>
      </section>
    </ToastContext.Provider>
  );
}

const toneIcon: Record<ToastTone, ReactNode> = {
  default: null,
  success: (
    <CircleCheck size={iconSize.md} strokeWidth={iconStroke} className="shrink-0 text-success" />
  ),
  error: (
    <CircleAlert size={iconSize.md} strokeWidth={iconStroke} className="shrink-0 text-error" />
  ),
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const tone = item.tone ?? "default";
  const duration = item.duration ?? (tone === "error" ? ERROR_DURATION : DEFAULT_DURATION);

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), duration);
    return () => clearTimeout(timer);
  }, [item.id, duration, onDismiss]);

  return (
    <li
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg bg-ink py-3 pr-2 pl-4 text-canvas shadow-elevated",
        "transition-[opacity,translate] duration-200 ease-standard starting:translate-y-2 starting:opacity-0",
      )}
    >
      {toneIcon[tone] ? <span className="pt-0.5">{toneIcon[tone]}</span> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
        <p className="text-label">{item.title}</p>
        {item.description ? (
          <p className="text-caption text-canvas/75">{item.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="-my-1 flex size-8 shrink-0 items-center justify-center rounded-pill text-canvas/75 hover:bg-canvas/10 hover:text-canvas focus-visible:outline-canvas pointer-coarse:size-11"
      >
        <X size={iconSize.sm} strokeWidth={iconStroke} />
      </button>
    </li>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}
