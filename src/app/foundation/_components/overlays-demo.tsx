"use client";

import { useState } from "react";
import { Copy, Download, Link2, Mail, MoreHorizontal, Pencil, Printer, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  Field,
  FieldGrid,
  IconButton,
  Input,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  Textarea,
  useToast,
} from "@/components/ui";
import { Demo, icon } from "./demo-helpers";

export function OverlaysDemo() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <Demo title="Menu: dropdown from 640px, bottom sheet on phones">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Menu
            label="Invoice actions"
            trigger={
              <Button variant="secondary" trailingIcon={icon(MoreHorizontal)}>
                Actions
              </Button>
            }
          >
            <MenuItem icon={icon(Pencil)} shortcut="E" onSelect={() => toast({ title: "Edit" })}>
              Edit
            </MenuItem>
            <MenuItem
              icon={icon(Copy)}
              shortcut="D"
              onSelect={() => toast({ title: "Invoice duplicated.", tone: "success" })}
            >
              Duplicate
            </MenuItem>
            <MenuItem icon={icon(Link2)} onSelect={() => toast({ title: "Invoice link copied." })}>
              Copy share link
            </MenuItem>
            <MenuSeparator />
            <MenuLabel>Export</MenuLabel>
            <MenuItem icon={icon(Download)}>Download PDF</MenuItem>
            <MenuItem icon={icon(Printer)}>Print</MenuItem>
            <MenuItem icon={icon(Mail)} disabled>
              Email (add a recipient first)
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={icon(Trash2)} destructive onSelect={() => setConfirmOpen(true)}>
              Delete
            </MenuItem>
          </Menu>

          <Menu
            label="More options"
            align="end"
            trigger={
              <IconButton label="More options" icon={icon(MoreHorizontal)} variant="secondary" />
            }
          >
            <MenuItem icon={icon(Copy)}>Duplicate</MenuItem>
            <MenuItem icon={icon(Printer)}>Print</MenuItem>
          </Menu>
        </div>
      </Demo>

      <Demo title="Dialogs">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            Confirmation
          </Button>
          <Button variant="secondary" onClick={() => setFormOpen(true)}>
            Long form (full screen on phones)
          </Button>
        </div>
      </Demo>

      <Demo title="Toasts">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast({ title: "Invoice link copied." })}>
            Default
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast({ title: "Invoice saved.", tone: "success" })}
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Could not save invoice. Try again.",
                description: "Check your connection. Your changes are still here.",
                tone: "error",
              })
            }
          >
            Error
          </Button>
        </div>
      </Demo>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this invoice?"
        description="INV-0001 will be removed. This can't be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive-solid"
              loading={deleting}
              onClick={() => {
                setDeleting(true);
                setTimeout(() => {
                  setDeleting(false);
                  setConfirmOpen(false);
                  toast({ title: "Invoice deleted." });
                }, 900);
              }}
            >
              Delete invoice
            </Button>
          </>
        }
      />

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Recipient details"
        description="Who is this invoice for?"
        size="lg"
        mobile="fullscreen"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setFormOpen(false);
                toast({ title: "Recipient saved.", tone: "success" });
              }}
            >
              Save recipient
            </Button>
          </>
        }
      >
        <FieldGrid className="pb-2">
          <Field label="Name" required>
            <Input autoComplete="name" />
          </Field>
          <Field label="Company">
            <Input autoComplete="organization" />
          </Field>
          <Field label="Email" required>
            <Input type="email" autoComplete="email" />
          </Field>
          <Field label="Phone">
            <Input type="tel" autoComplete="tel" />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Textarea rows={3} autoComplete="street-address" />
          </Field>
          <Field label="City">
            <Input autoComplete="address-level2" />
          </Field>
          <Field label="Postal code">
            <Input autoComplete="postal-code" />
          </Field>
          <Field label="Notes for this client" className="sm:col-span-2">
            <Textarea rows={3} />
          </Field>
        </FieldGrid>
      </Dialog>
    </div>
  );
}
