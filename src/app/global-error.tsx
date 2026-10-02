"use client";

import { Inter } from "next/font/google";
import { Button, ErrorState } from "@/components/ui";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

// Replaces the root layout when the layout itself fails, so it renders its own <html>.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  console.error(error);

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-dvh items-center justify-center bg-canvas px-gutter text-foreground">
        <title>Something went wrong · Aexo</title>
        <main id="main">
          <ErrorState
            title="Something went wrong"
            description="Aexo couldn't load. Try again in a moment."
            action={<Button onClick={() => retry()}>Try again</Button>}
          />
        </main>
      </body>
    </html>
  );
}
