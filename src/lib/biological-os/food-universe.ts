import { applyFoundationSlotProxies } from "@/lib/biological-os/candidate-set";
import type { CategoryCandidateMap, EngineFoodCandidate } from "@/lib/biological-os/types";
import { FOOD_SLOTS, type FoodSlot } from "@/lib/nutrition/plan-engine";

export type FoodUniverseStats = {
  totalCandidates: number;
  slottedCandidates: number;
  unslottedCandidates: number;
  categoriesWithCandidates: number;
  emptyCategories: FoodSlot[];
};

export function primaryCategoryForCandidate(candidate: EngineFoodCandidate): FoodSlot {
  return candidate.biologicalCategory;
}

export function buildCategoryCandidateMapFromCandidates(
  candidates: EngineFoodCandidate[],
): CategoryCandidateMap {
  const map = Object.fromEntries(
    FOOD_SLOTS.map((slot) => [slot, [] as EngineFoodCandidate[]]),
  ) as CategoryCandidateMap;

  for (const candidate of candidates) {
    map[candidate.biologicalCategory].push(candidate);
  }

  for (const slot of FOOD_SLOTS) {
    map[slot].sort((a, b) => a.foodId.localeCompare(b.foodId));
  }

  return map;
}

export function buildExpandedFoodUniverse(args: {
  candidates: EngineFoodCandidate[];
  applySlotProxies?: boolean;
}): {
  candidates: EngineFoodCandidate[];
  categoryCandidates: CategoryCandidateMap;
  stats: FoodUniverseStats;
} {
  const candidates = [...args.candidates].sort((a, b) => a.foodId.localeCompare(b.foodId));
  let categoryCandidates = buildCategoryCandidateMapFromCandidates(candidates);

  if (args.applySlotProxies ?? true) {
    categoryCandidates = applyFoundationSlotProxies(categoryCandidates);
  }

  const slottedIds = new Set<string>();
  for (const slot of FOOD_SLOTS) {
    for (const candidate of categoryCandidates[slot]) {
      slottedIds.add(candidate.foodId);
    }
  }

  const emptyCategories = FOOD_SLOTS.filter((slot) => categoryCandidates[slot].length === 0);

  return {
    candidates,
    categoryCandidates,
    stats: {
      totalCandidates: candidates.length,
      slottedCandidates: slottedIds.size,
      unslottedCandidates: candidates.length - slottedIds.size,
      categoriesWithCandidates: FOOD_SLOTS.length - emptyCategories.length,
      emptyCategories,
    },
  };
}
