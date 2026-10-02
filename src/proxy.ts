import { NextResponse, type NextRequest } from "next/server";
import { routes, isProtectedPath, signedOutOnlyRoutes } from "@/config/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/auth/redirects";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Runs before every page request (Next 16 "proxy", formerly middleware).
 *
 * 1. Keeps the Supabase session fresh.
 * 2. Optimistic redirects: signed-out visitors to protected areas go to
 *    sign-in (and come back afterwards); signed-in visitors skip sign-in/up.
 *
 * This is a convenience layer, not the security boundary: the (app) layout and
 * every data access verify the user again on the server, and the database
 * enforces Row Level Security.
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next();

  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!userId && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = routes.signIn;
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return redirectWithCookies(url, response);
  }

  if (userId && (signedOutOnlyRoutes as readonly string[]).includes(pathname)) {
    const url = request.nextUrl.clone();
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    url.pathname = next.split("?")[0];
    url.search = next.includes("?") ? `?${next.split("?")[1]}` : "";
    return redirectWithCookies(url, response);
  }

  return response;
}

/** Redirect while keeping any refreshed auth cookies, so the session isn't lost. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  // Everything except static assets and image files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
