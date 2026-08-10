import { Resend } from "resend";
import { EMAIL_PALETTE } from "./emails/palette";
import {
  magicLinkEmailHtml,
  welcomeEmailHtml,
  weeklyListEmailHtml,
} from "./emails/templates";
import { env } from "./env";

/**
 * The only module that talks to Resend. Routes call these helpers.
 *
 * Note the package name: `resend`, class `Resend`. The previous draft imported
 * `{ resend } from '@resend/node'`, which does not exist.
 */
const client = new Resend(env.RESEND_API_KEY);

/**
 * MAIL_FROM is validated as a bare address, so the display name is composed
 * here instead of being stored in configuration.
 */
const MAIL_FROM_NAME = "Well with Katarina";
const FROM_ADDRESS = `${MAIL_FROM_NAME} <${env.MAIL_FROM}>`;

/** Re-export for audits: the single hex palette used by every email template. */
export { EMAIL_PALETTE };

/** @deprecated Use EMAIL_PALETTE. */
export const MAGIC_LINK_EMAIL_COLOURS = EMAIL_PALETTE;

export interface SendResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

/** Visible link in the email body. Opens a confirmation page. */
function unsubscribePageUrl(token: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}/unsubscribe/${token}`;
}

/**
 * List-Unsubscribe header target. Mail clients one-click POST here
 * (RFC 8058). Kept as an API route because a page segment cannot also expose POST.
 */
function unsubscribeApiUrl(token: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}/api/unsubscribe/${token}`;
}

/**
 * Transactional: account, login, receipt. No unsubscribe link, because the
 * person cannot opt out of being told their account exists.
 */
export async function sendTransactional(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  try {
    const { data, error } = await client.emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, providerId: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

/** Magic-link sign-in. Uses the shared email shell. */
export async function sendMagicLinkEmail(args: {
  to: string;
  url: string;
}): Promise<SendResult> {
  return sendTransactional({
    to: args.to,
    subject: "Your sign-in link",
    html: magicLinkEmailHtml({
      appUrl: env.NEXT_PUBLIC_APP_URL,
      url: args.url,
    }),
  });
}

/** Welcome after first purchase (or equivalent account creation). */
export async function sendWelcomeEmail(args: {
  to: string;
  name: string;
}): Promise<SendResult> {
  return sendTransactional({
    to: args.to,
    subject: "Your account is ready",
    html: welcomeEmailHtml({
      appUrl: env.NEXT_PUBLIC_APP_URL,
      name: args.name,
    }),
  });
}

/**
 * Marketing and recurring content. Always carries a working unsubscribe link
 * and List-Unsubscribe headers. rules.md §6.1.
 *
 * `html` must already include a visible unsubscribe link built from the same
 * token (see sendWeeklyListEmail).
 */
export async function sendWithUnsubscribe(args: {
  to: string;
  subject: string;
  html: string;
  unsubscribeToken: string;
}): Promise<SendResult> {
  const apiUrl = unsubscribeApiUrl(args.unsubscribeToken);

  try {
    const { data, error } = await client.emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      subject: args.subject,
      html: args.html,
      headers: {
        "List-Unsubscribe": `<${apiUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, providerId: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

/** Weekly shopping list on the shared shell, with unsubscribe in the footer. */
export async function sendWeeklyListEmail(args: {
  to: string;
  unsubscribeToken: string;
  week: number;
  items: { name: string; amount: string }[];
}): Promise<SendResult> {
  const unsubscribeUrl = unsubscribePageUrl(args.unsubscribeToken);
  return sendWithUnsubscribe({
    to: args.to,
    subject: `Your shopping list, week ${args.week}`,
    unsubscribeToken: args.unsubscribeToken,
    html: weeklyListEmailHtml({
      appUrl: env.NEXT_PUBLIC_APP_URL,
      week: args.week,
      items: args.items,
      unsubscribeUrl,
    }),
  });
}
