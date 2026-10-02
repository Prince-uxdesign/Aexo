import type { Invoice } from "../model/types";

/**
 * The in-progress invoice, kept on this device.
 *
 * People create invoices without an account. When they choose to save, the
 * draft is stored here first so it survives sign-up, email confirmation and
 * sign-in, and the creator restores it when they come back. Storage can be
 * unavailable (private mode, blocked, full), so every call is safe to fail.
 */

const STORAGE_KEY = "aexo:invoice-draft";
const VERSION = 1;

type StoredDraft = { version: number; savedAt: string; invoice: Invoice };

export type SaveDraftResult = { ok: true; droppedLogo: boolean } | { ok: false };

export function saveDraft(invoice: Invoice): SaveDraftResult {
  const write = (value: Invoice) => {
    const payload: StoredDraft = {
      version: VERSION,
      savedAt: new Date().toISOString(),
      invoice: value,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  try {
    write(invoice);
    return { ok: true, droppedLogo: false };
  } catch {
    // Usually the quota: an uploaded logo (data URL) is by far the largest field.
    if (invoice.logoUrl) {
      try {
        write({ ...invoice, logoUrl: undefined });
        return { ok: true, droppedLogo: true };
      } catch {
        return { ok: false };
      }
    }
    return { ok: false };
  }
}

export function loadDraft(): { invoice: Invoice; savedAt: string } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (parsed.version !== VERSION || !isInvoiceLike(parsed.invoice)) return null;
    return { invoice: parsed.invoice, savedAt: parsed.savedAt ?? "" };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do: storage is unavailable, so there's nothing stored either.
  }
}

/** Minimal shape check; stored data may be from an older build or edited by hand. */
function isInvoiceLike(value: unknown): value is Invoice {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Invoice>;
  return (
    typeof candidate.number === "string" &&
    typeof candidate.currency === "string" &&
    Array.isArray(candidate.items) &&
    typeof candidate.sender === "object" &&
    typeof candidate.recipient === "object"
  );
}
