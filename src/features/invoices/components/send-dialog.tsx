"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";
import {
  Button,
  Dialog,
  Field,
  FormMessage,
  Input,
  Textarea,
  iconSize,
  iconStroke,
  useToast,
} from "@/components/ui";
import {
  MAX_CLIENT_NAME_LENGTH,
  MAX_EMAIL_MESSAGE_LENGTH,
  MAX_EMAIL_SUBJECT_LENGTH,
  validateEmailCompose,
  type EmailFieldErrors,
} from "@/features/invoices/email";
import {
  fetchEmailHistory,
  fetchEmailPrefill,
  sendInvoiceEmail,
  type EmailHistoryEntry,
  type EmailPrefill,
} from "@/features/invoices/email-actions";

type SendDialogProps = {
  invoiceId: string;
  number: string;
  open: boolean;
  onClose: () => void;
};

function formatSentAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * "Send invoice": email the invoice to the client with the secure view link
 * included automatically. Opens prefilled (recipient, subject, message are all
 * editable), sends once per tap — the button locks while sending — and shows
 * a clear sent/failed state plus recent sends. Stacks full-width on phones.
 */
export function SendDialog({ invoiceId, number, open, onClose }: SendDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [to, setTo] = useState("");
  const [clientName, setClientName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [linkOn, setLinkOn] = useState(true);
  const [history, setHistory] = useState<EmailHistoryEntry[]>([]);
  const [errors, setErrors] = useState<EmailFieldErrors>({});
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const [sent, setSent] = useState<{ to: string; sentAt: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all([fetchEmailPrefill(invoiceId), fetchEmailHistory(invoiceId)]).then(
      ([prefill, sends]: [EmailPrefill | null, EmailHistoryEntry[]]) => {
        if (cancelled) return;
        if (!prefill) {
          setLoadError(true);
        } else {
          setTo(prefill.to);
          setClientName(prefill.clientName);
          setSubject(prefill.subject);
          setMessage(prefill.message);
          setLinkOn(prefill.linkOn);
          setHistory(sends);
        }
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [open, invoiceId]);

  // Reset for the next opening (event handler, so no cascading render).
  const handleClose = () => {
    setLoading(true);
    setLoadError(false);
    setErrors({});
    setSendError(null);
    setSent(null);
    setHistory([]);
    onClose();
  };

  const handleSend = () => {
    const fieldErrors = validateEmailCompose({ to, clientName, subject, message });
    setErrors(fieldErrors);
    setSendError(null);
    if (Object.keys(fieldErrors).length > 0) return;
    startSending(async () => {
      try {
        const result = await sendInvoiceEmail({
          id: invoiceId,
          to: to.trim(),
          clientName: clientName.trim(),
          subject: subject.trim(),
          message,
        });
        setSent(result);
        setLinkOn(true);
        toast({ title: `Invoice sent to ${result.to}.`, tone: "success" });
      } catch (error) {
        const title =
          error instanceof Error ? error.message : "Could not send the email. Try again.";
        // Recipient problems point at the email field; everything else is a banner.
        if (/email address/i.test(title)) {
          setErrors((previous) => ({ ...previous, to: title }));
        } else {
          setSendError(title);
        }
      }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      size="md"
      dismissible={!sending}
      title="Send invoice"
      description={`${number} — the client gets your message plus a secure link to view it. No account needed.`}
      footer={
        loading || loadError ? (
          <Button variant="secondary" onClick={handleClose}>
            Done
          </Button>
        ) : sent ? (
          <Button variant="secondary" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={handleClose} disabled={sending}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              loading={sending}
              leadingIcon={<Send size={iconSize.md} strokeWidth={iconStroke} aria-hidden />}
            >
              Send invoice
            </Button>
          </div>
        )
      }
    >
      {loading ? (
        <p role="status" className="text-body text-muted">
          Preparing the email…
        </p>
      ) : loadError ? (
        <FormMessage title="This invoice couldn't be found.">
          It may have been deleted. Close this and try again from your invoices.
        </FormMessage>
      ) : sent ? (
        <div className="flex flex-col items-start gap-2">
          <p className="inline-flex items-center gap-2 text-body text-ink">
            <CheckCircle2
              size={iconSize.md}
              strokeWidth={iconStroke}
              aria-hidden
              className="shrink-0 text-ink"
            />
            Sent to {sent.to} on {formatSentAt(sent.sentAt)}.
          </p>
          <p className="text-caption text-muted">
            The secure link is on, so the email always opens the current invoice.
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setSent(null);
              setSendError(null);
            }}
            className="self-start"
          >
            Send to someone else
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sendError ? <FormMessage title={sendError} /> : null}

          <Field label="Client email" required error={errors.to}>
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="client@example.com"
              value={to}
              disabled={sending}
              onChange={(event) => {
                setTo(event.target.value);
                if (errors.to) setErrors((previous) => ({ ...previous, to: undefined }));
              }}
              leading={<Mail size={iconSize.md} strokeWidth={iconStroke} aria-hidden />}
            />
          </Field>

          <Field label="Client name" error={errors.clientName}>
            <Input
              autoComplete="off"
              placeholder="Amara"
              value={clientName}
              maxLength={MAX_CLIENT_NAME_LENGTH}
              disabled={sending}
              onChange={(event) => setClientName(event.target.value)}
            />
          </Field>

          <Field label="Subject" required error={errors.subject}>
            <Input
              value={subject}
              maxLength={MAX_EMAIL_SUBJECT_LENGTH}
              disabled={sending}
              onChange={(event) => setSubject(event.target.value)}
            />
          </Field>

          <Field
            label="Message"
            hint="Your secure invoice link is added automatically below your message."
            error={errors.message}
          >
            <Textarea
              value={message}
              rows={7}
              maxLength={MAX_EMAIL_MESSAGE_LENGTH}
              disabled={sending}
              onChange={(event) => setMessage(event.target.value)}
            />
            <p className="text-caption text-muted tabular-nums">
              {message.length}/{MAX_EMAIL_MESSAGE_LENGTH}
            </p>
          </Field>

          {!linkOn ? (
            <p className="text-caption text-muted">
              Sending switches the secure link on for this invoice, so the email always works.
            </p>
          ) : null}

          {history.length > 0 ? (
            <div className="flex flex-col gap-1.5 border-t border-border pt-4">
              <p className="text-label text-ink">Recent sends</p>
              <ul className="flex flex-col gap-1">
                {history.slice(0, 3).map((entry, index) => (
                  <li
                    key={`${entry.sentAt}-${index}`}
                    className="text-caption break-words text-muted"
                  >
                    {entry.to || "Unknown recipient"} · {formatSentAt(entry.sentAt)} ·{" "}
                    {entry.status === "sent" ? "Sent" : "Failed"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
