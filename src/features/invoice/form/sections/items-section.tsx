"use client";

import { useCallback, useRef } from "react";
import { Plus } from "lucide-react";
import { Button, iconSize, iconStroke } from "@/components/ui";
import { useFormStore, useFormValue } from "../form-context";
import { FormSection } from "../form-section";
import { unitSuggestions } from "../form-values";
import { ItemEditor, UNIT_LIST_ID } from "./item-editor";

/** Focus a control once React has rendered it. */
function focusSoon(id: string) {
  requestAnimationFrame(() => {
    const element = document.getElementById(id);
    element?.focus();
    element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

export function ItemsSection({ step }: { step: number }) {
  const items = useFormValue((v) => v.items);
  const currency = useFormValue((v) => v.currency);
  const locale = useFormValue((v) => v.locale);
  const store = useFormStore();
  const { actions } = store;
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Stable, so the memoised editors don't re-render when another item changes.
  const removeItem = useCallback(
    (id: string) => {
      const current = store.getState().values.items;
      const index = current.findIndex((item) => item.id === id);
      const previous = current[index - 1] ?? current[index + 1];
      store.actions.removeItem(id);
      // Keep keyboard and screen reader users in place: the neighbouring item, or "Add item".
      if (previous) focusSoon(`${previous.id}-name`);
      else addButtonRef.current?.focus();
    },
    [store],
  );

  const duplicateItem = useCallback(
    (id: string) => {
      const newId = store.actions.duplicateItem(id);
      focusSoon(`${newId}-name`);
    },
    [store],
  );

  return (
    <FormSection
      id="items"
      step={step}
      title="Items"
      description="Products or services you're billing for."
    >
      <ul className="flex flex-col gap-3">
        {items.map((item, index) => (
          <ItemEditor
            key={item.id}
            item={item}
            index={index}
            currency={currency}
            locale={locale}
            canRemove={items.length > 1}
            updateItem={actions.updateItem}
            onRemove={removeItem}
            onDuplicate={duplicateItem}
          />
        ))}
      </ul>

      <datalist id={UNIT_LIST_ID}>
        {unitSuggestions.map((unit) => (
          <option key={unit} value={unit} />
        ))}
      </datalist>

      <Button
        ref={addButtonRef}
        variant="secondary"
        onClick={() => focusSoon(`${actions.addItem()}-name`)}
        leadingIcon={<Plus size={iconSize.md} strokeWidth={iconStroke} />}
        className="mt-4 w-full @md:w-auto"
      >
        Add item
      </Button>
    </FormSection>
  );
}
