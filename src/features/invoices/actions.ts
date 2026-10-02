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
  sender_name: string;
  issue_date: string | null;
  due_date: string | null;
  data: Invoice;
};

function snapshot(data: Invoice, status: InvoiceStatus): InvoiceSnapshot {
  if (!data || typeof data !== "object" || !Array.isArray(data.items)) {
    throw new Error("That invoice couldn't be saved. Try again.");
  }
  const totals = computeTotals(data);
  const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const date = (value: unknown) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;
  return {
    number: clean(data.number),
    status,
    currency: (clean(data.currency) || "USD").toUpperCase().slice(0, 3),
    total: totals.total,
    client_name: clean(data.recipient?.name),
    sender_name: clean(data.sender?.name),
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
  const { data: row, error } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      ...snapshot(source.data as Invoice, "draft"),
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
