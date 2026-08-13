import { describe, expect, it } from "vitest";
import { EMAIL_BUTTON, EMAIL_PALETTE, EMAIL_RADIUS } from "@/lib/emails/palette";
import {
  magicLinkEmailHtml,
  welcomeEmailHtml,
  weeklyListEmailHtml,
} from "@/lib/emails/templates";

const APP = "https://example.com";

describe("email templates", () => {
  it("share the brand palette and shell", () => {
    const magic = magicLinkEmailHtml({
      appUrl: APP,
      url: "https://example.com/link",
    });
    const welcome = welcomeEmailHtml({
      appUrl: APP,
      name: "Ada <script>",
    });
    const weekly = weeklyListEmailHtml({
      appUrl: APP,
      week: 3,
      items: [{ name: "Oats", amount: "200 g" }],
      unsubscribeUrl: "https://example.com/unsubscribe/token",
    });

    for (const html of [magic, welcome, weekly]) {
      expect(html).toContain(EMAIL_PALETTE.canvas);
      expect(html).toContain(EMAIL_PALETTE.accentFill);
      expect(html).toContain(EMAIL_PALETTE.foreground);
      expect(html).toContain("Well with Katarina");
      expect(html).toContain("/brand/well-with-katarina.png");
      expect(html).not.toContain("#007AFF");
      expect(html).not.toContain("#3f6b4a");
      expect(html).not.toContain("9999px");
      expect(html).toContain(`border-radius:${EMAIL_RADIUS.button}`);
      expect(html).toContain(`padding:${EMAIL_BUTTON.paddingY} ${EMAIL_BUTTON.paddingX}`);
      expect(html).toContain(`bgcolor="${EMAIL_PALETTE.accentFill}"`);
    }

    expect(welcome).toContain("Ada &lt;script&gt;");
    expect(welcome).not.toContain("<script>");
    expect(weekly).toContain("Unsubscribe");
    expect(weekly).toContain("Oats");
    expect(magic).toContain("Sign in");
  });
});
