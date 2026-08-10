import { CANONICAL_APP_ORIGIN } from "@/lib/app-origin";
import { env } from "@/lib/env";

/**
 * Origins Better Auth accepts for CSRF checks and callback URLs.
 *
 * The browser Origin must match one of these on POST /api/auth/sign-in/magic-link.
 * A mismatch returns 403 even when the email is allowlisted.
 */
export function buildTrustedOrigins(): string[] {
  const origins = new Set<string>([
    env.NEXT_PUBLIC_APP_URL,
    env.BETTER_AUTH_URL,
    CANONICAL_APP_ORIGIN,
  ]);

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`);
  }

  if (env.NODE_ENV === "development") {
    // Next.js also serves on 127.0.0.1, alternate ports, and the LAN "Network" URL.
    origins.add("http://localhost:*");
    origins.add("http://127.0.0.1:*");
    origins.add("http://192.168.*:*");
    origins.add("http://10.*:*");
  }

  return [...origins];
}
