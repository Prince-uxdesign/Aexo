import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { iconSize, iconStroke } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { revealDelay } from "./motion";

/*
 * The landing page's small visual kit. Every section is built from these so the
 * page reads as one system: big centred headings with an inline icon tile,
 * white pill chips, and soft mist cards on a white page.
 */

/**
 * A rounded icon tile set inline with heading text ("Save [tile] hours").
 * Pass a lucide `icon`, or `children` for anything else (the Aexo mark).
 */
export function InlineTile({
  icon: Icon,
  children,
  className,
}: {
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      data-reveal="pop"
      style={revealDelay(320)}
      className={cn(
        "mx-1 inline-flex size-[1.05em] -translate-y-[0.08em] items-center justify-center rounded-md bg-white align-middle text-sky-500 shadow-float",
        className,
      )}
    >
      {Icon ? <Icon className="size-[0.5em]" strokeWidth={2} /> : children}
    </span>
  );
}

type SectionHeadingProps = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** `muted` is the soft grey heading used by the closing section. */
  tone?: "ink" | "muted";
  className?: string;
};

/** Centred section intro: one large balanced heading, optional supporting line. */
export function SectionHeading({
  id,
  title,
  description,
  tone = "ink",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto flex max-w-3xl flex-col items-center text-center", className)}>
      <h2
        id={id}
        data-reveal="blur"
        className={cn("text-section", tone === "ink" ? "text-ink" : "text-muted-soft")}
      >
        {title}
      </h2>
      {description ? (
        <p
          data-reveal="rise"
          style={revealDelay(160)}
          className="mt-5 max-w-xl text-body-lg text-balance text-muted"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** White pill label with a small sky icon, used at the top of feature cards. */
export function Chip({
  icon: Icon,
  children,
  className,
}: {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-9 items-center gap-2 self-start rounded-pill bg-white px-3.5 text-label text-ink shadow-soft",
        className,
      )}
    >
      <Icon size={iconSize.sm} strokeWidth={iconStroke} className="text-sky-500" />
      {children}
    </span>
  );
}

/** The soft, borderless mist card most features sit in. */
export function FeatureCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("relative flex flex-col overflow-hidden rounded-2xl bg-mist", className)}
      {...props}
    />
  );
}

/** Round white icon badge for the small three-up cards. */
export function IconBadge({ icon: Icon, delay = 0 }: { icon: LucideIcon; delay?: number }) {
  return (
    <span
      aria-hidden
      data-reveal="pop"
      style={revealDelay(delay)}
      className="flex size-11 items-center justify-center rounded-pill bg-white text-sky-500 shadow-soft"
    >
      <Icon size={iconSize.md} strokeWidth={iconStroke} />
    </span>
  );
}

/**
 * Three-up card: icon at top, title and copy pushed to the bottom. Cards rise
 * in one after another (`index`), each icon popping in just after its card.
 */
export function SmallFeature({
  icon,
  title,
  index = 0,
  children,
}: {
  icon: LucideIcon;
  title: string;
  index?: number;
  children: ReactNode;
}) {
  return (
    <li
      data-reveal="rise"
      style={revealDelay(index * 120)}
      className="flex min-h-64 flex-col rounded-2xl bg-mist p-card md:min-h-72 lg:p-10"
    >
      <IconBadge icon={icon} delay={index * 120 + 350} />
      <h3 className="mt-auto pt-10 text-h3 text-ink">{title}</h3>
      <p className="mt-3 text-body text-muted">{children}</p>
    </li>
  );
}

/** Vertical rhythm shared by every section below the hero. */
export const sectionClass = "scroll-mt-24 py-20 md:py-28 lg:py-32";
