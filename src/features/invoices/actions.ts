"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { computeTotals } from "@/features/invoice/model/totals";
import type { Invoice } from "@/features/invoice/model/types";
import { routes } from "@/config/routes";
import { isInvoiceStatus, rowToShareState, type InvoiceStatus, type ShareState } from "./model";

/**
 * Writes for saved invoices. Every action verifies the user first; RLS then
 * guarantees a user can only touch their own rows. No payment processing —
 * status is managed manually from the dashboard.
 */

type InvoiceSnapshot = {
  number: string;
  status: InvoiceStatus;
  currency: string;
  total: number;
  client_name: string;
  client_email: string;
  sender_name: string;
  issue_date: string | null;
  due_date: string | null;
  data: Invoice;
};

/* ------------------------------------------------ Server-side save guards
 * The form validates client-side, but Server Actions are the trust boundary:
 * anyone can call them directly. These caps keep one bad save from bloating
 * the database row, breaking the dashboard list, or breaking PDF/share
 * rendering. Lengths mirror the form's expectations; the calculation engine
 * (`computeTotals`) stays the single source for all money maths. */

const MAX_NUMBER_LENGTH = 64;
const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_TEXT_LENGTH = 5000;
const MAX_ITEMS = 100;
const MAX_ITEM_NAME_LENGTH = 200;
const MAX_ITEM_DESC_LENGTH = 1000;
/** ~512 KB image payload as a data URL (≈682 KB of base64 text). */
const MAX_LOGO_SRC_LENGTH = 700_000;

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Finite numbers only: NaN/Infinity become 0 (JSON would store them as null). */
function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * Normalize the invoice document before storage so every reader (editor,
 * preview, dashboard, detail, PDF/print, share page, email) sees safe values.
 * Invalid numbers become 0 and the totals engine clamps them from there;
 * oversized text is truncated; oversized payloads are rejected with a human
 * message instead of silently bloating the row.
 */
function sanitizeForSave(raw: Invoice): Invoice {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.items)) {
    throw new Error("That invoice couldn't be saved. Try again.");
  }
  if (raw.items.length > MAX_ITEMS) {
    throw new Error(`Invoices hold up to ${MAX_ITEMS} items. Remove some and try again.`);
  }
  const logo = (raw as { logo?: unknown }).logo as
    { src?: unknown; fileName?: unknown } | null | undefined;
  if (logo && typeof logo === "object") {
    const src = typeof logo.src === "string" ? logo.src : "";
    if (src.length > MAX_LOGO_SRC_LENGTH) {
      throw new Error("That logo is too large to save. Try a smaller image.");
    }
  }
  const items = raw.items.slice(0, MAX_ITEMS).map((item) => ({
    ...item,
    name: clip(item.name, MAX_ITEM_NAME_LENGTH),
    description:
      typeof item.description === "string"
        ? item.description.trim().slice(0, MAX_ITEM_DESC_LENGTH)
        : item.description,
    quantity: num(item.quantity),
    unitPrice: num(item.unitPrice),
  }));
  const party = (value: unknown) => {
    if (!value || typeof value !== "object") return {};
    const p = value as Record<string, unknown>;
    return {
      ...p,
      name: clip(p.name, MAX_NAME_LENGTH),
      contactName:
        typeof p.contactName === "string"
          ? p.contactName.trim().slice(0, MAX_NAME_LENGTH)
          : p.contactName,
      email: clip(p.email, MAX_EMAIL_LENGTH),
      phone: typeof p.phone === "string" ? p.phone.trim().slice(0, 64) : p.phone,
      website: typeof p.website === "string" ? p.website.trim().slice(0, 254) : p.website,
      taxId: typeof p.taxId === "string" ? p.taxId.trim().slice(0, 64) : p.taxId,
    };
  };
  return {
    ...raw,
    number: clip(raw.number, MAX_NUMBER_LENGTH),
    currency:
      typeof raw.currency === "string" && /^[A-Za-z]{3}$/.test(raw.currency.trim())
        ? raw.currency.trim().toUpperCase()
        : "USD",
    sender: party(raw.sender),
    recipient: party(raw.recipient),
    items,
    discount:
      raw.discount && typeof raw.discount === "object"
        ? { ...raw.discount, value: num(raw.discount.value) }
        : raw.discount,
    taxRate: raw.taxRate === undefined ? raw.taxRate : num(raw.taxRate),
    notes: typeof raw.notes === "string" ? raw.notes.slice(0, MAX_TEXT_LENGTH) : raw.notes,
  } as Invoice;
}

