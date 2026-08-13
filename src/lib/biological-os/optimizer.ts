import type { BiologicalCategorySlug, PreferenceKind } from "@/generated/prisma/client";
import {
  BIOLOGICAL_OS_ENGINE_VERSION,
  DEFAULT_PORTION_GRAMS,
} from "@/lib/biological-os/constants";
import {
  buildNutrientProfileMap,
  coverageForDraft,
  filterRequirementsWithFoodData,
  foodSlotToPreference,
  sortDraftItems,
  uncoveredNutrientCodes,
} from "@/lib/biological-os/coverage-engine";
import { missingCategories } from "@/lib/biological-os/candidate-set";
import { applyRedundancyDecisionsToDraft } from "@/lib/biological-os/redundancy";
import type {
  CategoryCandidateMap,
  ChangeReason,
  EngineDataVersions,
  EngineFoodCandidate,
  FoodMatrixDraft,
  FoodMatrixDraftItem,
  OptimizerResult,
  RedundancyChoiceRecord,
} from "@/lib/biological-os/types";
import { nutrientAmountForPortion } from "@/lib/nutrition/contribution";
import type { DailyRequirement } from "@/lib/nutrition-data/types";
import { FOOD_SLOTS, type FoodSlot } from "@/lib/nutrition/plan-engine";

function scoreCandidate(args: {
  candidate: EngineFoodCandidate;
  requirements: DailyRequirement[];
  portionGrams: number;
}): number {
  let score = 0;

  for (const requirement of args.requirements) {
    const row = args.candidate.nutrients.find(
      (nutrient) => nutrient.nutrientCode === requirement.nutrientCode,
    );
    if (!row) continue;
    const amount = nutrientAmountForPortion(row, args.portionGrams);
    if (requirement.value <= 0) continue;
    score += Math.min(amount / requirement.value, 1);
  }

  return score;
}

function pickBestCandidate(args: {
  candidates: EngineFoodCandidate[];
  requirements: DailyRequirement[];
  portionGrams: number;
}): EngineFoodCandidate | null {
  if (args.candidates.length === 0) return null;

  return [...args.candidates].sort((a, b) => {
    const scoreDiff =
      scoreCandidate({ candidate: b, requirements: args.requirements, portionGrams: args.portionGrams }) -
      scoreCandidate({ candidate: a, requirements: args.requirements, portionGrams: args.portionGrams });
    if (scoreDiff !== 0) return scoreDiff;
    return a.foodId.localeCompare(b.foodId);
  })[0];
}

function seedDraftItems(args: {
  categoryCandidates: CategoryCandidateMap;
  requirements: DailyRequirement[];
  requiredFoodIds: Set<string>;
  portionGrams: number;
}): { items: FoodMatrixDraftItem[]; changeReasons: ChangeReason[] } {
  const items: FoodMatrixDraftItem[] = [];
  const changeReasons: ChangeReason[] = [];
  let sortOrder = 0;

  for (const slot of FOOD_SLOTS) {
    const requiredInSlot = args.categoryCandidates[slot].filter((row) =>
      args.requiredFoodIds.has(row.foodId),
    );

    if (requiredInSlot.length > 0) {
      for (const candidate of requiredInSlot.sort((a, b) => a.foodId.localeCompare(b.foodId))) {
        items.push({
          foodId: candidate.foodId,
          biologicalCategorySlug: slot as BiologicalCategorySlug,
          portionGrams: args.portionGrams,
          preference: "HARD_PREFERENCE",
          sortOrder: sortOrder++,
        });
        changeReasons.push({
          code: "user_required",
          foodId: candidate.foodId,
          detail: slot,
        });
      }
      continue;
    }

    const chosen = pickBestCandidate({
      candidates: args.categoryCandidates[slot],
      requirements: args.requirements,
      portionGrams: args.portionGrams,
    });

    if (!chosen) continue;

    items.push({
      foodId: chosen.foodId,
      biologicalCategorySlug: slot as BiologicalCategorySlug,
      portionGrams: args.portionGrams,
      preference: "SOFT_PREFERENCE",
      sortOrder: sortOrder++,
    });
    changeReasons.push({
      code: "category_seed",
      foodId: chosen.foodId,
      detail: slot,
    });
  }

  return { items, changeReasons };
}

