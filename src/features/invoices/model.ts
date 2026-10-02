import type { BadgeTone } from "@/components/ui";
import type { Invoice } from "@/features/invoice/model/types";

/**
 * Saved invoices (Phase 7 dashboard). Pure data + list helpers: no React,
 * no Supabase client. Server Actions and queries live beside this file.
 */

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

/** Dots next to ink text (never color-only: the label always names the status). */
export const STATUS_TONES: Record<InvoiceStatus, BadgeTone> = {
  draft: "neutral",
  sent: "accent",
  paid: "success",
  overdue: "warning",
  cancelled: "neutral",
};

export function isInvoiceStatus(value: unknown): value is InvoiceStatus {
  return typeof value === "string" && (INVOICE_STATUSES as readonly string[]).includes(value);
}

/** One row of the dashboard list. Amounts come from the Phase 5 engine at save time. */
export type SavedInvoiceSummary = {
  id: string;
  number: string;
  status: InvoiceStatus;
  currency: string;
  total: number;
  clientName: string;
  senderName: string;
  issueDate: string | null;
  dueDate: string | null;
  updatedAt: string;
  createdAt: string;
};

export type SavedInvoice = SavedInvoiceSummary & {
  data: Invoice;
};

type InvoiceRow = {
  id: unknown;
  number: unknown;
  status: unknown;
  currency: unknown;
  total: unknown;
  client_name: unknown;
  sender_name: unknown;
  issue_date: unknown;
  due_date: unknown;
  updated_at: unknown;
  created_at: unknown;
  data?: unknown;
};

const text = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

function toTotal(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function toDate(value: unknown): string | null {
  return typeof value === "string" && value ? value.slice(0, 10) : null;
}

export function rowToSummary(row: InvoiceRow): SavedInvoiceSummary {
  return {
    id: text(row.id),
    number: text(row.number) || "Untitled invoice",
    status: isInvoiceStatus(row.status) ? row.status : "draft",
    currency: text(row.currency, "USD").toUpperCase() || "USD",
    total: toTotal(row.total),
    clientName: text(row.client_name),
    senderName: text(row.sender_name),
    issueDate: toDate(row.issue_date),
    dueDate: toDate(row.due_date),
    updatedAt: text(row.updated_at),
    createdAt: text(row.created_at),
  };
}

/** Full record for the editor. Falls back to an empty invoice shell, never throws. */
export function rowToSavedInvoice(row: InvoiceRow, fallback: Invoice): SavedInvoice {
  const data = (row.data && typeof row.data === "object" ? row.data : {}) as Partial<Invoice>;
  return {
    ...rowToSummary(row),
    data: {
      ...fallback,
      ...data,
      sender: data.sender ?? fallback.sender,
      recipient: data.recipient ?? fallback.recipient,
      items: Array.isArray(data.items) ? data.items : [],
    },
  };
}

export type StatusFilter = InvoiceStatus | "all";

export const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "paid", label: "Paid" },
  { id: "overdue", label: "Overdue" },
  { id: "cancelled", label: "Cancelled" },
];

/** Drafts needing attention: unfinished work, newest first, capped for the spotlight. */
export function selectAttentionDrafts(
  invoices: SavedInvoiceSummary[],
  limit = 3,
): SavedInvoiceSummary[] {
  return invoices.filter((invoice) => invoice.status === "draft").slice(0, limit);
}

/** Matches invoice number, client name or business (sender) name. */
export function matchesQuery(invoice: SavedInvoiceSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [invoice.number, invoice.clientName, invoice.senderName].some((field) =>
    field.toLowerCase().includes(q),
  );
}

export function filterByStatus(
  invoices: SavedInvoiceSummary[],
  status: StatusFilter,
): SavedInvoiceSummary[] {
  if (status === "all") return invoices;
  return invoices.filter((invoice) => invoice.status === status);
}
/** Counts per status group for the dashboard overview. */
export function statusCounts(invoices: SavedInvoiceSummary[]): Record<InvoiceStatus, number> {
  const counts: Record<InvoiceStatus, number> = {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
  };
  for (const invoice of invoices) counts[invoice.status] += 1;
  return counts;
}

/* ---------------------------------------------------------- Sharing (Phase 9) */

const SHARE_TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Tokens are random UUIDs: unguessable and unrelated to internal ids. */
export function isShareToken(value: unknown): value is string {
  return typeof value === "string" && SHARE_TOKEN_PATTERN.test(value);
}

/**
 * True when a Supabase error just means the Phase 15 RPC
 * (`get_shared_invoice`) isn't on the database yet, so the caller should fall
 * back to the Phase 9 direct-table read. Any other error is a genuine failure
 * and must surface instead of masquerading as a broken link.
 */
export function isShareRpcMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "PGRST202" || error.code === "42883") return true;
  return /could not find the function/i.test(error.message ?? "");
}

export type ShareState = {
  /** Null until the database columns exist (migration not applied): sharing unavailable. */
  token: string | null;
  enabled: boolean;
};

export function rowToShareState(row: {
  share_token?: unknown;
  sharing_enabled?: unknown;
}): ShareState {
  const token = row.share_token;
  return {
    token: isShareToken(token) ? token : null,
    enabled: row.sharing_enabled === true,
  };
}

/**
 * The public document. Deliberately narrow: the invoice content only.
 * Internal ids, user ids and account metadata never leave the server.
 */
export type SharedInvoice = {
  number: string;
  data: Invoice;
};

export function rowToSharedInvoice(row: {
  number?: unknown;
  data?: unknown;
}): SharedInvoice | null {
  if (!row.data || typeof row.data !== "object") return null;
  const data = row.data as Partial<Invoice>;
  if (!Array.isArray(data.items)) return null;
  return {
    number: typeof row.number === "string" && row.number ? row.number : "Invoice",
    data: data as Invoice,
  };
}
