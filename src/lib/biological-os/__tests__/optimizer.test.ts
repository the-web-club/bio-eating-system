import { describe, expect, it } from "vitest";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
  buildEngineDataVersions,
  optimizeMinimalFoodSet,
  resolveEngineRequirements,
} from "@/lib/biological-os";
import { filterRequirementsWithFoodData } from "@/lib/biological-os/coverage-engine";
import {
  ALL_TEST_FOODS,
  EFSA_REQUIREMENT_ROWS,
  FOOD_OATS,
  TEST_PROFILE_FEMALE,
  buildCategoryCandidates,
} from "./fixtures";

describe("optimizer", () => {
  const requirements = resolveEngineRequirements({
    profile: TEST_PROFILE_FEMALE,
    rows: EFSA_REQUIREMENT_ROWS,
    requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
  });

  const categoryCandidates = buildCategoryCandidates();

  it("returns ok with one seeded food per category when coverage is satisfiable", () => {
    const result = optimizeMinimalFoodSet({
      categoryCandidates,
      candidates: ALL_TEST_FOODS,
      requirements,
      dataVersions: buildEngineDataVersions(),
    });

    expect(result.status).toBe("ok");
    expect(result.draft.items.length).toBeGreaterThan(0);
    expect(result.draft.items.length).toBeLessThanOrEqual(13);
    expect(result.changeReasons.some((row) => row.code === "category_seed")).toBe(true);
    const supportedCodes = new Set(
      filterRequirementsWithFoodData({
        requirements,
        candidates: ALL_TEST_FOODS,
      }).map((row) => row.nutrientCode),
    );
    expect(
      result.coverage
        .filter((row) => supportedCodes.has(row.nutrientCode))
        .every((row) => row.gap <= 0.001),
    ).toBe(true);
  });

  it("is deterministic for identical inputs", () => {
    const args = {
      categoryCandidates,
      candidates: ALL_TEST_FOODS,
      requirements,
      dataVersions: buildEngineDataVersions(),
    };

    const first = optimizeMinimalFoodSet(args);
    const second = optimizeMinimalFoodSet(args);

    expect(first).toEqual(second);
  });

  it("returns infeasible when a category has no candidates", () => {
    const partial = buildCategoryCandidates([ALL_TEST_FOODS[0]!]);
    const result = optimizeMinimalFoodSet({
      categoryCandidates: partial,
      candidates: [ALL_TEST_FOODS[0]!],
      requirements,
      dataVersions: buildEngineDataVersions(),
    });

    expect(result.status).toBe("infeasible");
    expect(result.infeasibleReason).toBe("no_candidate_for_category");
    expect(result.missingCategories?.length).toBeGreaterThan(0);
  });

  it("keeps required foods and records user_required reasons", () => {
    const result = optimizeMinimalFoodSet({
      categoryCandidates,
      candidates: ALL_TEST_FOODS,
      requirements,
      dataVersions: buildEngineDataVersions(),
      requiredFoodIds: [FOOD_OATS.foodId],
    });

    expect(result.draft.items.some((row) => row.foodId === FOOD_OATS.foodId)).toBe(true);
    expect(result.changeReasons.some((row) => row.code === "user_required")).toBe(true);
  });

  it("scales protein portions instead of dropping protein categories", () => {
    const highProteinRequirements = requirements.map((row) =>
      row.nutrientCode === "protein" ? { ...row, value: 120 } : row,
    );

    const result = optimizeMinimalFoodSet({
      categoryCandidates,
      candidates: ALL_TEST_FOODS,
      requirements: highProteinRequirements,
      dataVersions: buildEngineDataVersions(),
    });

    expect(result.status).toBe("ok");
    const proteinItems = result.draft.items.filter((item) =>
      ALL_TEST_FOODS.find((food) => food.foodId === item.foodId)?.nutrients.some(
        (nutrient) => nutrient.nutrientCode === "protein",
      ),
    );
    expect(proteinItems.some((item) => item.portionGrams > 100)).toBe(true);
    expect(result.draft.items.some((item) => item.biologicalCategorySlug === "muscle_meat")).toBe(
      true,
    );
  });
});