function scaleProteinPortions(args: {
  draft: FoodMatrixDraft;
  requirements: DailyRequirement[];
  profiles: Map<string, EngineFoodCandidate["nutrients"]>;
}): FoodMatrixDraft {
  const proteinRequirement = args.requirements.find((row) => row.nutrientCode === "protein");
  if (!proteinRequirement || proteinRequirement.value <= 0) {
    return args.draft;
  }

  const coverage = coverageForDraft({
    draft: args.draft,
    requirements: args.requirements,
    profiles: args.profiles,
  });
  const proteinCoverage = coverage.find((row) => row.nutrientCode === "protein");
  if (!proteinCoverage || proteinCoverage.gap <= 0.001) {
    return args.draft;
  }

  const proteinItems = args.draft.items
    .map((item) => {
      const rows = args.profiles.get(item.foodId) ?? [];
      const proteinRow = rows.find((row) => row.nutrientCode === "protein");
      const proteinPer100 = proteinRow
        ? nutrientAmountForPortion(proteinRow, 100)
        : 0;
      return { item, proteinPer100 };
    })
    .filter((row) => row.proteinPer100 > 0)
    .sort((a, b) => b.proteinPer100 - a.proteinPer100);

  if (proteinItems.length === 0) {
    return args.draft;
  }

  const scaledItems = args.draft.items.map((item) => ({ ...item }));
  let remainingGap = proteinCoverage.gap;

  for (const { item, proteinPer100 } of proteinItems) {
    if (remainingGap <= 0.001) break;
    const target = scaledItems.find((row) => row.foodId === item.foodId);
    if (!target) continue;

    const gramsNeeded = (remainingGap / proteinPer100) * 100;
    target.portionGrams = Math.round((target.portionGrams + gramsNeeded) * 10) / 10;
    remainingGap = Math.max(
      proteinRequirement.value -
        coverageForDraft({
          draft: { items: scaledItems },
          requirements: args.requirements,
          profiles: args.profiles,
        }).find((row) => row.nutrientCode === "protein")!.actual,
      0,
    );
  }

  return { items: scaledItems };
}

function removableFoodIds(args: {
  draft: FoodMatrixDraft;
  requiredFoodIds: Set<string>;
  redundancyChoices: RedundancyChoiceRecord[];
}): Set<string> {
  const protectedIds = new Set<string>(args.requiredFoodIds);

  for (const choice of args.redundancyChoices) {
    if (choice.decision === "keep_both") {
      protectedIds.add(choice.foodAId);
      protectedIds.add(choice.foodBId);
    }
  }

  for (const item of args.draft.items) {
    if (item.preference === "HARD_PREFERENCE") {
      protectedIds.add(item.foodId);
    }
  }

  return protectedIds;
}

function canRemoveItem(args: {
  draft: FoodMatrixDraft;
  removeFoodId: string;
  requirements: DailyRequirement[];
  profiles: Map<string, EngineFoodCandidate["nutrients"]>;
}): boolean {
  const nextItems = args.draft.items.filter((item) => item.foodId !== args.removeFoodId);
  const coverage = coverageForDraft({
    draft: { items: nextItems },
    requirements: args.requirements,
    profiles: args.profiles,
  });
  return uncoveredNutrientCodes(coverage).length === 0;
}

function pruneDraft(args: {
  draft: FoodMatrixDraft;
  requirements: DailyRequirement[];
  profiles: Map<string, EngineFoodCandidate["nutrients"]>;
  requiredFoodIds: Set<string>;
  redundancyChoices: RedundancyChoiceRecord[];
  changeReasons: ChangeReason[];
}): FoodMatrixDraft {
  const protectedIds = removableFoodIds({
    draft: args.draft,
    requiredFoodIds: args.requiredFoodIds,
    redundancyChoices: args.redundancyChoices,
  });

  let items = [...args.draft.items];
  const changeReasons = [...args.changeReasons];
  let changed = true;

  while (changed) {
    changed = false;
    const candidates = items
      .filter((item) => !protectedIds.has(item.foodId))
      .sort((a, b) => a.foodId.localeCompare(b.foodId));

    for (const item of candidates) {
      const draft = { items };
      if (
        canRemoveItem({
          draft,
          removeFoodId: item.foodId,
          requirements: args.requirements,
          profiles: args.profiles,
        })
      ) {
        items = items.filter((row) => row.foodId !== item.foodId);
        changeReasons.push({
          code: "optimizer_prune",
          foodId: item.foodId,
        });
        changed = true;
        break;
      }
    }
  }

  args.changeReasons.splice(0, args.changeReasons.length, ...changeReasons);
  return { items: sortDraftItems(items) };
}

