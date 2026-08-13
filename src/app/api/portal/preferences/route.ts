import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  key: z.string().min(1).max(64),
  tier: z.enum(["hard", "normal", "optimization"]),
  value: z.unknown(),
  accept: z.boolean(),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  if (!parsed.data.accept) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await db.preferenceRecord.upsert({
    where: {
      userId_key: { userId: session.user.id, key: parsed.data.key },
    },
    create: {
      userId: session.user.id,
      key: parsed.data.key,
      tier: parsed.data.tier,
      value: parsed.data.value as object,
    },
    update: {
      tier: parsed.data.tier,
      value: parsed.data.value as object,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const events = await db.adaptationEvent.findMany({
    where: { userId: session.user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const { detectAdaptationPrompts } = await import("@/lib/portal/pattern-detection");
  const existing = await db.preferenceRecord.findMany({
    where: { userId: session.user.id },
    select: { key: true },
  });
  const existingKeys = new Set(existing.map((p) => p.key));

  const prompts = detectAdaptationPrompts(events).filter(
    (p) => !existingKeys.has(p.preferenceKey),
  );

  return NextResponse.json({ prompts });
}
