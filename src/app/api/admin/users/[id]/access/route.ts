import { NextResponse } from "next/server";
import { z } from "zod";
import { accessFlagsFromRecord, accessFlagsSchema } from "@/lib/admin/access";
import { adminActor, requireAdminApiSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  access: accessFlagsSchema,
  note: z.string().max(500).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Staff grant/revoke of product access. The only non-webhook writer of these
 * flags. Always audited. Never accepts a client body without the staff gate.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { admin, response } = await requireAdminApiSession(request);
  if (!admin) return response;

  const { id: userId } = await context.params;
  if (!userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      entitlements: true,
    },
  });
  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const before = accessFlagsFromRecord(target.entitlements);
  const after = parsed.data.access;

  await db.$transaction(async (tx) => {
    await tx.entitlement.upsert({
      where: { userId },
      create: { userId, ...after },
      update: after,
    });

    if (after.weeklyRotation) {
      await tx.rotationSchedule.upsert({
        where: { userId },
        create: { userId, active: true },
        update: { active: true },
      });
    } else if (target.entitlements) {
      await tx.rotationSchedule.updateMany({
        where: { userId },
        data: { active: false },
      });
    }

    await tx.auditEvent.create({
      data: {
        userId,
        action: "access.updated",
        actor: adminActor(admin.id),
        detail: {
          before,
          after,
          note: parsed.data.note ?? null,
        },
      },
    });
  });

  return NextResponse.json({ access: after });
}
