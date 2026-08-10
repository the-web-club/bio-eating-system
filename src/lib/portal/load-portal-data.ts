import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  defaultIntakeDraft,
} from "@/lib/intake/schema";
import type { PlanSlot } from "@/lib/nutrition/plan-engine";
import { AUTHORED_WEEKS, getRotationWeek } from "@/lib/nutrition/rotation";
import { mergeRotationWithPlan } from "@/lib/nutrition/weekly-list";
import {
  parseProfileJson,
  type PortalProfileSummary,
} from "@/lib/portal/profile-summary";

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
  profile: PortalProfileSummary | null;
  plan: PortalPlan | null;
  week: number;
  authoredWeeks: number;
  rotationItems: ReturnType<typeof getRotationWeek>["items"];
  todayAdaptations: number;
  pendingCheckIn: boolean;
  recalibrationDue: boolean;
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

function profileFromDb(profile: {
  age: number;
  weightKg: number;
  goal: string;
  lifestyle: unknown;
  foodPreferences: unknown;
  practical: unknown;
  household: unknown;
  weeklyBudgetEur: number | null;
  declaredAllergens: unknown;
}): PortalProfileSummary {
  const draft = defaultIntakeDraft();
  const allergens = Array.isArray(profile.declaredAllergens)
    ? (profile.declaredAllergens as string[])
    : [];
  return {
    age: profile.age,
    weightKg: profile.weightKg,
    goal: profile.goal,
    lifestyle: parseProfileJson(profile.lifestyle, draft.lifestyle),
    foodPreferences: parseProfileJson(profile.foodPreferences, draft.foodPreferences),
    practical: parseProfileJson(profile.practical, draft.practical),
    household: parseProfileJson(profile.household, draft.household),
    weeklyBudgetEur: profile.weeklyBudgetEur,
    allergenCount: allergens.length,
  };
}

export async function loadPortalData(): Promise<PortalData> {
  const user = await requirePortalUser();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [entitlement, profile, schedule, todayAdaptations, latestCheckIn] =
    await Promise.all([
      db.entitlement.findUnique({ where: { userId: user.id } }),
      db.intakeProfile.findUnique({
        where: { userId: user.id },
        include: {
          plans: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      db.rotationSchedule.findUnique({ where: { userId: user.id } }),
      db.adaptationEvent.count({
        where: { userId: user.id, createdAt: { gte: startOfDay } },
      }),
      db.weeklyCheckIn.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
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

  const cycleYear = now.getFullYear();
  const pendingCheckIn =
    entitlement?.corePlan === true &&
    (!latestCheckIn ||
      latestCheckIn.cycleYear !== cycleYear ||
      latestCheckIn.weekNumber !== week);

  const daysSincePlan =
    plan != null
      ? (now.getTime() - plan.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      : 0;
  const recalibrationDue = daysSincePlan >= 14;

  return {
    user: { id: user.id, email: user.email, name: user.name },
    entitlements,
    hasProfile: Boolean(profile),
    profile: profile ? profileFromDb(profile) : null,
    plan,
    week,
    authoredWeeks: AUTHORED_WEEKS,
    rotationItems,
    todayAdaptations,
    pendingCheckIn,
    recalibrationDue,
  };
}
