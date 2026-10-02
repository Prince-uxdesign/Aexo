/**
 * Environment variables, read in one place.
 *
 * NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so each
 * one must be read with its full literal name (no dynamic `process.env[key]`).
 * Server-only secrets must never use the NEXT_PUBLIC_ prefix.
 * Copy .env.example to .env.local to configure a machine.
 */

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} as const;

/**
 * Supabase is optional until a feature needs it, so missing keys only fail when
 * a Supabase client is created, with a message that says how to fix it.
 */
export function getSupabaseConfig() {
  const { supabaseUrl, supabasePublishableKey } = publicEnv;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (see .env.example).",
    );
  }

  return { url: supabaseUrl, publishableKey: supabasePublishableKey };
}

export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabasePublishableKey);
}

/**
 * Outgoing email (Phase 16, Resend REST API — no SDK needed). Server-only:
 * never import this from a Client Component. Missing keys fail only when an
 * invoice is actually sent, with a message that says how to fix it.
 */
export function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Email sending isn't set up yet. Add RESEND_API_KEY (and EMAIL_FROM) " +
        "to .env.local — see .env.example.",
    );
  }
  return {
    apiKey,
    // Resend's sandbox sender works without a verified domain (test mode only).
    from: process.env.EMAIL_FROM ?? "Aexo <onboarding@resend.dev>",
  };
}
