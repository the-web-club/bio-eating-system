import { Resend } from "resend";
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
const MAIL_FROM_NAME = "Well With Katarina";
const FROM_ADDRESS = `${MAIL_FROM_NAME} <${env.MAIL_FROM}>`;

/** Inline colours for email HTML only. Mail clients ignore CSS custom properties. */
export const MAGIC_LINK_EMAIL_COLOURS = {
  text: "#171717",
  muted: "#6E6E73",
  buttonBg: "#007AFF",
  buttonText: "#ffffff",
  unsubscribe: "#6E6E73",
} as const;

export interface SendResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

function unsubscribeUrl(token: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}/unsubscribe/${token}`;
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

/**
 * Magic-link sign-in mail. Builds HTML here so hex stays in this module.
 */
export async function sendMagicLinkEmail(args: {
  to: string;
  url: string;
}): Promise<SendResult> {
  const c = MAGIC_LINK_EMAIL_COLOURS;
  const html = `<div style="font-family:sans-serif;color:${c.text};line-height:1.5">
  <p style="margin:0 0 16px">Use this link to sign in. It expires in 10 minutes.</p>
  <p style="margin:0 0 24px">
    <a href="${args.url}" style="display:inline-block;background:${c.buttonBg};color:${c.buttonText};text-decoration:none;padding:12px 20px;border-radius:9999px">
      Sign in
    </a>
  </p>
  <p style="margin:0;font-size:12px;color:${c.muted}">If you did not ask for this, you can ignore the email.</p>
</div>`;

  return sendTransactional({
    to: args.to,
    subject: "Your sign-in link",
    html,
  });
}

/**
 * Marketing and recurring content. Always carries a working unsubscribe link
 * and List-Unsubscribe headers. rules.md §6.1.
 */
export async function sendWithUnsubscribe(args: {
  to: string;
  subject: string;
  html: string;
  unsubscribeToken: string;
}): Promise<SendResult> {
  const url = unsubscribeUrl(args.unsubscribeToken);
  const c = MAGIC_LINK_EMAIL_COLOURS;
  const html = `${args.html}
<div style="margin-top:32px;font-size:12px;color:${c.unsubscribe};text-align:center">
  <a href="${url}" style="color:${c.unsubscribe}">Unsubscribe from these emails</a>
</div>`;

  try {
    const { data, error } = await client.emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      subject: args.subject,
      html,
      headers: {
        "List-Unsubscribe": `<${url}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, providerId: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
