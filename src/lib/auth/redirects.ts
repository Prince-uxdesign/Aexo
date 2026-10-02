import { DEFAULT_SIGNED_IN_ROUTE } from "@/config/routes";

/**
 * Validate a `next` redirect target taken from a URL or form.
 * Only same-site paths are allowed ("/create", "/account?x=1"). Anything that
 * could leave the site ("https://evil.example", "//evil.example", "/\evil")
 * falls back to the default, which prevents open-redirect attacks.
 */
export function safeNextPath(next: unknown, fallback: string = DEFAULT_SIGNED_IN_ROUTE) {
  if (typeof next !== "string" || next.length === 0 || next.length > 512) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  // Reject control characters and backslashes anywhere (some browsers treat "\" as "/").
  if (/[\u0000-\u001f\\]/.test(next)) return fallback;
  return next;
}

/** Build a link to an auth page that returns to `next` afterwards. */
export function withNext(path: string, next?: string | null) {
  if (!next) return path;
  const safe = safeNextPath(next, "");
  // The default destination needs no parameter; keeps URLs clean.
  return safe && safe !== DEFAULT_SIGNED_IN_ROUTE
    ? `${path}?next=${encodeURIComponent(safe)}`
    : path;
}
