import { FOOD_SLOTS, SWAP_TARGET } from "@/lib/nutrition/plan-engine";
import {
  assertApprovedFoodCandidate,
  filterApprovedCandidates,
  filterExcludedCandidates,
} from "@/lib/biological-os/filter-exclusions";
import type { CategoryCandidateMap, EngineFoodCandidate } from "@/lib/biological-os/types";

export function flattenCandidates(categoryCandidates: CategoryCandidateMap): EngineFoodCandidate[] {
  const byId = new Map<string, EngineFoodCandidate>();

  for (const slot of FOOD_SLOTS) {
    for (const candidate of categoryCandidates[slot]) {
      byId.set(candidate.foodId, candidate);
    }
  }

  return [...byId.values()].sort((a, b) => a.foodId.localeCompare(b.foodId));
}

export function buildFilteredCandidateSet(args: {
  categoryCandidates: CategoryCandidateMap;
  excludedAllergens?: string[];
  hardExcludedFoodIds?: string[];
}): {
  candidates: EngineFoodCandidate[];
  categoryCandidates: CategoryCandidateMap;
} {
  const approved = filterApprovedCandidates(flattenCandidates(args.categoryCandidates));

  for (const candidate of approved) {
    assertApprovedFoodCandidate(candidate);
  }

  const filtered = filterExcludedCandidates({
    candidates: approved,
    excludedAllergens: args.excludedAllergens,
    hardExcludedFoodIds: args.hardExcludedFoodIds,
  });

  const filteredIds = new Set(filtered.map((row) => row.foodId));
  const nextMap = Object.fromEntries(
    FOOD_SLOTS.map((slot) => [
      slot,
      args.categoryCandidates[slot].filter((row) => filteredIds.has(row.foodId)),
    ]),
  ) as CategoryCandidateMap;

  return {
    candidates: filtered,
    categoryCandidates: nextMap,
  };
}

export function missingCategories(
  categoryCandidates: CategoryCandidateMap,
): Array<(typeof FOOD_SLOTS)[number]> {
  return FOOD_SLOTS.filter((slot) => categoryCandidates[slot].length === 0);
}

/**
 * Foundation Foods omits some slots (notably organ meats). Borrow candidates from
 * the plan-engine swap target so the optimizer can still run on approved data only.
 */
export function applyFoundationSlotProxies(
  categoryCandidates: CategoryCandidateMap,
): CategoryCandidateMap {
  const next = Object.fromEntries(
    FOOD_SLOTS.map((slot) => [slot, [...categoryCandidates[slot]]]),
  ) as CategoryCandidateMap;

  for (const slot of FOOD_SLOTS) {
    if (next[slot].length > 0) continue;
    const proxySlot = SWAP_TARGET[slot];
    if (!proxySlot || next[proxySlot].length === 0) continue;
    next[slot] = [...next[proxySlot]];
  }

  return next;
}
