import type { ReferenceValueType } from "@/generated/prisma/client";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
  BIOLOGICAL_OS_ENGINE_VERSION,
  DEFAULT_PORTION_GRAMS,
} from "@/lib/biological-os/constants";
import { resolveActivityProfile } from "@/lib/biological-os/activity-profile";
import {
  buildBiologicalAdequacyReport,
  nutrientsWithCompositionData,
} from "@/lib/biological-os/adequacy";
import { buildFilteredCandidateSet } from "@/lib/biological-os/candidate-set";
import { computeEnergyEstimate } from "@/lib/biological-os/energy";
import {
  buildEngineDataVersions,
  nextMatrixVersion,
  snapshotFromOptimizer,
} from "@/lib/biological-os/matrix-versioning";
import { optimizeMinimalFoodSet } from "@/lib/biological-os/optimizer";
import { scorePhytonutrientDiversity } from "@/lib/biological-os/phytonutrient-diversity";
import {
  buildRedundancyProposals,
  detectRedundancyPairs,
} from "@/lib/biological-os/redundancy";
import { resolveEngineRequirements } from "@/lib/biological-os/requirement-resolution";
import type {
  EnginePipelineInput,
  EnginePipelineResult,
  FoodMatrixDraftItem,
} from "@/lib/biological-os/types";
import { categorySlugForFood } from "@/lib/biological-os/optimizer";
import type { StoredRequirementRow } from "@/lib/nutrition/requirements";

function buildFavoriteExtraItems(args: {
  favoriteFoodIds: string[];
  candidates: EnginePipelineInput["candidates"];
  portionGrams: number;
  existingFoodIds: Set<string>;
}): { items: FoodMatrixDraftItem[]; changeReasons: EnginePipelineResult["optimizer"]["changeReasons"] } {
  const items: FoodMatrixDraftItem[] = [];
  const changeReasons: EnginePipelineResult["optimizer"]["changeReasons"] = [];
  let sortOrder = 0;

  for (const foodId of [...new Set(args.favoriteFoodIds)].sort()) {
    if (args.existingFoodIds.has(foodId)) continue;
    const category = categorySlugForFood(foodId, args.candidates);
    if (!category) continue;

    items.push({
      foodId,
      biologicalCategorySlug: category,
      portionGrams: args.portionGrams,
      preference: "SOFT_PREFERENCE",
      sortOrder: sortOrder++,
    });
    changeReasons.push({
      code: "user_favorite",
      foodId,
      detail: category,
    });
  }

  return { items, changeReasons };
}

export function runBiologicalOsEnginePipeline(
  input: EnginePipelineInput,
): EnginePipelineResult {
  const requirementRows: StoredRequirementRow[] = input.requirementRows.map((row) => ({
    ...row,
    referenceType: row.referenceType as ReferenceValueType,
    lifeStage: null,
  }));

  const requirements = resolveEngineRequirements({
    profile: input.profile,
    rows: requirementRows,
    requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
    proteinPreference: input.proteinPreference,
  });

  const filtered = buildFilteredCandidateSet({
    categoryCandidates: input.categoryCandidates,
    excludedAllergens: input.excludedAllergens,
    hardExcludedFoodIds: input.hardExcludedFoodIds,
  });

  const dataVersions = buildEngineDataVersions(BIOLOGICAL_OS_ENGINE_VERSION);
  const redundancyChoices = input.redundancyChoices ?? [];
  const portionGrams = DEFAULT_PORTION_GRAMS;

  let activityProfile = null;
  let energyEstimate = null;

  if (input.dailyLife && input.profile.heightCm) {
    activityProfile = resolveActivityProfile({
      weightKg: input.profile.bodyWeightKg,
      occupationMovement: input.dailyLife.occupationMovement,
      activities: input.activities ?? [],
    });

    const baselineOccupationPal =
      input.dailyLife.baselineOccupationPal ?? activityProfile.baselineOccupationPal;

    energyEstimate = computeEnergyEstimate({
      sex: input.profile.sex,
      ageYears: input.profile.age,
      heightCm: input.profile.heightCm,
      weightKg: input.profile.bodyWeightKg,
      baselineOccupationPal,
      weeklyExerciseKcal: activityProfile.weeklyExerciseKcal,
    });
  }

  const optimizer = optimizeMinimalFoodSet({
    categoryCandidates: filtered.categoryCandidates,
    candidates: filtered.candidates,
    requirements,
    dataVersions,
    requiredFoodIds: input.requiredFoodIds,
    redundancyChoices,
    portionGrams,
    extraItems: [],
  });

  const favoriteExtras =
    input.favoriteFoodIds && optimizer.status === "ok"
      ? buildFavoriteExtraItems({
          favoriteFoodIds: input.favoriteFoodIds,
          candidates: filtered.candidates,
          portionGrams,
          existingFoodIds: new Set(optimizer.draft.items.map((item) => item.foodId)),
        })
      : { items: [], changeReasons: [] };

  const mergedOptimizer =
    favoriteExtras.items.length > 0
      ? {
          ...optimizer,
          draft: {
            items: [...optimizer.draft.items, ...favoriteExtras.items].map((item, index) => ({
              ...item,
              sortOrder: index,
            })),
          },
          changeReasons: [...optimizer.changeReasons, ...favoriteExtras.changeReasons],
        }
      : optimizer;

  const candidatesById = new Map(
    filtered.candidates.map((candidate) => [candidate.foodId, candidate]),
  );

  const phytonutrientDiversity =
    mergedOptimizer.status === "ok"
      ? scorePhytonutrientDiversity({
          draft: mergedOptimizer.draft,
          candidatesById,
          portionGrams,
        })
      : undefined;

  const optimizerWithPhyto = phytonutrientDiversity
    ? { ...mergedOptimizer, phytonutrientDiversity }
    : mergedOptimizer;

  const compositionNutrientCodes = nutrientsWithCompositionData(filtered.candidates);
  const adequacyReport = buildBiologicalAdequacyReport({
    coverage: optimizerWithPhyto.coverage,
    requirements,
    compositionNutrientCodes,
    phytonutrientDiversity: phytonutrientDiversity ?? null,
  });

  const redundancyAssessments = detectRedundancyPairs({
    draft: optimizerWithPhyto.draft,
    candidatesById,
    redundancyChoices,
    portionGrams,
  });

  const redundancyProposals = buildRedundancyProposals(redundancyAssessments);

  const snapshot = snapshotFromOptimizer({
    userId: input.userId,
    version: nextMatrixVersion(input.matrixVersion),
    optimizer: optimizerWithPhyto,
    redundancyAssessments,
    redundancyChoices,
    createdAtIso: input.timestampIso,
  });

  return {
    requirements,
    optimizer: optimizerWithPhyto,
    redundancyProposals,
    snapshot,
    energyEstimate,
    activityProfile,
    adequacyReport,
  };
}

export function runDeterministicEnginePipeline(
  input: EnginePipelineInput,
): EnginePipelineResult {
  return runBiologicalOsEnginePipeline({
    ...input,
    timestampIso: input.timestampIso ?? "1970-01-01T00:00:00.000Z",
  });
}
