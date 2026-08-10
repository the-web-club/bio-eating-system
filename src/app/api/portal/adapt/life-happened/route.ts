import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { LIFE_HAPPENED_NEXT } from "@/lib/content/labels";
import { lifeHappenedReasonSchema } from "@/lib/intake/schema";

export const runtime = "nodejs";

const bodySchema = z.object({
  reason: lifeHappenedReasonSchema,
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

  const { reason } = parsed.data;

  await db.adaptationEvent.create({
    data: {
      userId: session.user.id,
      type: "life_happened",
      reason,
      context: {},
    },
  });

  return NextResponse.json({
    ok: true,
    nextAction: LIFE_HAPPENED_NEXT[reason],
  });
}
