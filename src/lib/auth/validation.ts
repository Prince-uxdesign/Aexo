/**
 * Field rules shared by the auth forms (client hints) and Server Actions
 * (the real check). Each returns a human message, or undefined when valid.
 */

export const MIN_PASSWORD_LENGTH = 8;
// bcrypt, used by Supabase Auth, ignores bytes beyond 72.
const MAX_PASSWORD_BYTES = 72;
export const MAX_NAME_LENGTH = 120;

export function validateEmail(email: string) {
  if (!email) return "Enter your email address.";
  // Deliberately loose: the confirmation email is the real check.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validatePassword(password: string) {
  if (!password) return "Choose a password.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return "That password is too long. Use 72 characters or fewer.";
  }
  return undefined;
}

export function validateName(name: string) {
  if (name.length > MAX_NAME_LENGTH) return `Keep your name under ${MAX_NAME_LENGTH} characters.`;
  return undefined;
}
