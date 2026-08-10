import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePortalApiSession } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Subject-access / portability export. Returns the caller's stored account
 * data as JSON. Never logs the payload.
 */
export async function GET(request: Request) {
  const { session, response } = await requirePortalApiSession(request);
  if (!session) return response;

  const userId = session.user.id;

  const [user, entitlement, profile, schedule, emailDrops, auditLog] =
    await Promise.all([
      db.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          locale: true,
          emailVerified: true,
          marketingOptIn: true,
          unsubscribedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.entitlement.findUnique({ where: { userId } }),
      db.intakeProfile.findUnique({
        where: { userId },
        include: {
          plans: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              engineVersion: true,
              contentVersion: true,
              energyKcal: true,
              screeningOutcome: true,
              screeningReasons: true,
              slots: true,
              createdAt: true,
            },
          },
        },
      }),
      db.rotationSchedule.findUnique({ where: { userId } }),
      db.emailDrop.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          weekNumber: true,
          cycleYear: true,
          sentAt: true,
          failedAt: true,
          createdAt: true,
        },
      }),
      db.auditEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          actor: true,
          detail: true,
          createdAt: true,
        },
      }),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    user,
    entitlement,
    profile,
    schedule,
    emailDrops,
    auditLog,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="well-with-katarina-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
