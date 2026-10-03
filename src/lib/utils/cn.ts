import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge needs to know Aexo's custom token names. Without this it can't
 * tell `text-label` (a size) from `text-muted` (a color) and drops one of them.
 * Keep these lists in sync with the @theme block in src/app/globals.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "hero",
        "section",
        "card",
        "display",
        "h1",
        "h2",
        "h3",
        "body-lg",
        "body",
        "label",
        "caption",
        "button",
        "doc-xs",
        "doc-sm",
        "doc-base",
        "doc-md",
        "doc-lg",
        "doc-xl",
        "doc-2xl",
      ],
      radius: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "pill"],
      shadow: ["control", "elevated", "focus", "focus-error", "soft", "float", "lift"],
      spacing: ["gutter", "section", "card", "header"],
      breakpoint: ["3xl"],
      container: ["page", "reading"],
    },
  },
});

/** Combine conditional class names and resolve Tailwind conflicts (last one wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
