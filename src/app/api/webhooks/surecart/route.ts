import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendTransactional } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Purchase webhook. Grants entitlements.
 *
 * The previous draft checked only that a signature header was PRESENT, which
 * meant any anonymous POST could grant paid access. This verifies an HMAC over
 * the raw body, enforces a timestamp window against replay, and is idempotent
 * on the provider event id.
 */

const TIMESTAMP_WINDOW_SECONDS = 300;

const payloadSchema = z.object({
  event_id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  sku: z.string().min(1),
  locale: z.enum(["EN", "FI"]).optional(),
});

/** SKU to entitlement mapping. The only place this lives. */
const SKU_ENTITLEMENTS: Record<
  string,
  { corePlan: boolean; weeklyRotation: boolean; labReference: boolean }
> = {
  CORE_PLAN: { corePlan: true, weeklyRotation: false, labReference: false },
  CORE_PLAN_BUNDLE: { corePlan: true, weeklyRotation: true, labReference: true },
  WEEKLY_ROTATION: { corePlan: false, weeklyRotation: true, labReference: false },
  LAB_REFERENCE: { corePlan: false, weeklyRotation: false, labReference: true },
};

function verifySignature(raw: string, header: string | null): boolean {
  if (!header) return false;

  // Expected header format: "t=<unix>,v1=<hex>"
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
  // Capture the raw body FIRST. Parsing consumes the stream and any
  // re-serialisation would produce a different byte sequence than was signed.
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

  const grants = SKU_ENTITLEMENTS[sku];
  if (!grants) {
    // Record it so an unmapped SKU is visible rather than silently dropped.
    await db.webhookEvent.create({
      data: {
        provider: "surecart",
        providerEventId: event_id,
        payloadHash: createHash("sha256").update(raw).digest("hex"),
        error: `unmapped sku: ${sku}`,
      },
    }).catch(() => undefined);
    return NextResponse.json({ error: "unmapped sku" }, { status: 422 });
  }

  // Idempotency. A unique constraint on (provider, providerEventId) makes a
  // replay a no-op even under concurrent delivery.
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
      entitlements: { create: grants },
      schedule: { create: { active: grants.weeklyRotation } },
    },
    update: {},
    select: { id: true, email: true, name: true },
  });

  // Entitlements accumulate. A later single-product purchase must not revoke
  // access granted by an earlier bundle.
  await db.entitlement.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...grants },
    update: {
      corePlan: grants.corePlan ? true : undefined,
      weeklyRotation: grants.weeklyRotation ? true : undefined,
      labReference: grants.labReference ? true : undefined,
    },
  });

  if (grants.weeklyRotation) {
    await db.rotationSchedule.upsert({
      where: { userId: user.id },
      create: { userId: user.id, active: true },
      update: { active: true },
    });
  }

  await db.auditEvent.create({
    data: {
      userId: user.id,
      action: "entitlement.granted",
      actor: "webhook:surecart",
      detail: { sku, eventId: event_id },
    },
  });

  if (isNewUser) {
    const result = await sendTransactional({
      to: user.email,
      subject: "Your account is ready",
      html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h1 style="font-size:20px;font-weight:600;margin:0 0 12px">Welcome, ${user.name}</h1>
        <p style="font-size:15px;line-height:1.6;color:#3d3d3d;margin:0 0 24px">Your account is set up. Answer a few questions and we will put your plan together.</p>
        <a href="${env.NEXT_PUBLIC_APP_URL}/portal/intake" style="display:inline-block;background:#3f6b4a;color:#ffffff;padding:14px 28px;border-radius:8px;font-size:15px;text-decoration:none">Start your intake</a>
      </div>`,
    });
    if (!result.ok) {
      // A failed welcome email must not fail the purchase.
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

  await db.webhookEvent.update({
    where: { provider_providerEventId: { provider: "surecart", providerEventId: event_id } },
    data: { processedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
