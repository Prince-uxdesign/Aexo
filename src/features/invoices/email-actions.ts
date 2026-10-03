"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { computeTotals } from "@/features/invoice/model/totals";
import type { Invoice } from "@/features/invoice/model/types";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { routes } from "@/config/routes";
import { getEmailConfig, publicEnv } from "@/lib/env";
import {
  MAX_CLIENT_NAME_LENGTH,
  MAX_EMAIL_MESSAGE_LENGTH,
  MAX_EMAIL_SUBJECT_LENGTH,
  buildInvoiceEmailHtml,
  buildInvoiceEmailText,
  defaultEmailMessage,
  defaultEmailSubject,
  isValidEmailAddress,
  type InvoiceEmailFacts,
} from "./email";

/**
 * Email invoices (Phase 16). Every action verifies the owner first; RLS then
 * guarantees a user can only touch their own rows. Sending goes through
 * Resend's REST API (no SDK) and always includes the secure share link — the
 * access method this architecture already provides. There is no server-side
 * PDF renderer, so no attachment: the link opens the live invoice, which the
 * client can print or save as PDF themselves.
 */

function emailFacts(invoice: Invoice): InvoiceEmailFacts | null {
  if (!invoice || typeof invoice !== "object" || !Array.isArray(invoice.items)) return null;
  const { total } = computeTotals(invoice);
  return {
    number: typeof invoice.number === "string" && invoice.number ? invoice.number : "Invoice",
    senderName: invoice.sender?.name?.trim() ?? "",
    clientName: invoice.recipient?.name?.trim() ?? "",
    totalFormatted: formatMoney(total, invoice.currency || "USD", invoice.locale || "en-US"),
    dueText: invoice.dueDate
      ? `due on ${formatDate(invoice.dueDate, invoice.locale || "en-US", "short")}`
      : "with no due date set",
  };
}

export type EmailPrefill = {
  to: string;
  clientName: string;
  subject: string;
  message: string;
  /** Whether the secure link is already on. Sending switches it on if not. */
  linkOn: boolean;
  lastSentAt: string | null;
  lastRecipient: string;
  sendCount: number;
};

/** Compose defaults for one invoice. Null when the row is missing/foreign. */
export async function fetchEmailPrefill(id: string): Promise<EmailPrefill | null> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("data, sharing_enabled")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const facts = emailFacts(data.data as Invoice);
  if (!facts) return null;

  // History is advisory: a missing table (migration pending) means no history, not failure.
  let lastSentAt: string | null = null;
  let lastRecipient = "";
  let sendCount = 0;
  const history = await supabase
    .from("invoice_emails")
    .select("recipient_email, created_at")
    .eq("user_id", userId)
    .eq("invoice_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (!history.error && history.data) {
    sendCount = history.data.length;
    const latest = history.data[0] as { recipient_email?: unknown; created_at?: unknown };
    if (latest) {
      if (typeof latest.created_at === "string") lastSentAt = latest.created_at;
      if (typeof latest.recipient_email === "string") lastRecipient = latest.recipient_email;
    }
  }

  // Default to the last recipient — resends usually go to the same person.
  const to =
    lastRecipient ||
    (typeof (data.data as Invoice).recipient?.email === "string"
      ? ((data.data as Invoice).recipient?.email as string)
      : "");
  return {
    to,
    clientName: facts.clientName,
    subject: defaultEmailSubject(facts),
    message: defaultEmailMessage(facts),
    linkOn: data.sharing_enabled === true,
    lastSentAt,
    lastRecipient,
    sendCount,
  };
}

export type SendInvoiceEmailInput = {
  id: string;
  to: string;
  clientName: string;
  subject: string;
  message: string;
};

export type SendInvoiceEmailResult = {
  to: string;
  sentAt: string;
};

/** Best-effort history write: a sent email stays sent even if recording fails. */
async function recordSend(
  invoiceId: string,
  userId: string,
  input: { to: string; clientName: string; subject: string },
  status: "sent" | "failed",
  errorMessage: string | null,
) {
  try {
    const supabase = await createClient();
    await supabase.from("invoice_emails").insert({
      user_id: userId,
      invoice_id: invoiceId,
      recipient_email: input.to,
      recipient_name: input.clientName,
      subject: input.subject,
      status,
      error: errorMessage,
    });
  } catch {
    // History is advisory; the send result is what matters.
  }
}

/**
 * Send the invoice email. Validates everything server-side, switches the
 * secure link on when needed (the email links to it), and records the attempt.
 * Throws a human message on any failure — the dialog maps it to a field or a
 * banner. Duplicate clicks are blocked client-side; the action itself sends
 * exactly what it was given, once per call.
 */
