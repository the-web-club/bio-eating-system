/**
 * Addresses allowed to create an account via magic link without a purchase
 * webhook. Everyone else still needs an existing user (webhook or seed).
 *
 * Keep this list short. Prefer SureCart for real customers.
 */
const SIGNUP_ALLOWLIST = [
  "contact@katarina2.com",
  "info@rikderks.nl",
  "katarina.kakkonen@gmail.com",
] as const;

const ALLOWLIST_SET = new Set<string>(SIGNUP_ALLOWLIST);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSignupAllowlisted(email: string): boolean {
  return ALLOWLIST_SET.has(normalizeEmail(email));
}

/** Display name from the local part until the person edits their profile. */
export function displayNameFromEmail(email: string): string {
  const local = normalizeEmail(email).split("@")[0] ?? "Member";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
