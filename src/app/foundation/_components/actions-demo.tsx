"use client";

import { useState } from "react";
import { Copy, Download, Link2, Plus, Send, Trash2 } from "lucide-react";
import { Button, IconButton, Tooltip } from "@/components/ui";
import { Demo, icon } from "./demo-helpers";

export function ActionsDemo() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <Demo title="Variants">
        <div className="flex flex-wrap items-center gap-3">
          <Button leadingIcon={icon(Plus)}>Create Invoice</Button>
          <Button variant="secondary">Save Draft</Button>
          <Button variant="ghost">Back</Button>
          <Button variant="destructive" leadingIcon={icon(Trash2)}>
            Delete
          </Button>
          <Button variant="destructive-solid">Delete invoice</Button>
        </div>
      </Demo>

      <Demo title="States: disabled, loading, success">
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Button
            loading={loading}
            leadingIcon={icon(Download)}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="secondary"
            leadingIcon={icon(Link2)}
            successLabel={copied ? "Link copied" : undefined}
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            Copy link
          </Button>
        </div>
      </Demo>

      <Demo title="Sizes: sm grows to 44px on touch screens">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary">
            Small
          </Button>
          <Button size="md" variant="secondary">
            Medium
          </Button>
          <Button size="lg">Large</Button>
        </div>
      </Demo>

      <Demo title="Icon buttons (circular, with tooltips)">
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip content="Duplicate invoice">
            <IconButton label="Duplicate invoice" icon={icon(Copy)} variant="secondary" />
          </Tooltip>
          <Tooltip content="Download PDF" side="bottom">
            <IconButton label="Download PDF" icon={icon(Download)} />
          </Tooltip>
          <Tooltip content="Send invoice by email">
            <IconButton label="Send invoice" icon={icon(Send)} variant="primary" />
          </Tooltip>
          <IconButton label="Delete invoice" icon={icon(Trash2)} variant="destructive" />
          <IconButton label="Working" icon={icon(Send)} variant="secondary" loading />
          <IconButton label="Unavailable" icon={icon(Copy)} disabled />
        </div>
      </Demo>

      <Demo title="Long labels wrap instead of overflowing">
        <div className="grid max-w-md gap-3">
          <Button fullWidth size="lg">
            Send invoice INV-2026-00142 to Northwind Trading International
          </Button>
          <Button variant="secondary" fullWidth>
            Full width on mobile flows
          </Button>
        </div>
      </Demo>
    </div>
  );
}
