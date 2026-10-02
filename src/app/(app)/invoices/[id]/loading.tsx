import { Container } from "@/components/layout/container";
import { LoadingState } from "@/components/ui";

/** Invoice detail loading: header, actions and facts placeholders. */
export default function InvoiceDetailLoading() {
  return (
    <main id="main" className="flex-1 py-6 md:py-8">
      <Container className="flex max-w-3xl flex-col gap-5 md:gap-6">
        <div aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="h-6 w-32 rounded-sm bg-surface-alt" />
          <div className="h-6 w-16 rounded-pill bg-surface-alt" />
        </div>
        <div aria-hidden className="flex min-w-0 flex-col gap-2">
          <div className="h-8 w-56 max-w-full rounded-sm bg-surface-alt" />
          <div className="h-4 w-32 rounded-sm bg-surface-alt" />
        </div>
        <div aria-hidden className="flex flex-col gap-2 sm:flex-row">
          <div className="h-11 rounded-pill bg-surface-alt sm:w-36" />
          <div className="h-11 rounded-pill bg-surface-alt sm:w-28" />
          <div className="h-11 rounded-pill bg-surface-alt sm:w-32" />
        </div>
        <LoadingState message="Loading your invoice" />
      </Container>
    </main>
  );
}
