import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePortalApiSession } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const eraseBodySchema = z.object({
  confirm: z.literal("DELETE"),
});

/**
 * Hard-delete the signed-in account. Cascades remove sessions, profile, plans,
 * schedule, entitlements and email drops. Audit rows keep the action with
 * userId cleared (SetNull).
 */
export async function DELETE(request: Request) {
  const { session, response } = await requirePortalApiSession(request);
  if (!session) return response;

  const parsed = eraseBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "confirmation_required", fields: ["confirm"] },
      { status: 422 },
    );
  }

  const userId = session.user.id;

  await db.$transaction(async (tx) => {
    await tx.auditEvent.create({
      data: {
        userId,
        action: "account.erased",
        actor: "user",
        detail: {},
      },
    });
    await tx.user.delete({ where: { id: userId } });
  });

  return NextResponse.json({ ok: true });
}
