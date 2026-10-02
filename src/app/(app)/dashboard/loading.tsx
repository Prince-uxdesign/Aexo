import { Container } from "@/components/layout/container";
import { LoadingState } from "@/components/ui";

/** Dashboard loading: layout-shaped placeholders plus a spinner status. */
export default function DashboardLoading() {
  return (
    <main id="main" className="flex-1 py-6 md:py-8">
      <Container className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div aria-hidden className="h-8 w-48 rounded-sm bg-surface-alt" />
            <div aria-hidden className="h-5 w-32 rounded-sm bg-surface-alt" />
          </div>
          <div aria-hidden className="h-11 w-40 rounded-pill bg-surface-alt" />
        </div>
        <div aria-hidden className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((slot) => (
            <div key={slot} className="rounded-lg border border-border bg-surface px-4 py-3">
              <div className="h-4 w-16 rounded-sm bg-surface-alt" />
              <div className="mt-2 h-8 w-10 rounded-sm bg-surface-alt" />
            </div>
          ))}
        </div>
        <LoadingState message="Loading your invoices" />
      </Container>
    </main>
  );
}