function snapshot(input: Invoice, status: InvoiceStatus): InvoiceSnapshot {
  const data = sanitizeForSave(input);
  const totals = computeTotals(data);
  const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const date = (value: unknown) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;
  return {
    number: clean(data.number).slice(0, MAX_NUMBER_LENGTH),
    status,
    currency: /^[A-Z]{3}$/.test(clean(data.currency).toUpperCase())
      ? clean(data.currency).toUpperCase()
      : "USD",
    total: totals.total,
    client_name: clean(data.recipient?.name).slice(0, MAX_NAME_LENGTH),
    client_email: clean(data.recipient?.email).toLowerCase().slice(0, MAX_EMAIL_LENGTH),
    sender_name: clean(data.sender?.name).slice(0, MAX_NAME_LENGTH),
    issue_date: date(data.issueDate),
    due_date: date(data.dueDate),
    data,
  };
}

function refresh() {
  revalidatePath(routes.dashboard);
  revalidatePath(routes.invoices);
}

function refreshShared(token: string | null) {
  if (token) revalidatePath(routes.sharedInvoice(token));
}

/** Save the current invoice as a draft. Returns the new id. */
export async function createInvoice(data: Invoice): Promise<string> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("invoices")
    .insert({ user_id: userId, ...snapshot(data, "draft") })
    .select("id")
    .single();
  if (error || !row) throw new Error("Could not save your invoice. Try again.");
  refresh();
  return row.id as string;
}

/** Overwrite a saved invoice. Status and sharing are preserved. */
export async function updateInvoice(id: string, data: Invoice): Promise<void> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("invoices")
    .select("status, share_token")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError || !existing) throw new Error("That invoice couldn't be found.");
  const status = isInvoiceStatus(existing.status) ? existing.status : "draft";
  const { error } = await supabase
    .from("invoices")
    .update(snapshot(data, status))
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Could not save your changes. Try again.");
  refresh();
  // The public link always shows the latest saved version.
  refreshShared(typeof existing.share_token === "string" ? existing.share_token : null);
}

/** Copy a saved invoice as a new draft. Returns the new id. */
export async function duplicateInvoice(id: string): Promise<string> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data: source, error: readError } = await supabase
    .from("invoices")
    .select("data")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError || !source) throw new Error("That invoice couldn't be found.");
  const copy = source.data as Invoice;
  // A new invoice needs its own identity: same business/client/items, but a
  // distinct number, draft status, fresh timestamps, and no sharing or history.
  const copyNumber =
    typeof copy.number === "string" && copy.number.trim() ? `${copy.number.trim()} (copy)` : "";
  const { data: row, error } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      ...snapshot({ ...copy, number: copyNumber }, "draft"),
    })
    .select("id")
    .single();
  if (error || !row) throw new Error("Could not duplicate your invoice. Try again.");
  refresh();
  return row.id as string;
}

/** Permanently delete a saved invoice. The UI confirms first. */
export async function deleteInvoice(id: string): Promise<void> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("invoices")
    .select("share_token")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  const { error } = await supabase.from("invoices").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error("Could not delete your invoice. Try again.");
  refresh();
  refreshShared(existing && typeof existing.share_token === "string" ? existing.share_token : null);
}

