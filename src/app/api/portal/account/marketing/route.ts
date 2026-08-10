import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePortalApiSession } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  marketingOptIn: z.boolean(),
});

/**
 * Explicit marketing / weekly-email preference. Opting in clears a prior
 * unsubscribe timestamp so a later re-subscribe can receive drops again.
 * Opting out stamps unsubscribedAt and matches the cron exclusion filter.
 */
export async function PATCH(request: Request) {
  const { session, response } = await requirePortalApiSession(request);
  if (!session) return response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", fields: ["marketingOptIn"] },
      { status: 422 },
    );
  }

  const { marketingOptIn } = parsed.data;

  const user = await db.user.update({
    where: { id: session.user.id },
    data: marketingOptIn
      ? { marketingOptIn: true, unsubscribedAt: null }
      : { marketingOptIn: false, unsubscribedAt: new Date() },
    select: { marketingOptIn: true, unsubscribedAt: true },
  });

  await db.auditEvent.create({
    data: {
      userId: session.user.id,
      action: marketingOptIn ? "marketing.opt_in" : "marketing.opt_out",
      actor: "user",
      detail: {},
    },
  });

  return NextResponse.json({
    marketingOptIn: user.marketingOptIn,
    unsubscribedAt: user.unsubscribedAt,
  });
}
