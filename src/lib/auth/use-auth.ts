"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export type AuthStatus = "loading" | "signed-in" | "signed-out";

/**
 * Client-side auth state for UI decisions only ("show Account or Sign in?",
 * "can this person save?"). It is not a security check: the server verifies
 * the user on every protected request and the database enforces RLS.
 *
 * Kept client-side so static pages (like the landing page) stay static.
 */
export function useAuth() {
  const configured = isSupabaseConfigured();
  const [status, setStatus] = useState<AuthStatus>(configured ? "loading" : "signed-out");

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "signed-in" : "signed-out");
    });
    // Stays in sync with sign-in/out in this tab and others.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "signed-in" : "signed-out");
    });
    return () => data.subscription.unsubscribe();
  }, [configured]);

  return { status, isSignedIn: status === "signed-in" };
}