export async function sendInvoiceEmail(
  input: SendInvoiceEmailInput,
): Promise<SendInvoiceEmailResult> {
  const userId = await requireUserId(routes.dashboard);
  const to = input.to.trim();
  const clientName = input.clientName.trim();
  const subject = input.subject.trim();
  const message = input.message;

  if (!to) throw new Error("Enter the client's email address.");
  if (!isValidEmailAddress(to)) {
    throw new Error("That email address doesn't look right. Check it and try again.");
  }
  if (clientName.length > MAX_CLIENT_NAME_LENGTH) {
    throw new Error(`Keep the name under ${MAX_CLIENT_NAME_LENGTH} characters.`);
  }
  if (!subject) throw new Error("Add a subject line.");
  if (subject.length > MAX_EMAIL_SUBJECT_LENGTH) {
    throw new Error(`Keep the subject under ${MAX_EMAIL_SUBJECT_LENGTH} characters.`);
  }
  if (message.length > MAX_EMAIL_MESSAGE_LENGTH) {
    throw new Error(`Keep the message under ${MAX_EMAIL_MESSAGE_LENGTH} characters.`);
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("invoices")
    .select("data, share_token, sharing_enabled")
    .eq("id", input.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !row) {
    throw new Error("That invoice couldn't be found. It may have been deleted.");
  }
  const facts = emailFacts(row.data as Invoice);
  if (!facts) throw new Error("That invoice couldn't be found. It may have been deleted.");

  let config: { apiKey: string; from: string };
  try {
    config = getEmailConfig();
  } catch {
    // Setup detail (env names) stays in the server log; the owner gets an
    // actionable message without internals.
    console.error("[email:config] email provider is not configured");
    throw new Error("Email sending isn't available right now. Try again later.");
  }

  // The email links to the secure page, so the link must be live. Sending an
  // email is an explicit sharing act: switch it on when it isn't already.
  let token = typeof row.share_token === "string" ? row.share_token : null;
  if (row.sharing_enabled !== true || !token) {
    const { data: updated, error: shareError } = await supabase
      .from("invoices")
      .update({ sharing_enabled: true })
      .eq("id", input.id)
      .eq("user_id", userId)
      .select("share_token")
      .maybeSingle();
    if (shareError || !updated || typeof updated.share_token !== "string") {
      throw new Error("Could not prepare the secure link. Try again.");
    }
    token = updated.share_token;
    revalidatePath(routes.sharedInvoice(token));
  }
  const viewUrl = `${publicEnv.siteUrl}${routes.sharedInvoice(token)}`;

  // Replies should reach the owner, not a no-reply address.
  let replyTo: string | undefined;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) replyTo = user.email;
  } catch {
    // Optional nicety; sending works without it.
  }

  let sendError: string | null = null;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [to],
        subject,
        html: buildInvoiceEmailHtml({
          message: message || defaultEmailMessage(facts),
          facts,
          viewUrl,
        }),
        text: buildInvoiceEmailText({
          message: message || defaultEmailMessage(facts),
          facts,
          viewUrl,
        }),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        sendError =
          "The email service rejected the request. Check RESEND_API_KEY and EMAIL_FROM, then try again.";
      } else if (response.status === 429) {
        sendError = "Too many emails at once. Wait a minute and try again.";
      } else {
        sendError = "The email service couldn't send this right now. Try again in a bit.";
      }
    }
  } catch {
    sendError = "Couldn't reach the email service. Check your connection and try again.";
  }

  const sentAt = new Date().toISOString();
  await recordSend(
    input.id,
    userId,
    { to, clientName, subject },
    sendError ? "failed" : "sent",
    sendError,
  );
  if (sendError) throw new Error(sendError);
  return { to, sentAt };
}

export type EmailHistoryEntry = {
  to: string;
  name: string;
  subject: string;
  status: "sent" | "failed";
  sentAt: string;
};

/** Latest send attempts for one invoice, newest first. Empty when none yet. */
export async function fetchEmailHistory(id: string): Promise<EmailHistoryEntry[]> {
  const userId = await requireUserId(routes.dashboard);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoice_emails")
    .select("recipient_email, recipient_name, subject, status, created_at")
    .eq("user_id", userId)
    .eq("invoice_id", id)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error || !data) return [];
  return data.map((row) => ({
    to: typeof row.recipient_email === "string" ? row.recipient_email : "",
    name: typeof row.recipient_name === "string" ? row.recipient_name : "",
    subject: typeof row.subject === "string" ? row.subject : "",
    status: row.status === "failed" ? "failed" : "sent",
    sentAt: typeof row.created_at === "string" ? row.created_at : "",
  }));
}
