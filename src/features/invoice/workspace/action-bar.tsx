import { Eye } from "lucide-react";
import { Button, iconSize, iconStroke } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

/**
 * Bottom actions on phones and tablets (below 1024px).
 *
 * It's `sticky`, not `fixed`, and the last thing in the form column: while the
 * form scrolls it stays at the bottom of the screen, and at the end of the page
 * it settles into place below the preview, so it never covers the last fields.
 * The `data-action-bar` attribute adds matching scroll padding (globals.css),
 * so a focused field is never hidden behind it.
 */
export function ActionBar({
  onPreview,
  onFinish,
  className,
}: {
  onPreview: () => void;
  onFinish: () => void;
  className?: string;
}) {
  return (
    <div
      data-action-bar
      className={cn(
        "sticky bottom-0 z-30 -mx-gutter px-gutter md:mx-0 md:px-0",
        // Full-bleed background and top rule, whatever the column width.
        "before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-dvw before:-translate-x-1/2 before:border-t before:border-border before:bg-canvas",
        className,
      )}
    >
      <div className="flex gap-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button
          variant="secondary"
          onClick={onPreview}
          leadingIcon={<Eye size={iconSize.md} strokeWidth={iconStroke} />}
          className="flex-1"
        >
          Preview
        </Button>
        <Button onClick={onFinish} className="flex-[1.4]">
          Finish invoice
        </Button>
      </div>
    </div>
  );
}
