import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { routes } from "@/config/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { withNext } from "./redirects";

/**
 * Data Access Layer for auth: the server-side source of truth for "who is
 * this?". Use these in Server Components, Server Actions and Route Handlers.
 * Results are memoised per request with React `cache`.
 */

export type AccountUser = {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
};

/** The verified user id, or null. getClaims checks the JWT signature, so it can be trusted. */
export const getUserId = cache(async (): Promise<string | null> => {
  // Always per-request: a page that checks auth must never be prerendered, even
  // in a build where Supabase isn't configured.
  await connection();
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  return typeof sub === "string" ? sub : null;
});

/**
 * Require a signed-in user, or send them to sign-in and back to `returnTo`
 * afterwards. Returns the verified user id.
 */
export async function requireUserId(returnTo: string = routes.account) {
  const userId = await getUserId();
  if (!userId) redirect(withNext(routes.signIn, returnTo));
  return userId;
}

/** The signed-in user's account details (auth user + profile row). */
export const getAccountUser = cache(async (): Promise<AccountUser | null> => {
  await connection();
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();

  // getUser asks the Auth server, so the email is current even if it just changed.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;
  const user = userData.user;

  // RLS only returns the caller's own row.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const metadataName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? metadataName,
    createdAt: profile?.created_at ?? user.created_at,
  };
});
