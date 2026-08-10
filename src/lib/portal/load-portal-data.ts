import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PlanSlot } from "@/lib/nutrition/plan-engine";
import { AUTHORED_WEEKS, getRotationWeek } from "@/lib/nutrition/rotation";
import { mergeRotationWithPlan } from "@/lib/nutrition/weekly-list";

export type PortalEntitlements = {
  corePlan: boolean;
  weeklyRotation: boolean;
  labReference: boolean;
  coaching: boolean;
};

export type PortalPlan = {
  energyKcal: number;
  screeningOutcome: string;
  screeningReasons: string[];
  slots: PlanSlot[];
  createdAt: Date;
};

export type PortalData = {
  user: { id: string; email: string; name: string };
  entitlements: PortalEntitlements;
  hasProfile: boolean;
  plan: PortalPlan | null;
  week: number;
  authoredWeeks: number;
  rotationItems: ReturnType<typeof getRotationWeek>["items"];
};

export async function requirePortalUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/?next=/portal");
  }
  return session.user;
}

export async function loadPortalData(): Promise<PortalData> {
  const user = await requirePortalUser();

  const [entitlement, profile, schedule] = await Promise.all([
    db.entitlement.findUnique({ where: { userId: user.id } }),
    db.intakeProfile.findUnique({
      where: { userId: user.id },
      include: {
        plans: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    db.rotationSchedule.findUnique({ where: { userId: user.id } }),
  ]);

  const entitlements: PortalEntitlements = {
    corePlan: entitlement?.corePlan ?? false,
    weeklyRotation: entitlement?.weeklyRotation ?? false,
    labReference: entitlement?.labReference ?? false,
    coaching: entitlement?.coaching ?? false,
  };

  const latest = profile?.plans[0];
  let plan: PortalPlan | null = null;
  if (latest) {
    plan = {
      energyKcal: latest.energyKcal,
      screeningOutcome: latest.screeningOutcome,
      screeningReasons: Array.isArray(latest.screeningReasons)
        ? (latest.screeningReasons as string[])
        : [],
      slots: Array.isArray(latest.slots)
        ? (latest.slots as unknown as PlanSlot[])
        : [],
      createdAt: latest.createdAt,
    };
  }

  const week = schedule?.currentWeek ?? 1;
  const rotation = getRotationWeek(week);
  const rotationItems = mergeRotationWithPlan(rotation.items, plan?.slots ?? null);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    entitlements,
    hasProfile: Boolean(profile),
    plan,
    week,
    authoredWeeks: AUTHORED_WEEKS,
    rotationItems,
  };
}
