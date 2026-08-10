import { renderEmailDataRows, renderEmailDocument } from "./layout";

export function magicLinkEmailHtml(args: { appUrl: string; url: string }): string {
  return renderEmailDocument({
    appUrl: args.appUrl,
    preheader: "Your sign-in link expires in 10 minutes.",
    eyebrow: "Sign in",
    title: "Your sign-in link",
    paragraphs: [
      "Open this link on this device to continue. It expires in 10 minutes.",
    ],
    cta: { label: "Sign in", href: args.url },
    footnote: "If you did not ask for this, you can ignore the email.",
  });
}

export function welcomeEmailHtml(args: { appUrl: string; name: string }): string {
  const origin = args.appUrl.replace(/\/$/, "");
  return renderEmailDocument({
    appUrl: args.appUrl,
    preheader: "Your account is ready. Start with a short intake.",
    eyebrow: "Welcome",
    title: `Hello, ${args.name}`,
    paragraphs: [
      "Your account is set up. Answer a few questions and we will put your plan together.",
    ],
    cta: {
      label: "Start your intake",
      href: `${origin}/portal/intake`,
    },
  });
}

export function weeklyListEmailHtml(args: {
  appUrl: string;
  week: number;
  items: { name: string; amount: string }[];
  unsubscribeUrl: string;
}): string {
  const origin = args.appUrl.replace(/\/$/, "");
  return renderEmailDocument({
    appUrl: args.appUrl,
    preheader: `Week ${args.week} shopping list is ready.`,
    eyebrow: `Week ${args.week}`,
    title: "Your shopping list",
    paragraphs: [
      "Everything for this week in one place. Open the portal when you want the full plan.",
    ],
    bodyHtml: renderEmailDataRows(
      args.items.map((item) => ({ label: item.name, value: item.amount })),
    ),
    cta: {
      label: "Open your plan",
      href: `${origin}/portal`,
    },
    unsubscribeUrl: args.unsubscribeUrl,
  });
}