export function optimizeMinimalFoodSet(args: {
  categoryCandidates: CategoryCandidateMap;
  candidates: EngineFoodCandidate[];
  requirements: DailyRequirement[];
  dataVersions: EngineDataVersions;
  requiredFoodIds?: string[];
  redundancyChoices?: RedundancyChoiceRecord[];
  portionGrams?: number;
  extraItems?: FoodMatrixDraftItem[];
}): OptimizerResult {
  const portionGrams = args.portionGrams ?? DEFAULT_PORTION_GRAMS;
  const requiredFoodIds = new Set(args.requiredFoodIds ?? []);
  const redundancyChoices = args.redundancyChoices ?? [];
  const supportedRequirements = filterRequirementsWithFoodData({
    requirements: args.requirements,
    candidates: args.candidates,
  });
  const profiles = buildNutrientProfileMap(
    args.candidates.map((candidate) => ({
      foodId: candidate.foodId,
      nutrients: candidate.nutrients,
    })),
  );

  const emptyCategories = missingCategories(args.categoryCandidates);
  if (emptyCategories.length > 0) {
    return {
      status: "infeasible",
      infeasibleReason: "no_candidate_for_category",
      missingCategories: emptyCategories,
      draft: { items: [] },
      coverage: [],
      changeReasons: [],
      engineVersion: BIOLOGICAL_OS_ENGINE_VERSION,
      dataVersions: args.dataVersions,
    };
  }

  const seeded = seedDraftItems({
    categoryCandidates: args.categoryCandidates,
    requirements: supportedRequirements,
    requiredFoodIds,
    portionGrams,
  });

  let draft: FoodMatrixDraft = {
    items: sortDraftItems([
      ...seeded.items,
      ...(args.extraItems ?? []).map((item, index) => ({
        ...item,
        sortOrder: seeded.items.length + index,
        preference: item.preference ?? foodSlotToPreference(requiredFoodIds, item.foodId),
      })),
    ]),
  };

  const changeReasons = [...seeded.changeReasons];

  draft = applyRedundancyDecisionsToDraft({
    draft,
    choices: redundancyChoices,
    changeReasons,
  });

  draft = scaleProteinPortions({
    draft,
    requirements: supportedRequirements,
    profiles,
  });

  draft = pruneDraft({
    draft,
    requirements: supportedRequirements,
    profiles,
    requiredFoodIds,
    redundancyChoices,
    changeReasons,
  });

  const coverage = coverageForDraft({
    draft,
    requirements: args.requirements,
    profiles,
  });
  const uncovered = uncoveredNutrientCodes(
    coverage.filter((row) =>
      supportedRequirements.some((requirement) => requirement.nutrientCode === row.nutrientCode),
    ),
  );

  if (uncovered.length > 0) {
    return {
      status: "infeasible",
      infeasibleReason: "uncovered_nutrients",
      uncoveredNutrients: uncovered,
      draft,
      coverage,
      changeReasons,
      engineVersion: BIOLOGICAL_OS_ENGINE_VERSION,
      dataVersions: args.dataVersions,
    };
  }

  for (const requiredId of requiredFoodIds) {
    if (!draft.items.some((item) => item.foodId === requiredId)) {
      return {
        status: "infeasible",
        infeasibleReason: "required_food_infeasible",
        draft,
        coverage,
        changeReasons,
        engineVersion: BIOLOGICAL_OS_ENGINE_VERSION,
        dataVersions: args.dataVersions,
      };
    }
  }

  return {
    status: "ok",
    draft,
    coverage,
    changeReasons,
    engineVersion: BIOLOGICAL_OS_ENGINE_VERSION,
    dataVersions: args.dataVersions,
  };
}

export function categorySlugForFood(
  foodId: string,
  candidates: EngineFoodCandidate[],
): FoodSlot | null {
  return candidates.find((row) => row.foodId === foodId)?.biologicalCategory ?? null;
}
