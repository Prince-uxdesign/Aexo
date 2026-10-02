/**
 * Format an ISO date ("2026-10-02") for display. Dates are treated as calendar
 * dates in UTC, so "2 October" never shifts to "1 October" in a western time zone.
 */
export function formatDate(
  iso: string,
  locale: string,
  style: "long" | "short" | "monthDay" = "long",
) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: style === "monthDay" ? undefined : "numeric",
  }).format(date);
}

/** Today as an ISO date in the person's own time zone. Call it in the browser. */
export function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** "2026-10-02" + 30 → "2026-11-01". Returns "" for an invalid date. */
export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
