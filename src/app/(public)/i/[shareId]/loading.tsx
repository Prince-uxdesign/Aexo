import { Container } from "@/components/layout/container";
import { LoadingState, Skeleton } from "@/components/ui";

/** Loading state for the public invoice page. Brand chrome comes from the parent layout. */
export default function SharedInvoiceLoading() {
  return (
    <main id="main" className="flex-1 py-6 md:py-10" aria-busy="true">
      <Container className="flex max-w-3xl flex-col gap-5 md:gap-6">
        <LoadingState message="Loading this invoice…" />
        <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/3" />
        </div>
        <Skeleton className="aspect-[1/1.4142] w-full rounded-sm" />
      </Container>
    </main>
  );
}
