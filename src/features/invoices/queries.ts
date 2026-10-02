import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { getUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  isShareRpcMissing,
  isShareToken,
  rowToSavedInvoice,
  rowToSharedInvoice,
  rowToSummary,
  type SavedInvoice,
  type SavedInvoiceSummary,
  type SharedInvoice,
} from "./model";
import type { Invoice } from "@/features/invoice/model/types";

/**
 * Reads for saved invoices. RLS already limits every query to the caller's
 * own rows; the explicit user_id match keeps the index hot and the intent clear.
 */

async function userClient() {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createClient();
  return { userId, supabase };
}

/** Newest first, capped — the dashboard shows recent invoices, not an archive. */
export const listInvoices = cache(async (): Promise<SavedInvoiceSummary[]> => {
  await connection();
  const client = await userClient();
  if (!client) return [];
  const { userId, supabase } = client;
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, number, status, currency, total, client_name, sender_name, issue_date, due_date, updated_at, created_at",
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(200);
  // A missing table (migration not applied) must surface as an error with a
  // retry, never as a fake "no invoices" empty state.
  if (error) throw new Error("Could not load your invoices.");
  if (!data) return [];
  return data.map(rowToSummary);
});

/** Full record for the editor, or null (missing, or belongs to someone else). */
export const getInvoice = cache(async (id: string): Promise<SavedInvoice | null> => {
  await connection();
  const client = await userClient();
  if (!client) return null;
  const { userId, supabase } = client;
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToSavedInvoice(data, blankInvoiceFallback());
});

/** Only fills gaps in a stored document; a healthy row never needs it. */
function blankInvoiceFallback(): Invoice {
  return {
    number: "",
    issueDate: "",
    currency: "USD",
    locale: "en-US",
    sender: { name: "" },
    recipient: { name: "" },
    items: [],
    template: "classic",
  };
}

/* ---------------------------------------------------------- Sharing (Phase 9) */

/**
 * The public document behind /i/<token>. No authentication. The Phase 15 RPC
 * returns the document columns for one exact token only, so unrelated rows
 * are never reachable — not even listable. Null covers invalid, disabled,
 * deleted and never-shared links alike; genuine database failures throw so
 * the share route shows its error state instead of a fake broken link.
 */
export const getSharedInvoice = cache(async (token: string): Promise<SharedInvoice | null> => {
  await connection();
  if (!isShareToken(token)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_invoice", { p_token: token });
  if (!error) {
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return rowToSharedInvoice(row as { number?: unknown; data?: unknown });
  }
  // Databases without the Phase 15 migration fall back to the Phase 9 read.
  if (!isShareRpcMissing({ code: error.code, message: error.message })) {
    throw new Error("Could not load this invoice. Try again.");
  }
  const fallback = await supabase
    .from("invoices")
    .select("number, data")
    .eq("share_token", token)
    .eq("sharing_enabled", true)
    .maybeSingle();
  if (fallback.error) throw new Error("Could not load this invoice. Try again.");
  if (!fallback.data) return null;
  return rowToSharedInvoice(fallback.data);
});
