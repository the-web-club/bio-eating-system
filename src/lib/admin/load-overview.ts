import { db } from "@/lib/db";

export async function loadAdminOverview() {
  const [
    memberCount,
    withPlanAccess,
    withWeekly,
    intakeComplete,
    recentEvents,
    failedDrops,
    webhookErrors,
  ] = await Promise.all([
    db.user.count(),
    db.entitlement.count({ where: { corePlan: true } }),
    db.entitlement.count({ where: { weeklyRotation: true } }),
    db.intakeProfile.count(),
    db.auditEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        action: true,
        actor: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
    db.emailDrop.findMany({
      where: { failedAt: { not: null }, sentAt: null },
      orderBy: { failedAt: "desc" },
      take: 8,
      select: {
        id: true,
        weekNumber: true,
        cycleYear: true,
        failedAt: true,
        failure: true,
        user: { select: { email: true } },
      },
    }),
    db.webhookEvent.findMany({
      where: { error: { not: null } },
      orderBy: { receivedAt: "desc" },
      take: 8,
      select: {
        id: true,
        provider: true,
        providerEventId: true,
        error: true,
        receivedAt: true,
      },
    }),
  ]);

  return {
    counts: {
      members: memberCount,
      withPlanAccess,
      withWeekly,
      intakeComplete,
    },
    recentEvents,
    failedDrops,
    webhookErrors,
  };
}
