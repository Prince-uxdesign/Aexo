import type { Invoice, TemplateId } from "../model/types";
import { getTemplate } from "../templates";
import { cn } from "@/lib/utils/cn";

type InvoiceDocumentProps = {
  invoice: Invoice;
  /** Overrides `invoice.template`, e.g. to preview another template with the same data. */
  template?: TemplateId;
  /**
   * `page` keeps A4 proportions (1 : 1.414). A ratio such as "4 / 3" shows only
   * the top of the page, for thumbnails.
   */
  aspect?: "page" | `${number} / ${number}`;
  /**
   * `clip` (default) cuts content at the frame, for thumbnails and showcases.
   * `grow` starts at the frame's size and lengthens with the content, so a live
   * preview never hides long item lists or notes. Only applies to `aspect="page"`.
   */
  overflow?: "clip" | "grow";
  /** Accessible name for the preview. */
  label?: string;
  className?: string;
};

/**
 * An invoice rendered on paper (guide §12: white, 8px radius). It fills the
 * width of its container and scales everything inside proportionally (see
 * .invoice-doc), so size the wrapper rather than the text.
 */
export function InvoiceDocument({
  invoice,
  template,
  aspect = "page",
  overflow = "clip",
  label,
  className,
}: InvoiceDocumentProps) {
  const { Component, name } = getTemplate(template ?? invoice.template);
  const grow = overflow === "grow" && aspect === "page";

  return (
    <div className={cn("@container w-full overflow-hidden rounded-sm bg-paper", className)}>
      <article
        aria-label={label ?? `Example invoice ${invoice.number}, ${name} template`}
        className={cn(
          "invoice-doc",
          // Growing: a flex column at least one page tall. The template fills it,
          // so footers still sit at the bottom of a short invoice.
          grow ? "flex flex-col *:flex-1" : "overflow-hidden",
        )}
        style={
          grow
            ? { minHeight: "calc(100cqw * 1.4142)" }
            : { aspectRatio: aspect === "page" ? "1 / 1.4142" : aspect }
        }
      >
        <Component invoice={invoice} />
      </article>
    </div>
  );
}
