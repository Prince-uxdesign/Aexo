export type Side = "top" | "bottom";
export type Align = "start" | "center" | "end";

type PositionOptions = {
  side?: Side;
  align?: Align;
  /** Gap between anchor and floating element, in px. */
  offset?: number;
  /** Minimum distance from the viewport edge, in px. */
  padding?: number;
};

/**
 * Place a floating element (menu, tooltip) next to its anchor using fixed
 * coordinates. Flips to the other side when there isn't room and clamps to the
 * viewport, so nothing is cut off on a 375px screen.
 */
export function computePosition(
  anchor: DOMRect,
  floating: { width: number; height: number },
  { side = "bottom", align = "start", offset = 8, padding = 8 }: PositionOptions = {},
) {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;

  const spaceBelow = vh - anchor.bottom - offset - padding;
  const spaceAbove = anchor.top - offset - padding;
  let placed: Side = side;
  if (side === "bottom" && floating.height > spaceBelow && spaceAbove > spaceBelow) placed = "top";
  if (side === "top" && floating.height > spaceAbove && spaceBelow > spaceAbove) placed = "bottom";

  const top = placed === "bottom" ? anchor.bottom + offset : anchor.top - offset - floating.height;

  let left =
    align === "start"
      ? anchor.left
      : align === "end"
        ? anchor.right - floating.width
        : anchor.left + anchor.width / 2 - floating.width / 2;
  left = Math.min(Math.max(left, padding), vw - floating.width - padding);

  return { top: Math.max(top, padding), left: Math.max(left, padding), side: placed };
}
