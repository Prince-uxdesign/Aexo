/**
 * Email invoices (Phase 16). Pure helpers: validation, sensible defaults and
 * the HTML email template. No React, no Supabase, no provider calls — sending
 * lives in `email-actions.ts`, the dialog in `components/send-dialog.tsx`.
 */

export const MAX_CLIENT_NAME_LENGTH = 120;
export const MAX_EMAIL_SUBJECT_LENGTH = 150;
export const MAX_EMAIL_MESSAGE_LENGTH = 2000;

/** Deliberately loose, like auth validation: the mailbox is the real check. */
export function isValidEmailAddress(value: string): boolean {
  const email = value.trim();
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type EmailComposeInput = {
  to: string;
  clientName: string;
  subject: string;
  message: string;
};

export type EmailFieldErrors = Partial<Record<"to" | "clientName" | "subject" | "message", string>>;

/** Human messages for the compose form, keyed by field. Empty means valid. */
export function validateEmailCompose(input: EmailComposeInput): EmailFieldErrors {
  const errors: EmailFieldErrors = {};
  const to = input.to.trim();
  if (!to) {
    errors.to = "Enter the client's email address.";
  } else if (!isValidEmailAddress(to)) {
    errors.to = "That email address doesn't look right. Check it and try again.";
  }
  if (input.clientName.trim().length > MAX_CLIENT_NAME_LENGTH) {
    errors.clientName = `Keep the name under ${MAX_CLIENT_NAME_LENGTH} characters.`;
  }
  if (!input.subject.trim()) {
    errors.subject = "Add a subject line.";
  } else if (input.subject.trim().length > MAX_EMAIL_SUBJECT_LENGTH) {
    errors.subject = `Keep the subject under ${MAX_EMAIL_SUBJECT_LENGTH} characters.`;
  }
  if (input.message.length > MAX_EMAIL_MESSAGE_LENGTH) {
    errors.message = `Keep the message under ${MAX_EMAIL_MESSAGE_LENGTH} characters.`;
  }
  return errors;
}

export type InvoiceEmailFacts = {
  number: string;
  senderName: string;
  clientName: string;
  totalFormatted: string;
  /** e.g. "due on Oct 30, 2026" or "with no due date set". */
  dueText: string;
};

/** Sensible default subject, e.g. "Invoice INV-0007 from Lumen Studio". */
export function defaultEmailSubject(
  facts: Pick<InvoiceEmailFacts, "number" | "senderName">,
): string {
  const sender = facts.senderName || "your invoice";
  return `Invoice ${facts.number} from ${sender}`.slice(0, MAX_EMAIL_SUBJECT_LENGTH);
}

/**
 * A short, human default message. Plain and professional — never promotional.
 * The secure view link is appended by the email template itself, so the user
 * never has to manage URLs in the message.
 */
export function defaultEmailMessage(facts: InvoiceEmailFacts): string {
  const greeting = facts.clientName ? `Hi ${facts.clientName},` : "Hi,";
  const signoff = facts.senderName ? `\n\nThanks,\n${facts.senderName}` : "\n\nThanks!";
  return (
    `${greeting}\n\n` +
    `Here's invoice ${facts.number} for ${facts.totalFormatted}, ${facts.dueText}. ` +
    `You can view it any time with the link below.` +
    `\n\nLet me know if anything looks off.` +
    signoff
  );
}

/** Escape user content before it goes into the HTML email. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export type InvoiceEmailTemplateInput = {
  /** The personal message, plain text with blank lines between paragraphs. */
  message: string;
  facts: InvoiceEmailFacts;
  /** The secure public invoice URL. */
  viewUrl: string;
};

/**
 * The client-facing email. Table layout with inline styles for mail clients.
 * Contains only invoice content: no ids, no account data, no app navigation.
 */
export function buildInvoiceEmailHtml({
  message,
  facts,
  viewUrl,
}: InvoiceEmailTemplateInput): string {
  const paragraphs = message
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p style="margin:0 0 16px;">${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
    .join("");
  const safeUrl = escapeHtml(viewUrl);
  const sender = escapeHtml(facts.senderName || "Aexo");

  return (
    `<!doctype html><html><body style="margin:0;padding:0;background-color:#f7f2ed;">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f2ed;padding:24px 12px;">` +
    `<tr><td align="center">` +
    `<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;padding:32px;">` +
    `<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#252522;">` +
    paragraphs +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;background-color:#f7f2ed;border-radius:8px;">` +
    `<tr><td style="padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#252522;">` +
    `<strong>Invoice ${escapeHtml(facts.number)}</strong><br>` +
    `Amount due: <strong>${escapeHtml(facts.totalFormatted)}</strong><br>` +
    `<span style="color:#706f6c;">${escapeHtml(facts.dueText.replace(/^./, (c) => c.toUpperCase()))}</span>` +
    `</td></tr></table>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>` +
    `<td style="border-radius:9999px;background-color:#252522;">` +
    `<a href="${safeUrl}" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#ffffff;text-decoration:none;">View invoice</a>` +
    `</td></tr></table>` +
    `<p style="margin:0 0 8px;font-size:13px;color:#706f6c;">Or open this link:</p>` +
    `<p style="margin:0;font-size:13px;word-break:break-all;"><a href="${safeUrl}" style="color:#252522;">${safeUrl}</a></p>` +
    `</td></tr></table>` +
    `<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#706f6c;">Sent with Aexo by ${sender}.</p>` +
    `</td></tr></table>` +
    `</td></tr></table></body></html>`
  );
}

/** Plain-text twin of the HTML email for clients that prefer it. */
export function buildInvoiceEmailText({
  message,
  facts,
  viewUrl,
}: InvoiceEmailTemplateInput): string {
  return (
    `${message.trim()}\n\n` +
    `---\nInvoice ${facts.number}\nAmount due: ${facts.totalFormatted}\n${facts.dueText}\n\n` +
    `View invoice: ${viewUrl}\n\n` +
    `Sent with Aexo by ${facts.senderName || "your sender"}.`
  );
}
