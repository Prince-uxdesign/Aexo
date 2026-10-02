/**
 * Turn Supabase Auth errors into calm, human messages (guide §21).
 * Raw backend messages never reach the screen; unknown errors get a generic
 * line and are logged on the server for debugging.
 */

type AuthErrorLike = { code?: string; status?: number; message?: string; name?: string } | null;

const messages: Record<string, string> = {
  invalid_credentials: "That email or password doesn't look right.",
  user_already_exists: "This email is already associated with an account.",
  email_exists: "This email is already associated with an account.",
  weak_password:
    "Your password needs to be stronger. Use at least 8 characters, mixing letters and numbers.",
  same_password: "Choose a password you haven't used for this account before.",
  email_not_confirmed: "Confirm your email first. Check your inbox for the link we sent.",
  email_address_invalid: "Enter a valid email address.",
  validation_failed: "Check the details you entered and try again.",
  signup_disabled: "New accounts can't be created right now. Try again later.",
  over_email_send_rate_limit: "We've sent several emails already. Wait a minute, then try again.",
  over_request_rate_limit: "Too many attempts. Wait a minute, then try again.",
  otp_expired: "This link has expired. Request a new one.",
  flow_state_expired: "This link has expired. Request a new one.",
  bad_code_verifier: "Open the link in the same browser you used to request it.",
  session_not_found: "Your session has ended. Sign in again.",
  user_not_found: "We couldn't find that account.",
};

export const GENERIC_AUTH_ERROR = "Something went wrong on our side. Try again in a moment.";

export function authErrorMessage(error: AuthErrorLike, context?: string): string {
  if (!error) return GENERIC_AUTH_ERROR;
  if (error.code && messages[error.code]) return messages[error.code];
  if (error.status === 429) return messages.over_request_rate_limit;
  if (error.name === "AuthRetryableFetchError") {
    return "We couldn't reach Aexo. Check your connection and try again.";
  }
  // Unknown: keep the detail in server logs, never on screen.
  console.error(`[auth${context ? `:${context}` : ""}]`, error.code ?? error.status, error.message);
  return GENERIC_AUTH_ERROR;
}
