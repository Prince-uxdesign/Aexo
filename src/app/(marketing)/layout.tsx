import { InlineScript } from "./_components/inline-script";
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
    <div
      data-motion-root
      suppressHydrationWarning
      className="theme-cool flex flex-1 flex-col bg-white"
    >
      {/* First child (the script finds this div as its parent), so scroll-revealed
          sections start hidden on first paint. */}
      <InlineScript html={MOTION_BOOT_SCRIPT} />
      <ScrollMotion />
      {children}
      <SiteFooter />
    </div>
  );
}
