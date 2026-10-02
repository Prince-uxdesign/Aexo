"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_SIGNED_IN_ROUTE, routes } from "@/config/routes";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { authErrorMessage } from "./errors";
import { safeNextPath } from "./redirects";
import { getUserId } from "./session";
import { MAX_NAME_LENGTH, validateEmail, validateName, validatePassword } from "./validation";

/**
 * Server Actions behind the auth forms. Each returns a FormState for
 * useActionState, or redirects on success. All input is validated here, on the
 * server; client-side hints are a convenience only.
 */

export type FormState = {
  status: "idle" | "error" | "success";
  /** Form-level message shown above the fields. */
  message?: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;
  /** Values to put back in the form after an error (never passwords). */
  values?: { email?: string; fullName?: string };
};

const NOT_CONFIGURED: FormState = {
  status: "error",
  message: "Accounts aren't available right now. You can still create and download invoices.",
};

const field = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

/** Absolute URL for links in auth emails. Supabase only accepts allow-listed URLs. */
async function emailLinkUrl(next: string) {
  const origin = (await headers()).get("origin") ?? publicEnv.siteUrl;
  return `${origin}${routes.authConfirm}?next=${encodeURIComponent(safeNextPath(next))}`;
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email").trim().toLowerCase();
  const password = field(formData, "password");
  const next = safeNextPath(field(formData, "next"));

  const fieldErrors = {
    email: validateEmail(email),
    password: password ? undefined : "Enter your password.",
  };
  if (fieldErrors.email || fieldErrors.password) {
    return { status: "error", fieldErrors, values: { email } };
  }
  if (!isSupabaseConfigured()) return { ...NOT_CONFIGURED, values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { status: "error", message: authErrorMessage(error, "sign-in"), values: { email } };
  }

  redirect(next);
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = field(formData, "fullName").trim();
  const email = field(formData, "email").trim().toLowerCase();
  const password = field(formData, "password");
  const next = safeNextPath(field(formData, "next"));
  const values = { email, fullName };

  const fieldErrors = {
    fullName: validateName(fullName),
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (fieldErrors.fullName || fieldErrors.email || fieldErrors.password) {
    return { status: "error", fieldErrors, values };
  }
  if (!isSupabaseConfigured()) return { ...NOT_CONFIGURED, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName.slice(0, MAX_NAME_LENGTH) || null },
      emailRedirectTo: await emailLinkUrl(next),
    },
  });

  if (error) {
    return { status: "error", message: authErrorMessage(error, "sign-up"), values };
  }

  // With email confirmation on, Supabase doesn't reveal existing accounts with
  // an error; it returns a user with no identities instead.
  if (data.user && data.user.identities?.length === 0) {
    return {
      status: "error",
      message: "This email is already associated with an account.",
      values,
    };
  }

  // Email confirmation off: signed in immediately.
  if (data.session) redirect(next);

  // Email confirmation on: ask them to check their inbox.
  return { status: "success", values };
}

export async function resendConfirmation(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email").trim().toLowerCase();
  const next = safeNextPath(field(formData, "next"));
  if (validateEmail(email)) return { status: "error", message: "Enter a valid email address." };
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: await emailLinkUrl(next) },
  });
  if (error) return { status: "error", message: authErrorMessage(error, "resend") };
  return { status: "success", message: `We've sent another link to ${email}.` };
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = field(formData, "email").trim().toLowerCase();
  const emailError = validateEmail(email);
  if (emailError) return { status: "error", fieldErrors: { email: emailError }, values: { email } };
  if (!isSupabaseConfigured()) return { ...NOT_CONFIGURED, values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await emailLinkUrl(routes.resetPassword),
  });

  // Only surface errors the person can act on (rate limits, connection). Never
  // reveal whether an account exists for this email.
  if (error && (error.status === 429 || error.name === "AuthRetryableFetchError")) {
    return { status: "error", message: authErrorMessage(error, "reset"), values: { email } };
  }
  if (error) authErrorMessage(error, "reset"); // log only

  return { status: "success", values: { email } };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = field(formData, "password");
  const confirmPassword = field(formData, "confirmPassword");

  const fieldErrors = {
    password: validatePassword(password),
    confirmPassword:
      confirmPassword && confirmPassword === password ? undefined : "Passwords don't match.",
  };
  if (fieldErrors.password || fieldErrors.confirmPassword) return { status: "error", fieldErrors };
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  if (!(await getUserId())) {
    return {
      status: "error",
      message: "This reset link has expired. Request a new one to choose a password.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", message: authErrorMessage(error, "update-password") };

  redirect(`${DEFAULT_SIGNED_IN_ROUTE}?updated=password`);
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = field(formData, "fullName").trim();
  const nameError = validateName(fullName);
  if (nameError)
    return { status: "error", fieldErrors: { fullName: nameError }, values: { fullName } };

  const userId = await getUserId();
  if (!userId) return { status: "error", message: "Your session has ended. Sign in again." };

  const supabase = await createClient();
  // RLS and column grants limit this to the caller's own name.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null })
    .eq("id", userId);

  if (error) {
    console.error("[profile:update]", error.code, error.message);
    return {
      status: "error",
      message: "We couldn't save your profile. Try again.",
      values: { fullName },
    };
  }

  revalidatePath(routes.account);
  return { status: "success", message: "Profile saved.", values: { fullName } };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(routes.home);
}
