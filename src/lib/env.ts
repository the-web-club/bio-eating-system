import { z } from "zod";

/**
 * Every secret is required at boot. A `process.env.X || ""` fallback turns a
 * missing secret into a silently disabled security check, which is how the
 * previous draft ended up with an unauthenticated entitlement webhook.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().startsWith("re_"),
  SURECART_WEBHOOK_SECRET: z.string().min(24),
  CRON_SECRET: z.string().min(24),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  MAIL_FROM: z.string().email(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Field names only. Never print values.
  const missing = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
  throw new Error(`Invalid or missing environment variables: ${missing}`);
}

export const env = parsed.data;
