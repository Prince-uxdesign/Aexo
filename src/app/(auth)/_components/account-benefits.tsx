import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// What an account adds (guide §16). Creating an invoice never needs one.
const benefits = [
  "Save every invoice in one place",
  "Edit, duplicate and track what's been paid",
  "Share invoices with a link",
];

/** White pill chips for the sky panel and band. */
export function AccountBenefits({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} style={style}>
      {benefits.map((benefit) => (
        <li
          key={benefit}
          className="inline-flex min-h-9 items-center gap-2 rounded-pill bg-white px-3.5 text-label font-normal text-ink shadow-soft"
        >
          <Check size={14} strokeWidth={2.5} className="shrink-0 text-sky-600" />
          {benefit}
        </li>
      ))}
    </ul>
  );
}
