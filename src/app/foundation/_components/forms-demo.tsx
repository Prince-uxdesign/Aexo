"use client";

import { useState } from "react";
import { Hash, Mail, Percent } from "lucide-react";
import {
  Checkbox,
  CurrencyInput,
  DateInput,
  Field,
  FieldGrid,
  Input,
  Radio,
  RadioGroup,
  Select,
  Textarea,
  Toggle,
  iconSize,
  iconStroke,
} from "@/components/ui";
import { Demo } from "./demo-helpers";

const currencies = [
  { value: "USD", label: "USD · US Dollar" },
  { value: "EUR", label: "EUR · Euro" },
  { value: "GBP", label: "GBP · British Pound" },
  { value: "NGN", label: "NGN · Nigerian Naira" },
  { value: "JPY", label: "JPY · Japanese Yen" },
];

export function FormsDemo() {
  const [email, setEmail] = useState("not-an-email");
  const [terms, setTerms] = useState("net-30");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState<number | null>(1250);
  const [taxLine, setTaxLine] = useState(true);
  const emailError = email.includes("@") ? undefined : "Enter a valid email address.";

  return (
    <div className="flex flex-col gap-10">
      <Demo title="Text fields">
        <FieldGrid>
          <Field label="Business name" required hint="Shown at the top of your invoice.">
            <Input placeholder="Acme Studio" autoComplete="organization" />
          </Field>
          <Field label="Recipient email" required error={emailError}>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              leading={<Mail size={iconSize.md} strokeWidth={iconStroke} />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Invoice number">
            <Input
              defaultValue="INV-0001"
              leading={<Hash size={iconSize.md} strokeWidth={iconStroke} />}
            />
          </Field>
          <Field label="Locked field" hint="Disabled example.">
            <Input defaultValue="Can't be edited" disabled />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea placeholder="Thank you for your business." />
          </Field>
        </FieldGrid>
      </Demo>

      <Demo title="Dates, money and selects">
        <FieldGrid>
          <Field label="Issue date" required>
            <DateInput defaultValue="2026-10-02" />
          </Field>
          <Field label="Due date" hint="Leave empty for due on receipt.">
            <DateInput />
          </Field>
          <Field label="Currency">
            <Select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              options={currencies}
            />
          </Field>
          <Field label="Unit price" hint={`Value: ${amount === null ? "empty" : amount}`}>
            <CurrencyInput
              value={amount}
              onValueChange={setAmount}
              currency={currency}
              locale="en-US"
              placeholder="0.00"
            />
          </Field>
          <Field label="Tax rate">
            <Input
              inputMode="decimal"
              defaultValue="7.5"
              trailing={<Percent size={iconSize.sm} strokeWidth={iconStroke} />}
              inputClassName="text-right tabular-nums"
            />
          </Field>
          <Field label="Payment terms (select)">
            <Select placeholder="Choose terms">
              <option value="due">Due on receipt</option>
              <option value="net-15">Net 15</option>
              <option value="net-30">Net 30</option>
            </Select>
          </Field>
        </FieldGrid>
      </Demo>

      <div className="grid gap-10 md:grid-cols-2">
        <Demo title="Radio">
          <RadioGroup
            label="Payment terms"
            value={terms}
            onValueChange={setTerms}
            hint="You can change this per invoice."
          >
            <Radio value="due" label="Due on receipt" />
            <Radio value="net-15" label="Net 15" />
            <Radio value="net-30" label="Net 30" description="Payment due 30 days after issue." />
            <Radio value="custom" label="Custom terms" disabled />
          </RadioGroup>
        </Demo>

        <Demo title="Checkbox">
          <div className="flex flex-col">
            <Checkbox label="Include tax" defaultChecked />
            <Checkbox label="Show discount" description="Adds a discount line above the total." />
            <Checkbox label="Unavailable option" disabled />
            <Checkbox
              label="I confirm these payment details are correct"
              error="Confirm your payment details to continue."
            />
          </div>
        </Demo>
      </div>

      <Demo title="Toggle (applies immediately)">
        <div className="flex max-w-md flex-col divide-y divide-border">
          <Toggle
            label="Show tax line"
            description="Adds tax to the totals."
            checked={taxLine}
            onCheckedChange={setTaxLine}
          />
          <Toggle label="Show logo on invoice" defaultChecked />
          <Toggle label="Recurring invoices" description="Coming later." disabled />
          <Toggle label="Remember my details" switchPosition="start" />
        </div>
      </Demo>
    </div>
  );
}
