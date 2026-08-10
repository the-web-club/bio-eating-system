import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  generatePlan,
  assertNoAllergenLeak,
  ENGINE_VERSION,
} from "@/lib/nutrition/plan-engine";
import {
  activityFactorForLevel,
  CONSENT_VERSION,
  intakeBodySchema,
} from "@/lib/intake/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const entitlements = await db.entitlement.findUnique({
    where: { userId: session.user.id },
    select: { corePlan: true },
  });
  if (!entitlements?.corePlan) {
    return NextResponse.json({ error: "not_entitled" }, { status: 403 });
  }

  const parsed = intakeBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_failed",
        fields: parsed.error.issues.map((i) => i.path.join(".")),
      },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const consentedAt = new Date();
  const activityLevel = input.lifestyle.activityLevel;

  const profileData = {
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    sex: input.sex,
    goal: input.goal,
    unitSystem: input.unitSystem,
    declaredAllergens: input.declaredAllergens,
    excludedSlots: input.excludedSlots,
    swapRequests: input.swapRequests,
    lifestyle: input.lifestyle as Prisma.InputJsonValue,
    foodPreferences: input.foodPreferences as Prisma.InputJsonValue,
    practical: input.practical as Prisma.InputJsonValue,
    household: input.household as Prisma.InputJsonValue,
    weeklyBudgetEur: input.practical.weeklyBudgetEur ?? null,
    screeningFlags: input.screeningFlags,
    notesForCoach: input.notesForCoach ?? null,
    consentHealthDataAt: consentedAt,
    consentVersion: CONSENT_VERSION,
  };

  const profile = await db.intakeProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...profileData },
    update: profileData,
    select: { id: true },
  });

  await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(input.displayName ? { name: input.displayName.trim() } : {}),
      ...(input.marketingOptIn
        ? { marketingOptIn: true, unsubscribedAt: null }
        : { marketingOptIn: false, unsubscribedAt: new Date() }),
    },
  });

  const engineInput = {
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    sex: input.sex,
    activityFactor: activityFactorForLevel(activityLevel),
    goal: input.goal,
    unitSystem: input.unitSystem,
    declaredAllergens: input.declaredAllergens,
    excludedSlots: input.excludedSlots,
    swapRequests: input.swapRequests,
    screeningFlags: input.screeningFlags,
    foodPreferences: input.foodPreferences,
    practical: input.practical,
    household: input.household,
  };

  const plan = generatePlan(engineInput);
  assertNoAllergenLeak(engineInput, plan);

  if (plan.screening.outcome === "refused") {
    await db.auditEvent.create({
      data: {
        userId: session.user.id,
        action: "plan.refused",
        actor: "engine",
        detail: {
          reasons: plan.screening.reasons,
          policy: plan.screening.policyVersion,
        },
      },
    });
    return NextResponse.json(
      {
        outcome: "refused",
        reasonCodes: plan.screening.reasons,
      },
      { status: 200 },
    );
  }

  await db.generatedPlan.create({
    data: {
      profileId: profile.id,
      engineVersion: ENGINE_VERSION,
      contentVersion: process.env.CONTENT_VERSION ?? "unversioned",
      energyKcal: plan.energyKcal,
      screeningOutcome: plan.screening.outcome,
      screeningReasons: plan.screening.reasons as Prisma.InputJsonValue,
      slots: plan.slots as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    outcome: plan.screening.outcome,
    reasonCodes: plan.screening.reasons,
    energyKcal: plan.energyKcal,
    planId: profile.id,
  });
}
