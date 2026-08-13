import { describe, expect, it } from "vitest";
import type { ChangeReason } from "@/lib/biological-os/types";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
  applyRedundancyChoice,
  buildEngineDataVersions,
  detectRedundancyPairs,
  optimizeMinimalFoodSet,
  resolveEngineRequirements,
} from "@/lib/biological-os";
import {
  ALL_TEST_FOODS,
  EFSA_REQUIREMENT_ROWS,
  FOOD_BREAD,
  FOOD_OATS,
  TEST_PROFILE_FEMALE,
  buildCategoryCandidates,
} from "./fixtures";

describe("redundancy handling", () => {
  const requirements = resolveEngineRequirements({
    profile: TEST_PROFILE_FEMALE,
    rows: EFSA_REQUIREMENT_ROWS,
    requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
  });

  const categoryCandidates = buildCategoryCandidates();
  const candidatesById = new Map(ALL_TEST_FOODS.map((food) => [food.foodId, food]));

  function draftWithGrains() {
    const seeded = optimizeMinimalFoodSet({
      categoryCandidates,
      candidates: ALL_TEST_FOODS,
      requirements,
      dataVersions: buildEngineDataVersions(),
    });

    return {
      items: [
        ...seeded.draft.items.filter((item) => item.foodId !== FOOD_OATS.foodId),
        {
          foodId: FOOD_OATS.foodId,
          biologicalCategorySlug: "olive_oil" as const,
          portionGrams: 100,
          preference: "SOFT_PREFERENCE" as const,
          sortOrder: 99,
        },
        {
          foodId: FOOD_BREAD.foodId,
          biologicalCategorySlug: "olive_oil" as const,
          portionGrams: 100,
          preference: "SOFT_PREFERENCE" as const,
          sortOrder: 100,
        },
      ],
    };
  }

  it("detects oats and bread overlap in the same category", () => {
    const assessments = detectRedundancyPairs({
      draft: draftWithGrains(),
      candidatesById,
      portionGrams: 100,
    });

    expect(
      assessments.some(
        (row) =>
          row.overlapNutrients.includes("fiber") &&
          row.overlapNutrients.includes("carbohydrate"),
      ),
    ).toBe(true);
  });

  it("KEEP BOTH retains both foods", () => {
    const changeReasons: ChangeReason[] = [];
    const draft = applyRedundancyChoice({
      draft: draftWithGrains(),
      choice: {
        foodAId: FOOD_OATS.foodId,
        foodBId: FOOD_BREAD.foodId,
        decision: "keep_both",
      },
      changeReasons,
    });

    expect(draft.items.some((row) => row.foodId === FOOD_OATS.foodId)).toBe(true);
    expect(draft.items.some((row) => row.foodId === FOOD_BREAD.foodId)).toBe(true);
    expect(changeReasons.some((row) => row.code === "redundancy_keep_both")).toBe(true);
  });

  it("REMOVE drops one food without touching the partner", () => {
    const changeReasons: ChangeReason[] = [];
    const draft = applyRedundancyChoice({
      draft: draftWithGrains(),
      choice: {
        foodAId: FOOD_OATS.foodId,
        foodBId: FOOD_BREAD.foodId,
        decision: "remove_a",
      },
      changeReasons,
    });

    expect(draft.items.some((row) => row.foodId === FOOD_OATS.foodId)).toBe(false);
    expect(draft.items.some((row) => row.foodId === FOOD_BREAD.foodId)).toBe(true);
  });

  it("REVIEW makes no automatic matrix change", () => {
    const before = draftWithGrains();
    const changeReasons: ChangeReason[] = [];
    const draft = applyRedundancyChoice({
      draft: before,
      choice: {
        foodAId: FOOD_OATS.foodId,
        foodBId: FOOD_BREAD.foodId,
        decision: "review",
      },
      changeReasons,
    });

    expect(draft.items).toEqual(before.items);
    expect(changeReasons).toHaveLength(0);
  });
});
