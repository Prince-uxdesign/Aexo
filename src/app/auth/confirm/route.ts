import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

/**
 * Landing point for links in auth emails (confirm sign-up, reset password).
 *
 * Supports both link styles:
 * - `?code=…` (PKCE, Supabase's default email templates). Must be opened in
 *   the browser that requested it.
 * - `?token_hash=…&type=…` (custom templates). Works in any browser. See
 *   docs/AUTH.md for the recommended template change.
 *
 * On success the session cookie is set and the person continues to `next`.
 * On failure they're sent somewhere they can try again, with a readable notice.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const isRecovery =
    next.startsWith(routes.resetPassword) || searchParams.get("type") === "recovery";
  const failure = new URL(isRecovery ? routes.forgotPassword : routes.signIn, origin);
  failure.searchParams.set("notice", "link-expired");

  if (!isSupabaseConfigured() || searchParams.get("error")) {
    return NextResponse.redirect(failure);
  }

  const supabase = await createClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  if (!ok) return NextResponse.redirect(failure);

  const destination = new URL(next, origin);
  // Let the next page acknowledge a freshly confirmed email.
  if (!isRecovery) destination.searchParams.set("welcome", "1");
  return NextResponse.redirect(destination);
}
