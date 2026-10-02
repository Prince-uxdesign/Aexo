import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** id for the heading so its section can use aria-labelledby. */
  id: string;
  className?: string;
};

/**
 * Section intro. Stacked on phones and tablets; from 1024px the description
 * sits beside the title so wide screens don't leave a narrow column of text.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-end lg:gap-10",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:col-span-7">
        <p className="flex items-center gap-2 text-label text-muted">
          <span aria-hidden className="size-1.5 rounded-pill bg-accent" />
          {eyebrow}
        </p>
        <h2 id={id} className="max-w-2xl text-h1 text-ink">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="max-w-xl text-body-lg text-muted lg:col-span-5 lg:justify-self-end">
          {description}
        </p>
      ) : null}
    </div>
  );
}
