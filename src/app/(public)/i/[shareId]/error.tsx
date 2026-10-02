"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, ErrorState, buttonStyles } from "@/components/ui";
import { routes } from "@/config/routes";

/** Server/database failure on the public invoice page. No invoice details leak here. */
export default function SharedInvoiceError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex flex-1 items-center justify-center px-gutter py-12">
      <ErrorState
        titleAs="h1"
        title="We couldn't load this invoice"
        description="Something went wrong on our side. Check your connection and try again, or ask the sender for a fresh link."
        action={
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Button onClick={() => retry()}>Try again</Button>
            <Link href={routes.home} className={buttonStyles({ variant: "secondary" })}>
              Go to Aexo
            </Link>
          </div>
        }
      />
    </main>
  );
}
