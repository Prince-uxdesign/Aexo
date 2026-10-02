/**
 * Every app URL lives here so links never hardcode paths.
 * Built so far: the landing page, auth pages and the account page. The rest are
 * the planned route map. See docs/ARCHITECTURE.md for the matching route groups.
 */
export const routes = {
  home: "/",

  // Landing page sections
  landing: {
    howItWorks: "/#how-it-works",
    templates: "/#templates",
    features: "/#features",
  },

  // Public: invoice creation works without an account (§16).
  createInvoice: "/create",
  createInvoiceWith: (template: string) => `/create?template=${encodeURIComponent(template)}`,
  sharedInvoice: (shareId: string) => `/i/${encodeURIComponent(shareId)}`,

  // Auth
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  /** Email links (confirm sign-up, password recovery) land here. */
  authConfirm: "/auth/confirm",

  // Account area (requires sign-in)
  account: "/account",
  dashboard: "/dashboard",
  invoices: "/invoices",
  invoice: (id: string) => `/invoices/${encodeURIComponent(id)}`,
  templates: "/templates",

  // Development only
  foundation: "/foundation",
} as const;

/** Where people land after signing in when nothing else was requested. */
export const DEFAULT_SIGNED_IN_ROUTE = routes.dashboard;

/**
 * Areas that need a signed-in user. The proxy redirects signed-out visitors
 * to sign-in, and the (app) layout checks again on the server.
 */
export const protectedPrefixes = [routes.account, routes.dashboard, routes.invoices];

/** Pages for signed-out visitors; signed-in visitors are sent on. */
export const signedOutOnlyRoutes = [routes.signIn, routes.signUp, routes.forgotPassword];

export function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
