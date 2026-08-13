import { DEFAULT_PORTION_GRAMS } from "@/lib/biological-os/constants";
import {
  buildNutrientProfileMap,
  coverageForDraft,
} from "@/lib/biological-os/coverage-engine";
import { nutrientAmountForPortion, totalsForPortions } from "@/lib/nutrition/contribution";
import {
  compareCoverage,
  gapsFromRemoval,
  nutrientDeltaOnRemoval,
} from "@/lib/nutrition/coverage";
import type {
  EngineFoodCandidate,
  FoodMatrixDraft,
  RemovalRecalculation,
  ReplacementCandidate,
} from "@/lib/biological-os/types";
import type { DailyRequirement } from "@/lib/nutrition-data/types";

function replacementScore(args: {
  candidate: EngineFoodCandidate;
  gaps: Array<{ nutrientCode: string; gap: number }>;
  portionGrams: number;
}): { score: number; nutrientsFilled: string[] } {
  let score = 0;
  const nutrientsFilled: string[] = [];

  for (const gap of args.gaps) {
    const row = args.candidate.nutrients.find(
      (nutrient) => nutrient.nutrientCode === gap.nutrientCode,
    );
    if (!row) continue;
    const amount = nutrientAmountForPortion(row, args.portionGrams);
    if (amount <= 0) continue;
    const filled = Math.min(amount, gap.gap);
    score += filled;
    if (filled > 0) {
      nutrientsFilled.push(gap.nutrientCode);
    }
  }

  return { score, nutrientsFilled: [...new Set(nutrientsFilled)].sort() };
}

export function recalculateAfterRemoval(args: {
  draft: FoodMatrixDraft;
  removeFoodId: string;
  requirements: DailyRequirement[];
  candidates: EngineFoodCandidate[];
  portionGrams?: number;
}): RemovalRecalculation {
  const portionGrams = args.portionGrams ?? DEFAULT_PORTION_GRAMS;
  const profiles = buildNutrientProfileMap(
    args.candidates.map((candidate) => ({
      foodId: candidate.foodId,
      nutrients: candidate.nutrients,
    })),
  );

  const baselineCoverage = coverageForDraft({
    draft: args.draft,
    requirements: args.requirements,
    profiles,
  });

  const withTotals = totalsForPortions({
    portions: args.draft.items.map((item) => ({
      foodId: item.foodId,
      grams: item.portionGrams,
    })),
    profiles,
  });

  const withoutTotals = totalsForPortions({
    portions: args.draft.items
      .filter((item) => item.foodId !== args.removeFoodId)
      .map((item) => ({
        foodId: item.foodId,
        grams: item.portionGrams,
      })),
    profiles,
  });

  const removalDelta = nutrientDeltaOnRemoval({
    withFood: withTotals,
    withoutFood: withoutTotals,
  });

  const coverageAfterRemoval = gapsFromRemoval({
    baselineCoverage,
    removalDelta,
  });

  const activeIds = new Set(args.draft.items.map((item) => item.foodId));
  const gaps = coverageAfterRemoval
    .filter((row) => row.gap > 0.001)
    .map((row) => ({ nutrientCode: row.nutrientCode, gap: row.gap }));

  const replacementCandidates: ReplacementCandidate[] = args.candidates
    .filter(
      (candidate) =>
        candidate.foodId !== args.removeFoodId && !activeIds.has(candidate.foodId),
    )
    .map((candidate) => {
      const { score, nutrientsFilled } = replacementScore({
        candidate,
        gaps,
        portionGrams,
      });
      return {
        foodId: candidate.foodId,
        name: candidate.name,
        score,
        nutrientsFilled,
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.foodId.localeCompare(b.foodId);
    });

  return {
    removedFoodId: args.removeFoodId,
    coverageAfterRemoval,
    lostNutrients: removalDelta.map((row) => ({
      nutrientCode: row.nutrientCode,
      unit: row.unit,
      lost: row.lost,
    })),
    replacementCandidates,
  };
}

export function recalculateAfterAdd(args: {
  draft: FoodMatrixDraft;
  addFood: EngineFoodCandidate;
  portionGrams: number;
  requirements: DailyRequirement[];
  candidates: EngineFoodCandidate[];
}): {
  draft: FoodMatrixDraft;
  coverage: ReturnType<typeof compareCoverage>;
} {
  const profiles = buildNutrientProfileMap(
    args.candidates.map((candidate) => ({
      foodId: candidate.foodId,
      nutrients: candidate.nutrients,
    })),
  );

  const draft: FoodMatrixDraft = {
    items: [
      ...args.draft.items,
      {
        foodId: args.addFood.foodId,
        biologicalCategorySlug: args.addFood.biologicalCategory,
        portionGrams: args.portionGrams,
        preference: "SOFT_PREFERENCE",
        sortOrder: args.draft.items.length,
      },
    ],
  };

  const coverage = coverageForDraft({
    draft,
    requirements: args.requirements,
    profiles,
  });

  return { draft, coverage };
}
