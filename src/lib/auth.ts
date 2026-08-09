import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendMagicLinkEmail } from "@/lib/mail";

/**
 * Session length: 7 days.
 * Portal use is infrequent (weekly list, occasional plan review). A short
 * session would force daily re-auth for a health product; longer than a week
 * leaves a browser cookie open too long on a shared device. Rolling update
 * once per day of activity keeps active users signed in without extending a
 * abandoned session forever.
 */
const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;
const MAGIC_LINK_EXPIRES_IN_SECONDS = 60 * 10;

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "mysql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  session: {
    expiresIn: SESSION_EXPIRES_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/",
    },
  },
  user: {
    additionalFields: {
      locale: {
        type: "string",
        defaultValue: "EN",
        required: false,
        input: false,
      },
      marketingOptIn: {
        type: "boolean",
        defaultValue: false,
        required: false,
        input: false,
      },
      unsubscribedAt: {
        type: "date",
        required: false,
        input: false,
      },
      unsubscribeToken: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    magicLink({
      // Accounts are created by webhook or seed, never by open sign-up.
      disableSignUp: true,
      expiresIn: MAGIC_LINK_EXPIRES_IN_SECONDS,
      sendMagicLink: async ({ email, url }) => {
        const result = await sendMagicLinkEmail({ to: email, url });
        if (!result.ok) {
          throw new Error(result.error ?? "magic link send failed");
        }
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