/** Change status manually. No automatic transitions, no payments. */
export async function setInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
  if (!isInvoiceStatus(status)) throw new Error("That status isn't valid.");
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Could not update the status. Try again.");
  refresh();
}

/* ---------------------------------------------------------- Management (Phase 17) */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanIds(ids: string[]): string[] {
  // Only plausible row ids reach the database: tampered values are skipped
  // instead of causing uuid syntax errors, and foreign ids still match nothing.
  return [...new Set(ids)].filter((id) => typeof id === "string" && UUID_PATTERN.test(id));
}

/** Archive one invoice: out of the working view, recoverable. Only the owner. */
export async function setInvoiceArchived(id: string, archived: boolean): Promise<void> {
  const count = await setInvoicesArchived([id], archived);
  if (count === 0) throw new Error("That invoice couldn't be found.");
}

/**
 * Archive or restore several invoices at once. Returns how many changed.
 * Unknown or foreign ids are silently skipped — a user can only ever affect
 * their own rows, and RLS enforces it again underneath.
 */
export async function setInvoicesArchived(ids: string[], archived: boolean): Promise<number> {
  const targets = cleanIds(ids);
  if (targets.length === 0) return 0;
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .update({ archived })
    .eq("user_id", userId)
    .in("id", targets)
    .select("id");
  if (error) throw new Error("Could not update those invoices. Try again.");
  refresh();
  return data?.length ?? 0;
}

/**
 * Permanently delete several invoices at once. Returns how many were removed.
 * The UI confirms first and names the count; there is no undo.
 */
export async function deleteInvoices(ids: string[]): Promise<number> {
  const targets = cleanIds(ids);
  if (targets.length === 0) return 0;
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  // Shared links must die with their invoices.
  const { data: shared } = await supabase
    .from("invoices")
    .select("share_token")
    .eq("user_id", userId)
    .in("id", targets);
  const { data, error } = await supabase
    .from("invoices")
    .delete()
    .eq("user_id", userId)
    .in("id", targets)
    .select("id");
  if (error) throw new Error("Could not delete those invoices. Try again.");
  refresh();
  for (const row of shared ?? []) {
    if (row && typeof row.share_token === "string") refreshShared(row.share_token);
  }
  return data?.length ?? 0;
}

/* ---------------------------------------------------------- Sharing (Phase 9) */

/** The owner's link state for one invoice. Null when the row is missing/foreign. */
export async function fetchShareState(id: string): Promise<ShareState | null> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("share_token, sharing_enabled")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToShareState(data);
}

/**
 * Switch the public link on or off. Returns the token so the UI can show the
 * link the moment sharing is enabled. Only the owner can change this.
 */
export async function setSharingEnabled(id: string, enabled: boolean): Promise<string> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .update({ sharing_enabled: enabled })
    .eq("id", id)
    .eq("user_id", userId)
    .select("share_token")
    .maybeSingle();
  if (error || !data || typeof data.share_token !== "string") {
    throw new Error("Could not update the share link. Try again.");
  }
  refresh();
  refreshShared(data.share_token);
  return data.share_token;
}

/**
 * Replace the share token with a fresh random one. The old link stops working
 * immediately — use it when a link was sent to the wrong person or posted
 * somewhere public. The on/off state is preserved: a disabled link stays
 * disabled, just under a new unguessable URL. Only the owner can do this.
 */
export async function rotateShareToken(id: string): Promise<string> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("invoices")
    .select("share_token")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError || !existing || typeof existing.share_token !== "string") {
    throw new Error("That invoice couldn't be found.");
  }
  const freshToken = randomUUID();
  const { error } = await supabase
    .from("invoices")
    .update({ share_token: freshToken })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Could not create a new link. Try again.");
  refresh();
  // The old URL must die everywhere it was cached; the new one goes live.
  refreshShared(existing.share_token);
  refreshShared(freshToken);
  return freshToken;
}
