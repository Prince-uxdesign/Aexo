import { MOTION_BOOT_SCRIPT } from "./_components/motion";
import { ScrollMotion } from "./_components/scroll-motion";
import { SiteFooter } from "./_components/site-footer";

/**
 * The landing page sits on white (not the app's warm canvas) so the sky hero
 * and the cool mist cards read cleanly. The header lives inside the hero.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    // The boot script sets `data-motion` here before hydration, hence suppressHydrationWarning.
    <div data-motion-root suppressHydrationWarning className="flex flex-1 flex-col bg-white">
      {/* First child, so scroll-revealed sections start hidden on first paint.
          Same server/client `type` swap as Next's "Preventing flash" guide. */}
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }}
      />
      <ScrollMotion />
      {children}
      <SiteFooter />
    </div>
  );
}
