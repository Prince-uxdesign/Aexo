"use client";

/**
 * An inline script that runs once, while the server HTML is parsed (before
 * first paint), and is inert on the client. It must be a Client Component:
 * then the browser render gets `type="text/plain"`, so React doesn't warn
 * about rendering a <script>; `suppressHydrationWarning` covers the type
 * mismatch. Pattern from Next's "Preventing flash before hydration" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
