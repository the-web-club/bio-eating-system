import { escapeHtml } from "./escape";
import { EMAIL_FONT, EMAIL_PALETTE as c, EMAIL_RADIUS } from "./palette";

export type EmailCta = {
  label: string;
  href: string;
};

export type EmailDocumentArgs = {
  /** Absolute origin for the brand mark image. */
  appUrl: string;
  /** Inbox preview line; hidden in the opened message. */
  preheader?: string;
  /** Short uppercase eyebrow, at most a few words. */
  eyebrow?: string;
  title: string;
  /** Lead paragraphs under the title. */
  paragraphs?: string[];
  /** Structured block (tables, lists) between copy and the CTA. */
  bodyHtml?: string;
  cta?: EmailCta;
  /** Quiet line under the CTA. */
  footnote?: string;
  /** When set, footer includes a one-click unsubscribe page link. */
  unsubscribeUrl?: string;
};

function brandHeaderHtml(appUrl: string): string {
  const origin = appUrl.replace(/\/$/, "");
  const logoUrl = `${origin}/brand/well-with-katarina.png`;
  return `
    <tr>
      <td style="padding:0 0 20px 0">
        <img
          src="${escapeHtml(logoUrl)}"
          width="148"
          height="71"
          alt="Well with Katarina"
          style="display:block;width:148px;height:auto;border:0;outline:none;text-decoration:none"
        />
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 28px 0;border-bottom:1px solid ${c.hairline};font-size:1px;line-height:1px">&nbsp;</td>
    </tr>`;
}

function ctaHtml(cta: EmailCta): string {
  return `
    <tr>
      <td style="padding:28px 0 0 0">
        <a
          href="${escapeHtml(cta.href)}"
          style="display:inline-block;background:${c.accentFill};color:${c.onAccent};font-family:${EMAIL_FONT};font-size:14px;font-weight:500;line-height:1;text-decoration:none;padding:14px 22px;border-radius:${EMAIL_RADIUS.button}"
        >${escapeHtml(cta.label)}</a>
      </td>
    </tr>`;
}

/**
 * One shell for every outbound message: warm canvas, single white panel,
 * brand mark, hairline, title, copy, optional body, mineral CTA, quiet footer.
 */
export function renderEmailDocument(args: EmailDocumentArgs): string {
  const paragraphs = (args.paragraphs ?? [])
    .map(
      (text, index) => `
        <tr>
          <td style="padding:${index === 0 ? "12px" : "8px"} 0 0 0;font-family:${EMAIL_FONT};font-size:15px;line-height:1.55;color:${c.soft}">
            ${escapeHtml(text)}
          </td>
        </tr>`,
    )
    .join("");

  const eyebrow = args.eyebrow
    ? `
      <tr>
        <td style="padding:28px 0 0 0;font-family:${EMAIL_FONT};font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${c.faint}">
          ${escapeHtml(args.eyebrow)}
        </td>
      </tr>`
    : `
      <tr>
        <td style="padding:28px 0 0 0;font-size:1px;line-height:1px">&nbsp;</td>
      </tr>`;

  const body = args.bodyHtml
    ? `
      <tr>
        <td style="padding:24px 0 0 0">${args.bodyHtml}</td>
      </tr>`
    : "";

  const footnote = args.footnote
    ? `
      <tr>
        <td style="padding:20px 0 0 0;font-family:${EMAIL_FONT};font-size:12px;line-height:1.5;color:${c.muted}">
          ${escapeHtml(args.footnote)}
        </td>
      </tr>`
    : "";

  const unsubscribe = args.unsubscribeUrl
    ? `
      <a href="${escapeHtml(args.unsubscribeUrl)}" style="color:${c.muted};text-decoration:underline">Unsubscribe</a>
      <span style="color:${c.hairline}"> · </span>`
    : "";

  const preheader = args.preheader
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${escapeHtml(args.preheader)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(args.title)}</title>
</head>
<body style="margin:0;padding:0;background:${c.canvas}">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.canvas}">
    <tr>
      <td align="center" style="padding:32px 20px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:${c.surface};border:1px solid ${c.hairline};border-radius:${EMAIL_RADIUS.panel}">
          <tr>
            <td style="padding:36px 32px 40px 32px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${brandHeaderHtml(args.appUrl)}
                ${eyebrow}
                <tr>
                  <td style="padding:8px 0 0 0;font-family:${EMAIL_FONT};font-size:24px;font-weight:500;letter-spacing:-0.02em;line-height:1.25;color:${c.foreground}">
                    ${escapeHtml(args.title)}
                  </td>
                </tr>
                ${paragraphs}
                ${body}
                ${args.cta ? ctaHtml(args.cta) : ""}
                ${footnote}
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">
          <tr>
            <td style="padding:20px 8px 0 8px;font-family:${EMAIL_FONT};font-size:12px;line-height:1.5;color:${c.muted};text-align:center">
              ${unsubscribe}Well with Katarina
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Hairline-separated rows for the weekly list, using the shared palette. */
export function renderEmailDataRows(
  rows: { label: string; value: string }[],
): string {
  if (rows.length === 0) {
    return `<p style="margin:0;font-family:${EMAIL_FONT};font-size:14px;color:${c.muted}">No items for this week.</p>`;
  }

  const cells = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:12px 0;font-family:${EMAIL_FONT};font-size:14px;line-height:1.4;color:${c.foreground};border-bottom:1px solid ${c.hairline}">
          ${escapeHtml(row.label)}
        </td>
        <td style="padding:12px 0 12px 16px;font-family:${EMAIL_FONT};font-size:13px;line-height:1.4;color:${c.muted};text-align:right;white-space:nowrap;border-bottom:1px solid ${c.hairline}">
          ${escapeHtml(row.value)}
        </td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${c.hairline}">${cells}</table>`;
}
