import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { iconSize, iconStroke } from "./icon";

type StateMessageProps = {
  title: ReactNode;
  description?: ReactNode;
  /** A small icon. No large illustrations (§22). */
  icon?: ReactNode;
  /** Usually one Button or link styled with buttonStyles(). */
  action?: ReactNode;
  titleAs?: "h1" | "h2" | "h3" | "h4";
  className?: string;
};

/**
 * Nothing to show yet, e.g. "No invoices yet." Say what is missing and what to do next.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  titleAs: Title = "h2",
  className,
}: StateMessageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-sm flex-col items-center gap-4 px-4 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-12 items-center justify-center rounded-pill bg-surface-alt text-ink">
          {icon}
        </span>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Title className="text-h3 text-ink">{title}</Title>
        {description ? <p className="text-body text-muted">{description}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/**
 * Something failed. Use plain, human wording ("Could not load your invoices."),
 * never raw error messages (§21), and offer a way to recover.
 */
export function ErrorState({
  icon = <CircleAlert size={iconSize.lg} strokeWidth={iconStroke} className="text-error" />,
  ...props
}: StateMessageProps) {
  return (
    <div role="alert">
      <EmptyState icon={icon} {...props} />
    </div>
  );
}
