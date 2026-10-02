import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const paddings = {
  none: "",
  /** Form sections and content panels: 24px on phones, 32px from 1024px (§7). */
  default: "p-card",
  /** Dense lists and summaries: 16px on phones, 20px from 640px. */
  compact: "p-4 sm:p-5",
};

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  padding?: keyof typeof paddings;
  /** Floating surfaces get a soft shadow instead of a border (§20: don't stack both). */
  elevated?: boolean;
};

export function Card({
  as: Component = "div",
  padding = "default",
  elevated = false,
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "min-w-0 rounded-lg bg-surface",
        elevated ? "shadow-elevated" : "border border-border",
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  /** Small action at the top right (e.g. an IconButton or Badge). */
  action?: ReactNode;
};

export function CardHeader({ action, className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-start justify-between gap-4", className)} {...props}>
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
      {action ? <div className="-my-1 shrink-0">{action}</div> : null}
    </div>
  );
}

type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  /** Pick the level that fits the page outline. Styling stays the same. */
  as?: "h2" | "h3" | "h4";
};

export function CardTitle({ as: Heading = "h3", className, ...props }: CardTitleProps) {
  return <Heading className={cn("text-h3 break-words text-ink", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-label font-normal text-muted", className)} {...props} />;
}

/** Card actions: stacked full-width on phones, a right-aligned row from 640px. */
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end [&>*]:w-full sm:[&>*]:w-auto",
        className,
      )}
      {...props}
    />
  );
}
