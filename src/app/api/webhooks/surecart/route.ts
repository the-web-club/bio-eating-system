import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { z } from "zod";
import { mergeProductGrantsForSku } from "@/lib/commerce/grants";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendWelcomeEmail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMESTAMP_WINDOW_SECONDS = 300;

const payloadSchema = z.object({
  event_id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  sku: z.string().min(1),
  locale: z.enum(["EN", "FI"]).optional(),
});

function verifySignature(raw: string, header: string | null): boolean {
  if (!header) return false;

  const parts = new Map(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()] as const;
    }),
  );

  const timestamp = Number(parts.get("t"));
  const provided = parts.get("v1");
  if (!Number.isFinite(timestamp) || !provided) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (age > TIMESTAMP_WINDOW_SECONDS) return false;

  const expected = createHmac("sha256", env.SURECART_WEBHOOK_SECRET)
    .update(`${timestamp}.${raw}`, "utf8")
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const raw = await request.text();

  if (!verifySignature(raw, request.headers.get("x-webhook-signature"))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "malformed body" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "unexpected payload shape" }, { status: 400 });
  }
  const { event_id, email, name, sku, locale } = parsed.data;

  try {
    await db.webhookEvent.create({
      data: {
        provider: "surecart",
        providerEventId: event_id,
        payloadHash: createHash("sha256").update(raw).digest("hex"),
      },
    });
  } catch {
    return NextResponse.json({ ok: true, deduplicated: true });
  }

  const isNewUser = !(await db.user.findUnique({
    where: { email },
    select: { id: true },
  }));

  const user = await db.user.upsert({
    where: { email },
    create: {
      email,
      name,
      locale: locale ?? "EN",
    },
    update: {},
    select: { id: true, email: true, name: true },
  });

  const purchase = await db.purchase.create({
    data: {
      externalId: event_id,
      userId: user.id,
      currency: "EUR",
      grossCents: 0,
      purchasedAt: new Date(),
      lines: {
        create: [{ sku, quantity: 1 }],
      },
    },
  });

  const grantResult = await mergeProductGrantsForSku({
    userId: user.id,
    sku,
    purchaseId: purchase.id,
    actor: "webhook:surecart",
  });

  if (!grantResult.ok) {
    await db.webhookEvent.update({
      where: {
        provider_providerEventId: { provider: "surecart", providerEventId: event_id },
      },
      data: { error: `unmapped sku: ${sku}` },
    });
    return NextResponse.json({ error: "unmapped sku" }, { status: 422 });
  }

  await db.webhookEvent.update({
    where: { provider_providerEventId: { provider: "surecart", providerEventId: event_id } },
    data: { processedAt: new Date() },
  });

  if (isNewUser) {
    const result = await sendWelcomeEmail({
      to: user.email,
      name: user.name,
    });
    if (!result.ok) {
      await db.auditEvent.create({
        data: {
          userId: user.id,
          action: "email.welcome_failed",
          actor: "webhook:surecart",
          detail: { reason: result.error ?? "unknown" },
        },
      });
    }
  }

  return NextResponse.json({ ok: true, grants: grantResult.slugs });
}
