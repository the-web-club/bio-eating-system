import { isAdminEmail } from "@/lib/admin-allowlist";
import { isSignupAllowlisted, normalizeEmail } from "@/lib/signup-allowlist";

/**
 * Internal Biological OS engine testers. Uses the signup and admin allowlists
 * until a dedicated env-backed list is warranted.
 */
export function isBiologicalOsEngineAllowlisted(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  return isSignupAllowlisted(normalized) || isAdminEmail(normalized);
}
