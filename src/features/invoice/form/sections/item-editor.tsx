"use client";

import { memo, useId } from "react";
import { Copy, Trash2 } from "lucide-react";
import {
  Button,
  CurrencyInput,
  Input,
  NumberInput,
  Textarea,
  iconSize,
  iconStroke,
} from "@/components/ui";
import { formatMoney } from "@/lib/format/currency";
import { lineAmount } from "../../model/totals";
import type { FormActions } from "../form-store";
import { FormField } from "../form-field";
import { itemPath } from "../form-validation";
import type { ItemValues } from "../form-values";

type ItemEditorProps = {
  item: ItemValues;
  index: number;
  currency: string;
  locale: string;
  canRemove: boolean;
  updateItem: FormActions["updateItem"];
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
};

/** Shared by every item editor: suggestions for the free-text Unit field. */
export const UNIT_LIST_ID = "invoice-unit-suggestions";

/**
 * One line item. Phones: name, description, then quantity and unit side by
 * side, price and amount below. Once the section has room (448px+ inside),
 * quantity, unit and price share a row so items read like a table.
 */
export const ItemEditor = memo(function ItemEditor({
  item,
  index,
  currency,
  locale,
  canRemove,
  updateItem,
  onRemove,
  onDuplicate,
}: ItemEditorProps) {
  const headingId = useId();
  const set = (patch: Partial<ItemValues>) => updateItem(item.id, patch);
  const amount =
    item.unitPrice === null
      ? "—"
      : formatMoney(
          lineAmount({ ...item, quantity: item.quantity ?? 0, unitPrice: item.unitPrice }),
          currency,
          locale,
        );

  return (
    <li
      role="group"
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-md border border-border p-4 @md:p-5"
    >
      <p id={headingId} className="text-label text-ink">
        Item {index + 1}
      </p>

      <FormField
        path={itemPath(item.id, "name")}
        id={`${item.id}-name`}
        label="Item or service"
        required
      >
        <Input
          value={item.name}
          onChange={(event) => set({ name: event.target.value })}
          autoComplete="off"
          placeholder="e.g. Website design"
        />
      </FormField>

      <FormField path={itemPath(item.id, "description")} label="Description">
        <Textarea
          rows={2}
          value={item.description}
          onChange={(event) => set({ description: event.target.value })}
          placeholder="Optional details for your client"
          className="min-h-20"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-x-3 gap-y-4 @md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,7fr)]">
        <FormField path={itemPath(item.id, "quantity")} label="Quantity" required>
          <NumberInput
            value={item.quantity}
            onValueChange={(quantity) => set({ quantity })}
            inputClassName="tabular-nums"
          />
        </FormField>

        <FormField path={itemPath(item.id, "unit")} label="Unit">
          <Input
            value={item.unit}
            onChange={(event) => set({ unit: event.target.value })}
            list={UNIT_LIST_ID}
            autoComplete="off"
            placeholder="hours"
            maxLength={20}
          />
        </FormField>

        <FormField
          path={itemPath(item.id, "unitPrice")}
          label="Unit price"
          required
          className="col-span-2 @md:col-span-1"
        >
          <CurrencyInput
            value={item.unitPrice}
            onValueChange={(unitPrice) => set({ unitPrice })}
            currency={currency}
            locale={locale}
          />
        </FormField>
      </div>

      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(item.id)}
            leadingIcon={<Copy size={iconSize.sm} strokeWidth={iconStroke} />}
            aria-label={`Duplicate item ${index + 1}${item.name ? `, ${item.name}` : ""}`}
            className="-ml-3"
          >
            Duplicate
          </Button>
          {canRemove ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(item.id)}
              leadingIcon={<Trash2 size={iconSize.sm} strokeWidth={iconStroke} />}
              aria-label={`Remove item ${index + 1}${item.name ? `, ${item.name}` : ""}`}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <p className="ml-auto flex items-baseline gap-3">
          <span className="text-label font-normal text-muted">Amount</span>
          <output className="text-body break-all text-ink tabular-nums" aria-live="off">
            {amount}
          </output>
        </p>
      </div>
    </li>
  );
});
