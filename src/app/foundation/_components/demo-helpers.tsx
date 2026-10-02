import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { iconSize, iconStroke } from "@/components/ui";

export const icon = (Icon: LucideIcon) => <Icon size={iconSize.md} strokeWidth={iconStroke} />;

/** Labelled group inside a foundation section. */
export function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <h3 className="text-label text-muted">{title}</h3>
      {children}
    </div>
  );
}
