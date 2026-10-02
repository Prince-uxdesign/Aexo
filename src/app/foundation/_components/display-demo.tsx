"use client";

import { MoreHorizontal } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DataTable,
  Divider,
  IconButton,
  type DataTableColumn,
} from "@/components/ui";
import { formatMoney } from "@/lib/format/currency";
import { Demo, icon } from "./demo-helpers";

type Item = { id: string; name: string; qty: number; unit: string; price: number };

const items: Item[] = [
  { id: "1", name: "Brand identity design", qty: 1, unit: "project", price: 4800 },
  {
    id: "2",
    name: "Website design and development for the Northwind Trading International online store",
    qty: 120,
    unit: "hours",
    price: 95,
  },
  { id: "3", name: "Hosting (annual)", qty: 1, unit: "year", price: 240 },
];

const columns: DataTableColumn<Item>[] = [
  { key: "name", header: "Item", cell: (row) => row.name, primary: true },
  {
    key: "qty",
    header: "Qty",
    cell: (row) => `${row.qty} ${row.unit}`,
    align: "end",
    className: "w-32",
  },
  {
    key: "price",
    header: "Price",
    cell: (row) => formatMoney(row.price, "USD", "en-US"),
    align: "end",
    className: "w-32",
  },
  {
    key: "amount",
    header: "Amount",
    cell: (row) => formatMoney(row.qty * row.price, "USD", "en-US"),
    align: "end",
    className: "w-36",
  },
];

export function DisplayDemo() {
  return (
    <div className="flex flex-col gap-10">
      <Demo title="Badges: color is never the only signal">
        <div className="flex flex-wrap gap-2">
          <Badge>Draft</Badge>
          <Badge tone="accent">Selected</Badge>
          <Badge tone="success">Paid</Badge>
          <Badge tone="warning">Due soon</Badge>
          <Badge tone="error">Overdue</Badge>
          <Badge dot={false}>USD</Badge>
          <Badge className="max-w-40">Partially paid by bank transfer</Badge>
        </div>
      </Demo>

      <Demo title="Cards">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader action={<Badge tone="success">Paid</Badge>}>
              <CardTitle>Your details</CardTitle>
              <CardDescription>Business or sender information.</CardDescription>
            </CardHeader>
            <p className="text-body text-muted">Default card: border, no shadow.</p>
          </Card>
          <Card>
            <CardHeader
              action={<IconButton label="Card options" icon={icon(MoreHorizontal)} size="sm" />}
            >
              <CardTitle>Northwind Trading International Holdings Limited</CardTitle>
              <CardDescription>Long names wrap; the action stays put.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="secondary">Edit</Button>
              <Button>Use this client</Button>
            </CardFooter>
          </Card>
          <Card elevated className="md:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle>Elevated card</CardTitle>
              <CardDescription>For floating surfaces only.</CardDescription>
            </CardHeader>
            <p className="text-body text-muted">Shadow instead of a border.</p>
          </Card>
          <Card padding="compact" className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-label text-ink">INV-0042 · Acme Studio</p>
              <p className="text-caption text-muted">Compact padding for lists</p>
            </div>
            <p className="shrink-0 text-body text-ink tabular-nums">$12,480.00</p>
          </Card>
        </div>
      </Demo>

      <Demo title="Table: stacked rows below 768px, nothing hidden">
        <Card padding="default">
          <DataTable
            caption="Invoice items"
            columns={columns}
            rows={items}
            getRowKey={(row) => row.id}
          />
        </Card>
      </Demo>

      <Demo title="Dividers">
        <div className="flex flex-col gap-4">
          <Divider />
          <Divider label="or" />
          <div className="flex h-10 items-center gap-4 text-label">
            <span>Left</span>
            <Divider orientation="vertical" />
            <span>Right</span>
          </div>
        </div>
      </Demo>
    </div>
  );
}
