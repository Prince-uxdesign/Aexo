"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Copy, Link2, RefreshCw } from "lucide-react";
import {
  Button,
  Dialog,
  FormMessage,
  Input,
  Toggle,
  iconSize,
  iconStroke,
  useToast,
} from "@/components/ui";
import { routes } from "@/config/routes";
import { publicEnv } from "@/lib/env";
import { fetchShareState, rotateShareToken, setSharingEnabled } from "@/features/invoices/actions";

type ShareDialogProps = {
  invoiceId: string;
  number: string;
  open: boolean;
  onClose: () => void;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable (permissions, insecure context): fall back to selection.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * "Share invoice": the owner switches the public link on, copies it and sends
 * it anywhere. Anyone with the link sees the live invoice — no account needed.
 * Switching off disables the URL immediately. Used by the dashboard menu and
 * the saved-invoice editor; the dialog stacks full-width actions on phones.
 */
export function ShareDialog({ invoiceId, number, open, onClose }: ShareDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [saving, startSaving] = useTransition();
  const [copied, setCopied] = useState(false);
  const [confirmingNew, setConfirmingNew] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchShareState(invoiceId).then(
      (state) => {
        if (!state || !state.token) {
          // Missing columns (old database) or a foreign row: sharing unavailable.
          setLoadError(true);
        } else {
          setToken(state.token);
          setEnabled(state.enabled);
        }
        setLoading(false);
      },
      () => {
        setLoadError(true);
        setLoading(false);
      },
    );
  }, [open, invoiceId]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const url = token ? `${publicEnv.siteUrl}${routes.sharedInvoice(token)}` : "";

  // Reset for the next opening (event handler, so no cascading render).
  const handleClose = () => {
    setLoading(true);
    setLoadError(false);
    setCopied(false);
    setConfirmingNew(false);
    onClose();
  };

  const handleToggle = (next: boolean) => {
    startSaving(async () => {
      try {
        const freshToken = await setSharingEnabled(invoiceId, next);
        setToken(freshToken);
        setEnabled(next);
        toast({
          title: next
            ? "Sharing is on. Copy the link to send it."
            : "Sharing is off. The link no longer works.",
          tone: "success",
        });
      } catch (error) {
        toast({
          title:
            error instanceof Error ? error.message : "Could not update the share link. Try again.",
          tone: "error",
        });
      }
    });
  };

  const handleCopy = async () => {
    if (!url) return;
    if (await copyText(url)) {
      setCopied(true);
      toast({ title: "Link copied. Send it anywhere.", tone: "success" });
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } else {
      toast({ title: "Could not copy. Long-press the link to copy it manually.", tone: "error" });
    }
  };

  const handleNewLink = () => {
    startSaving(async () => {
      try {
        const freshToken = await rotateShareToken(invoiceId);
        setToken(freshToken);
        setCopied(false);
        setConfirmingNew(false);
        toast({
          title: enabled
            ? "New link created. The old link no longer works."
            : "New link created. Switch sharing on to use it.",
          tone: "success",
        });
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : "Could not create a new link. Try again.",
          tone: "error",
        });
      }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      size="sm"
      title="Share invoice"
      description={`${number} — anyone with the link can view it. No account needed.`}
      footer={
        <Button variant="secondary" onClick={handleClose}>
          Done
        </Button>
      }
    >
      {loading ? (
        <p role="status" className="text-body text-muted">
          Loading the share link…
        </p>
      ) : loadError || !token ? (
        <FormMessage title="Sharing isn't available yet.">
          The database needs the latest update before links can be created. Apply the pending
          migration, then try again.
        </FormMessage>
      ) : (
        <div className="flex flex-col gap-4">
          <Toggle
            label="Share link"
            description={
              enabled ? "On — the link shows the current invoice." : "Off — the link shows nothing."
            }
            checked={enabled}
            disabled={saving}
            onCheckedChange={handleToggle}
          />

          {enabled ? (
            <div className="flex flex-col gap-2">
              <label htmlFor={`share-link-${invoiceId}`} className="text-label text-ink">
                Public link
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id={`share-link-${invoiceId}`}
                  value={url}
                  readOnly
                  onFocus={(event) => event.target.select()}
                  inputClassName="tabular-nums"
                  leading={<Link2 size={iconSize.md} strokeWidth={iconStroke} aria-hidden />}
                />
                <Button
                  onClick={handleCopy}
                  successLabel={copied ? "Copied" : undefined}
                  leadingIcon={<Copy size={iconSize.md} strokeWidth={iconStroke} aria-hidden />}
                  className="sm:shrink-0"
                >
                  Copy link
                </Button>
              </div>
              <p className="text-caption text-muted">
                Saving changes to the invoice updates this page instantly.
              </p>
            </div>
          ) : null}

          <div className="border-t border-border pt-4">
            {confirmingNew ? (
              <div className="flex flex-col gap-2">
                <p className="text-body text-ink">
                  Replace this link? The current URL will stop working immediately.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={handleNewLink}
                    loading={saving}
                    leadingIcon={
                      <RefreshCw size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
                    }
                  >
                    Replace link
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmingNew(false)}
                    disabled={saving}
                  >
                    Keep current link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmingNew(true)}
                  disabled={saving}
                  leadingIcon={
                    <RefreshCw size={iconSize.md} strokeWidth={iconStroke} aria-hidden />
                  }
                  className="self-start"
                >
                  Create a new link
                </Button>
                <p className="text-caption text-muted">
                  Use this if the link went to the wrong person. The old URL stops working.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
