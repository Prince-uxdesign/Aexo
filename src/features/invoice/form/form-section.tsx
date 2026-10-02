import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type FormSectionProps = {
  /** Anchor for links and error focusing, e.g. "items". */
  id: string;
  step: number;
  title: string;
  description?: ReactNode;
  /** Small control on the right of the heading. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * One step of the invoice form: a card with a numbered heading. The card is a
 * size container, so the fields inside lay out by the space the section really
 * has (narrow beside the desktop preview, wide on a tablet), not by the screen.
 */
export function FormSection({
  id,
  step,
  title,
  description,
  action,
  className,
  children,
}: FormSectionProps) {
  const headingId = useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "@container min-w-0 scroll-mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6 xl:p-8",
        className,
      )}
    >
      <header className="mb-6 flex items-start gap-3">
        <span
          aria-hidden
          className="mt-px flex size-7 shrink-0 items-center justify-center rounded-pill border border-border-strong bg-surface-alt text-caption text-ink tabular-nums"
        >
          {step}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id={headingId} className="text-h3 break-words text-ink">
            {title}
          </h2>
          {description ? <p className="text-label font-normal text-muted">{description}</p> : null}
        </div>
        {action ? <div className="-my-1 shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}

/**
 * Field layout inside a section: one column until the section is 448px wide
 * inside, then two. Give a field `className="@md:col-span-2"` to span both.
 */
export function SectionGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("grid gap-5 @md:grid-cols-2 @md:gap-x-4", className)}>{children}</div>;
}
