import { Check } from "lucide-react";
import { iconSize } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

// What an account adds (guide §16). Creating an invoice never needs one.
const benefits = [
  "Save every invoice in one place",
  "Edit, duplicate and track what's been paid",
  "Share invoices with a link",
];

export function AccountBenefits({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {benefits.map((benefit) => (
        <li key={benefit} className="flex items-start gap-3 text-body text-ink">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill bg-ink text-canvas">
            <Check size={iconSize.sm - 4} strokeWidth={2.5} />
          </span>
          {benefit}
        </li>
      ))}
    </ul>
  );
}
