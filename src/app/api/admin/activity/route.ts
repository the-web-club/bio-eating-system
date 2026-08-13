import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Recent audit trail for staff. Detail JSON is returned as stored; writers must not put biometrics in it. */
export async function GET(request: Request) {
  const { admin, response } = await requireAdminApiSession(request);
  if (!admin) return response;

  const url = new URL(request.url);
  const take = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 100);
  const userId = url.searchParams.get("userId")?.trim() || undefined;

  const events = await db.auditEvent.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      userId: true,
      action: true,
      actor: true,
      detail: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
    },
  });

  return NextResponse.json({
    events: events.map((event) => ({
      id: event.id,
      userId: event.userId,
      email: event.user?.email ?? null,
      name: event.user?.name ?? null,
      action: event.action,
      actor: event.actor,
      detail: event.detail,
      createdAt: event.createdAt.toISOString(),
    })),
  });
}
