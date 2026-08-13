import { describe, expect, it } from "vitest";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
  buildEngineDataVersions,
  optimizeMinimalFoodSet,
  recalculateAfterRemoval,
  resolveEngineRequirements,
} from "@/lib/biological-os";
import {
  ALL_TEST_FOODS,
  EFSA_REQUIREMENT_ROWS,
  FOOD_LIVER,
  TEST_PROFILE_FEMALE,
  buildCategoryCandidates,
} from "./fixtures";

describe("recalculate after removal", () => {
  const requirements = resolveEngineRequirements({
    profile: TEST_PROFILE_FEMALE,
    rows: EFSA_REQUIREMENT_ROWS,
    requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
  });

  const categoryCandidates = buildCategoryCandidates();

  it("ranks liver replacements by coverage fill after liver removal", () => {
    const optimized = optimizeMinimalFoodSet({
      categoryCandidates,
      candidates: ALL_TEST_FOODS,
      requirements,
      dataVersions: buildEngineDataVersions(),
      requiredFoodIds: [FOOD_LIVER.foodId],
    });

    const recalculation = recalculateAfterRemoval({
      draft: optimized.draft,
      removeFoodId: FOOD_LIVER.foodId,
      requirements,
      candidates: ALL_TEST_FOODS,
    });

    expect(recalculation.lostNutrients.map((row) => row.nutrientCode)).toEqual(
      expect.arrayContaining(["iron", "vitamin_a", "folate"]),
    );
    expect(recalculation.replacementCandidates.length).toBeGreaterThan(0);
    expect(recalculation.replacementCandidates[0]?.nutrientsFilled.length).toBeGreaterThan(0);
    expect(
      recalculation.replacementCandidates.some((row) =>
        row.nutrientsFilled.some((nutrient) =>
          ["iron", "vitamin_a", "folate"].includes(nutrient),
        ),
      ),
    ).toBe(true);
  });

  it("reports coverage gaps after removal", () => {
    const optimized = optimizeMinimalFoodSet({
      categoryCandidates,
      candidates: ALL_TEST_FOODS,
      requirements,
      dataVersions: buildEngineDataVersions(),
    });

    const recalculation = recalculateAfterRemoval({
      draft: optimized.draft,
      removeFoodId: FOOD_LIVER.foodId,
      requirements,
      candidates: ALL_TEST_FOODS,
    });

    expect(recalculation.coverageAfterRemoval.some((row) => row.gap > 0)).toBe(true);
  });
});
