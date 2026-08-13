import { NextResponse } from "next/server";
import { z } from "zod";
import { accessFlagsFromRecord, accessFlagsSchema } from "@/lib/admin/access";
import { adminActor, requireAdminApiSession } from "@/lib/admin-session";
import { legacySlugsFromAccessFlags, setUserProductGrants } from "@/lib/commerce/grants";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  access: accessFlagsSchema,
  note: z.string().max(500).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Staff grant/revoke of product access via entitlement grants.
 * Legacy flags in the request body are mapped to product slugs.
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
  const activeSlugs = legacySlugsFromAccessFlags(after);

  try {
    await setUserProductGrants({
      userId,
      activeSlugs,
      actor: adminActor(admin.id),
      note: parsed.data.note,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("unknown_product:")) {
      return NextResponse.json({ error: "catalog_not_seeded" }, { status: 503 });
    }
    throw error;
  }

  return NextResponse.json({ access: after, before, slugs: activeSlugs });
}
