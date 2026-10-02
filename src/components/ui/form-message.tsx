import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { iconSize, iconStroke } from "./icon";

type Tone = "error" | "success" | "info";

const toneStyles: Record<Tone, { box: string; icon: ReactNode }> = {
  error: {
    box: "border-error/30 bg-error/6",
    icon: <CircleAlert size={iconSize.md} strokeWidth={iconStroke} className="text-error-strong" />,
  },
  success: {
    box: "border-border-strong bg-surface-alt",
    icon: <CircleCheck size={iconSize.md} strokeWidth={iconStroke} className="text-ink" />,
  },
  info: {
    box: "border-border-strong bg-surface-alt",
    icon: <Info size={iconSize.md} strokeWidth={iconStroke} className="text-ink" />,
  },
};

type FormMessageProps = {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/**
 * Inline message for a whole form or dialog ("That email or password doesn't
 * look right."). Errors are announced immediately (role=alert); success and
 * info politely (role=status). Text stays ink for contrast; tone comes from
 * the icon and border, never color alone.
 */
export function FormMessage({ tone = "error", title, children, className }: FormMessageProps) {
  const style = toneStyles[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-md border px-4 py-3 text-ink", style.box, className)}
    >
      <span className="shrink-0 pt-0.5">{style.icon}</span>
      <div className="flex min-w-0 flex-col gap-0.5">
        {title ? <p className="text-label">{title}</p> : null}
        {children ? <div className="text-body break-words">{children}</div> : null}
      </div>
    </div>
  );
}
