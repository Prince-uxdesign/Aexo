import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Create a new one per request; never share it between requests.
 *
 * Session refresh (a proxy.ts that refreshes auth cookies) is added with
 * authentication in a later phase.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies. That's fine as long as the
          // session is refreshed elsewhere (the proxy, added with auth).
        }
      },
    },
  });
}
