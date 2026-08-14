import { describe, expect, it } from "vitest";
import {
  inferBiologicalCategory,
  inferPreparationState,
  inferUsdaSliceEntry,
} from "@/lib/nutrition-data/sources/usda/slice-inference";
import { USDA_SLICE_OVERRIDE_BY_FDC_ID } from "@/lib/nutrition-data/sources/usda/slice-overrides";

describe("USDA slice inference", () => {
  it("maps finfish to small_fish and shellfish to bivalves by USDA category", () => {
    expect(
      inferBiologicalCategory({
        description: "Cod, Atlantic, raw",
        usdaCategory: "Finfish and Shellfish Products",
      }),
    ).toBe("small_fish");

    expect(
      inferBiologicalCategory({
        description: "Shrimp, raw",
        usdaCategory: "Finfish and Shellfish Products",
      }),
    ).toBe("bivalves");
  });

  it("does not map kidney beans to organ meat", () => {
    expect(
      inferBiologicalCategory({
        description: "Beans, kidney, dark red, canned, sodium added, sugar added, drained and rinsed",
        usdaCategory: "Legumes and Legume Products",
      }),
    ).toBe("olive_oil");
  });

  it("maps mushrooms before shellfish keywords in description", () => {
    expect(
      inferBiologicalCategory({
        description: "Mushrooms, oyster, raw",
        usdaCategory: "Vegetables and Vegetable Products",
      }),
    ).toBe("mushrooms");
  });

  it("infers preparation state from description keywords", () => {
    expect(inferPreparationState("Bread, whole wheat")).toBe("BAKED");
    expect(inferPreparationState("Oats, rolled, old fashioned")).toBe("DRIED");
    expect(inferPreparationState("Chicken breast, roasted")).toBe("ROASTED");
    expect(inferPreparationState("Yogurt, plain, whole milk")).toBe("FERMENTED");
  });

  it("preserves hand-reviewed v1 overrides over inference", () => {
    const tomatoOverride = USDA_SLICE_OVERRIDE_BY_FDC_ID.get(321360);
    expect(tomatoOverride?.biologicalCategory).toBe("mushrooms");

    const inferred = inferUsdaSliceEntry({
      fdcId: 321360,
      description: "Tomatoes, grape, raw",
      foodCategory: { description: "Vegetables and Vegetable Products" },
    });
    expect(inferred.biologicalCategory).toBe("berries");
  });
});
