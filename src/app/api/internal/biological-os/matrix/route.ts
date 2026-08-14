import { NextResponse } from "next/server";
import { PRODUCT_SLUGS } from "@/lib/commerce/catalog";
import { userHasProduct } from "@/lib/commerce/grants";
import { isBiologicalOsEngineAllowlisted } from "@/lib/biological-os/engine-allowlist";
import { biologicalOsEngineRunBodySchema } from "@/lib/biological-os/schema";
import { runBiologicalOsEngineForUser } from "@/lib/biological-os/run-engine";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { biologicalOsEngineEnabled } from "@/lib/feature-flags";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!biologicalOsEngineEnabled()) {
    return NextResponse.json({ error: "engine_disabled" }, { status: 503 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  if (!isBiologicalOsEngineAllowlisted(session.user.email)) {
    return NextResponse.json({ error: "not_allowlisted" }, { status: 403 });
  }

  const hasBiologicalOs = await userHasProduct(session.user.id, PRODUCT_SLUGS.biologicalOs);
  if (!hasBiologicalOs) {
    return NextResponse.json({ error: "not_entitled" }, { status: 403 });
  }

  const parsed = biologicalOsEngineRunBodySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_failed",
        fields: parsed.error.issues.map((issue) => issue.path.join(".")),
      },
      { status: 422 },
    );
  }

  const input = parsed.data;

  try {
    const result = await runBiologicalOsEngineForUser({
      db,
      userId: session.user.id,
      profile: {
        age: input.age,
        sex: input.sex,
        bodyWeightKg: input.bodyWeightKg,
        heightCm: input.heightCm,
      },
      excludedAllergens: input.excludedAllergens,
      requiredFoodIds: input.requiredFoodIds,
      hardExcludedFoodIds: input.hardExcludedFoodIds,
      favoriteFoodIds: input.favoriteFoodIds,
      proteinPreference: input.proteinPreference,
      redundancyChoices: input.redundancyChoices,
      dailyLife: input.dailyLife,
      activities: input.activities,
    });

    return NextResponse.json({
      matrixVersionId: result.matrixVersionId,
      version: result.version,
      optimizerStatus: result.pipeline.optimizer.status,
      infeasibleReason: result.pipeline.optimizer.infeasibleReason ?? null,
      missingCategories: result.pipeline.optimizer.missingCategories ?? [],
      uncoveredNutrients: result.pipeline.optimizer.uncoveredNutrients ?? [],
      itemCount: result.pipeline.optimizer.draft.items.length,
      redundancyProposalCount: result.pipeline.redundancyProposals.length,
      isBiologicallyComplete: result.pipeline.adequacyReport.isBiologicallyComplete,
      unresolvedNutrients: result.pipeline.adequacyReport.unresolvedNutrients,
      phytonutrientDiversity: result.pipeline.optimizer.phytonutrientDiversity ?? null,
      energyEstimate: result.pipeline.energyEstimate,
      activityProfile: result.pipeline.activityProfile
        ? {
            baselineOccupationPal: result.pipeline.activityProfile.baselineOccupationPal,
            weeklyExerciseKcal: result.pipeline.activityProfile.weeklyExerciseKcal,
            unresolvedActivityLabels: result.pipeline.activityProfile.unresolvedActivityLabels,
          }
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "engine_run_failed";
    return NextResponse.json({ error: "engine_run_failed", message }, { status: 500 });
  }
}
