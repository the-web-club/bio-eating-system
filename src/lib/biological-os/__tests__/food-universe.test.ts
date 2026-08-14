import { describe, expect, it } from "vitest";
import { buildExpandedFoodUniverse } from "@/lib/biological-os/food-universe";
import { ALL_TEST_FOODS } from "@/lib/biological-os/__tests__/fixtures";

describe("food universe", () => {
  it("builds a category map from all approved candidates", () => {
    const universe = buildExpandedFoodUniverse({
      candidates: ALL_TEST_FOODS,
      applySlotProxies: false,
    });

    expect(universe.stats.totalCandidates).toBe(ALL_TEST_FOODS.length);
    expect(universe.stats.categoriesWithCandidates).toBeGreaterThan(0);
    expect(Object.values(universe.categoryCandidates).flat()).not.toHaveLength(0);
  });
});
