import { SkyStars, skySurface } from "@/components/brand/sky";
import { Container } from "@/components/layout/container";
import { LoadingState } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

/** Dashboard loading: the sky banner with placeholder stat cards, then a spinner status. */
export default function DashboardLoading() {
  return (
    <main id="main" className="flex-1 pt-2 pb-12 sm:pt-3 md:pb-16">
      <Container className="flex flex-col gap-8 max-sm:px-2 md:gap-10">
        <div
          aria-hidden
          className={cn(
            skySurface,
            "rounded-xl px-5 pt-7 pb-5 sm:rounded-3xl sm:px-8 sm:pt-10 sm:pb-8 lg:px-10",
          )}
        >
          <SkyStars />
          <div className="flex flex-col gap-3">
            <div className="h-9 w-64 max-w-full rounded-sm bg-white/20" />
            <div className="h-5 w-80 max-w-full rounded-sm bg-white/16" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-12 sm:gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="rounded-lg bg-white p-3.5 shadow-soft sm:rounded-xl sm:p-5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-pill bg-sky-50" />
                  <div className="h-4 w-20 rounded-sm bg-mist" />
                </div>
                <div className="mt-4 h-7 w-24 rounded-sm bg-mist" />
                <div className="mt-2 h-3.5 w-16 rounded-sm bg-mist" />
              </div>
            ))}
          </div>
        </div>
        <LoadingState message="Loading your invoices" />
      </Container>
    </main>
  );
}
