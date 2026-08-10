import { normalizeEmail } from "@/lib/signup-allowlist";

/**
 * Staff who may open /admin. Separate from signup allowlist so the two
 * concerns can diverge later without a schema role column.
 */
const ADMIN_ALLOWLIST = [
  "contact@katarina2.com",
  "info@rikderks.nl",
] as const;

const ADMIN_SET = new Set<string>(ADMIN_ALLOWLIST);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_SET.has(normalizeEmail(email));
}
