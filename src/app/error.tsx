"use client";

import { useEffect } from "react";
import { Button, ErrorState } from "@/components/ui";

// Route-level error boundary. Show a human message; the technical detail only goes to the console.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Send this to an error-reporting service once one is chosen.
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex flex-1 items-center justify-center px-gutter">
      <ErrorState
        title="Something went wrong"
        description="We couldn't load this page. Your work hasn't been lost. Try again."
        action={<Button onClick={() => retry()}>Try again</Button>}
      />
    </main>
  );
}
