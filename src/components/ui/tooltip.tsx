"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { computePosition, type Side } from "@/lib/utils/position";

type TooltipProps = {
  content: ReactNode;
  /** A single focusable element, e.g. an IconButton. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: Side;
  className?: string;
};

const OPEN_DELAY_MS = 300;

/**
 * Short supplementary hint on hover (mouse) and keyboard focus. Escape closes it.
 *
 * It sits in the top layer (popover), so containers with overflow can't clip it,
 * and it's kept inside the viewport on small screens. Touch devices don't
 * hover, so never put essential information or interactive content in a tooltip.
 */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const tooltipId = `tooltip-${useId()}`;
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (tipRef.current?.matches(":popover-open")) tipRef.current.hidePopover();
  }, []);

  const place = useCallback(() => {
    const tip = tipRef.current;
    const anchor = anchorRef.current?.firstElementChild;
    if (!tip || !anchor || !tip.matches(":popover-open")) return;
    const { top, left } = computePosition(
      anchor.getBoundingClientRect(),
      tip.getBoundingClientRect(),
      { side, align: "center" },
    );
    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }, [side]);

  const show = (delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const tip = tipRef.current;
      if (!tip || tip.matches(":popover-open")) return;
      tip.showPopover();
      // Measured in the same task as showing, so nothing paints in the wrong place.
      place();
    }, delay);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && hide();
    // Keep the tip attached to its anchor when the page scrolls (including the
    // scroll that happens when keyboard focus brings the anchor into view).
    const onScroll = () => requestAnimationFrame(place);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      hide();
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [hide, place]);

  const existingDescription = children.props["aria-describedby"];

  return (
    <span
      ref={anchorRef}
      className="inline-flex"
      onPointerEnter={(event) => event.pointerType === "mouse" && show(OPEN_DELAY_MS)}
      onPointerLeave={hide}
      onFocus={(event) => event.target.matches(":focus-visible") && show(0)}
      onBlur={hide}
    >
      {cloneElement(children, {
        "aria-describedby": [existingDescription, tooltipId].filter(Boolean).join(" "),
      })}
      <div
        ref={tipRef}
        id={tooltipId}
        role="tooltip"
        popover="manual"
        className={cn(
          "fixed w-max max-w-[min(15rem,calc(100vw-1rem))] rounded-sm bg-ink px-2.5 py-1.5 text-caption text-canvas shadow-control",
          "opacity-0 transition-[opacity,overlay,display] transition-discrete duration-150 ease-standard open:opacity-100 starting:open:opacity-0",
          className,
        )}
      >
        {content}
      </div>
    </span>
  );
}
