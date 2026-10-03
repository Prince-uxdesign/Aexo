import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Supabase client for Client Components (runs in the browser).
 * Creating it per call is cheap; @supabase/ssr reuses one instance in the browser.
 *
 * Once tables exist, generate types (`npx supabase gen types typescript`) and
 * pass them as `createBrowserClient<Database>(...)`.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createBrowserClient<Database>(url, publishableKey);
}
