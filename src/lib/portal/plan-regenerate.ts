import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  generatePlan,
  assertNoAllergenLeak,
  ENGINE_VERSION,
  SWAP_TARGET,
  type FoodSlot,
} from "@/lib/nutrition/plan-engine";
import { ACTIVITY_FACTORS, defaultIntakeDraft } from "@/lib/intake/schema";
import { parseProfileJson } from "@/lib/portal/profile-summary";
import type { Prisma } from "@/generated/prisma/client";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("unauthenticated");
  return session.user.id;
}

export async function loadProfileForEngine(userId: string) {
  const profile = await db.intakeProfile.findUnique({
    where: { userId },
  });
  if (!profile) throw new Error("no_profile");

  const draft = defaultIntakeDraft();
  const lifestyle = parseProfileJson(profile.lifestyle, draft.lifestyle);
  const foodPreferences = parseProfileJson(
    profile.foodPreferences,
    draft.foodPreferences,
  );
  const practical = parseProfileJson(profile.practical, draft.practical);

  return {
    profile,
    engineInput: {
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      sex: profile.sex as "female" | "male",
      activityFactor: ACTIVITY_FACTORS[lifestyle.activityLevel],
      goal: profile.goal as "REDUCE" | "MAINTAIN" | "INCREASE",
      unitSystem: profile.unitSystem as "METRIC" | "HOUSEHOLD" | "SIMPLE",
      declaredAllergens: profile.declaredAllergens as never[],
      excludedSlots: profile.excludedSlots as FoodSlot[],
      swapRequests: profile.swapRequests as FoodSlot[],
      screeningFlags: profile.screeningFlags as never[],
      foodPreferences,
      practical,
    },
  };
}

export async function regeneratePlan(userId: string, extraSwaps: FoodSlot[] = []) {
  const { profile, engineInput } = await loadProfileForEngine(userId);
  const swapRequests = [
    ...new Set([...engineInput.swapRequests, ...extraSwaps]),
  ] as FoodSlot[];

  const plan = generatePlan({ ...engineInput, swapRequests });
  assertNoAllergenLeak({ ...engineInput, swapRequests }, plan);

  if (plan.screening.outcome === "refused") {
    throw new Error("plan_refused");
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

  return plan;
}

export function replacementOptions(slot: FoodSlot, blocked: Set<FoodSlot>) {
  const primary = SWAP_TARGET[slot];
  const options: { slot: FoodSlot; label: string; tier: string }[] = [];
  if (primary && !blocked.has(primary)) {
    options.push({ slot: primary, label: "Best match", tier: "best" });
  }
  if (slot === "small_fish" && !blocked.has("muscle_meat")) {
    options.push({ slot: "muscle_meat", label: "Easy", tier: "easy" });
  }
  if (!blocked.has("eggs") && slot !== "eggs") {
    options.push({ slot: "eggs", label: "Vegetarian protein", tier: "veg" });
  }
  return options;
}
