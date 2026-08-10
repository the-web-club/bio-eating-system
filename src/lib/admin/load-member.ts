import { accessFlagsFromRecord } from "@/lib/admin/access";
import { db } from "@/lib/db";

/**
 * Member detail for staff. Biometrics (age, height, weight, allergens,
 * screening flags) are never selected.
 */
export async function loadAdminMember(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      locale: true,
      createdAt: true,
      emailVerified: true,
      marketingOptIn: true,
      unsubscribedAt: true,
      entitlements: true,
      schedule: true,
      profile: {
        select: {
          id: true,
          goal: true,
          unitSystem: true,
          notesForCoach: true,
          consentVersion: true,
          consentHealthDataAt: true,
          createdAt: true,
          plans: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              energyKcal: true,
              screeningOutcome: true,
              engineVersion: true,
              contentVersion: true,
              createdAt: true,
            },
          },
        },
      },
      emailDrops: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          weekNumber: true,
          cycleYear: true,
          sentAt: true,
          failedAt: true,
          failure: true,
        },
      },
      auditLog: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          action: true,
          actor: true,
          detail: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    locale: user.locale,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
    marketingOptIn: user.marketingOptIn,
    unsubscribedAt: user.unsubscribedAt,
    access: accessFlagsFromRecord(user.entitlements),
    schedule: user.schedule,
    intake: user.profile
      ? {
          goal: user.profile.goal,
          unitSystem: user.profile.unitSystem,
          notesForCoach: user.profile.notesForCoach,
          consentVersion: user.profile.consentVersion,
          consentHealthDataAt: user.profile.consentHealthDataAt,
          createdAt: user.profile.createdAt,
          plans: user.profile.plans,
        }
      : null,
    emailDrops: user.emailDrops,
    auditLog: user.auditLog,
  };
}
