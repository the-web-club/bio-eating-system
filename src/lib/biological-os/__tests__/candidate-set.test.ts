import { describe, expect, it } from "vitest";
import { applyFoundationSlotProxies } from "@/lib/biological-os/candidate-set";
import type { CategoryCandidateMap, EngineFoodCandidate } from "@/lib/biological-os/types";
import { FOOD_SLOTS } from "@/lib/nutrition/plan-engine";

function emptyMap(): CategoryCandidateMap {
  const map = Object.fromEntries(
    FOOD_SLOTS.map((slot) => [slot, [] as EngineFoodCandidate[]]),
  ) as CategoryCandidateMap;
  return map;
}

function candidate(foodId: string, biologicalCategory: EngineFoodCandidate["biologicalCategory"]): EngineFoodCandidate {
  return {
    foodId,
    externalId: `fdc-${foodId}`,
    name: foodId,
    biologicalCategory,
    allergens: [],
    nutrients: [],
    source: "usda-fdc",
    sourceVersion: "2026-04-30-production-slice-v3",
    devOnly: false,
  };
}

describe("applyFoundationSlotProxies", () => {
  it("borrows bivalve candidates for an empty organ_meat slot", () => {
    const map = emptyMap();
    map.bivalves = [candidate("scallop-1", "bivalves")];

    const proxied = applyFoundationSlotProxies(map);

    expect(map.organ_meat).toHaveLength(0);
    expect(proxied.organ_meat).toHaveLength(1);
    expect(proxied.organ_meat[0]?.foodId).toBe("scallop-1");
  });

  it("leaves populated slots unchanged", () => {
    const map = emptyMap();
    map.organ_meat = [candidate("liver-proxy", "organ_meat")];
    map.bivalves = [candidate("scallop-1", "bivalves")];

    const proxied = applyFoundationSlotProxies(map);

    expect(proxied.organ_meat).toHaveLength(1);
    expect(proxied.organ_meat[0]?.foodId).toBe("liver-proxy");
  });
});
