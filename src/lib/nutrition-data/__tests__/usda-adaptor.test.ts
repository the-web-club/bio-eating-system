import { describe, expect, it, vi } from "vitest";
import { SOURCE_KEYS } from "@/lib/nutrition-data/constants";
import { createUsdaAdaptor } from "@/lib/nutrition-data/sources/usda/adaptor";
import * as release from "@/lib/nutrition-data/sources/usda/release";
import {
  USDA_PRODUCTION_SLICE,
  USDA_SLICE_VERSION_V1,
  USDA_SLICE_VERSION_V2,
  USDA_SLICE_VERSION_V3,
} from "@/lib/nutrition-data/sources/usda/slice-config";

const mockNutrients = [
  { nutrient: { id: 1003 }, amount: 10 },
  { nutrient: { id: 1008 }, amount: 100 },
  { nutrient: { id: 1089 }, amount: 1.2 },
];

describe("USDA adaptor", () => {
  it("builds a v1 production bundle from the official Foundation Foods release", async () => {
    vi.spyOn(release, "loadFoundationFoodsByIds").mockImplementation(async (fdcIds) =>
      fdcIds.map((fdcId) => ({
        fdcId,
        description: `Food ${fdcId}`,
        dataType: "Foundation",
        foodNutrients: mockNutrients,
      })),
    );

    const adaptor = createUsdaAdaptor();
    const bundle = await adaptor.fetch(USDA_SLICE_VERSION_V1);

    expect(bundle.source).toBe(SOURCE_KEYS.usda);
    expect(bundle.devOnly).toBe(false);
    expect(bundle.foods).toHaveLength(USDA_PRODUCTION_SLICE.length);
    expect(bundle.nutrients).toHaveLength(94);
    expect(bundle.requirementSet.devOnly).toBe(true);
    expect(bundle.requirementSet.requirements).toHaveLength(0);

    const egg = bundle.foods.find((food) => food.externalId === "fdc-748967");
    expect(egg?.nutrients.some((row) => row.code === "protein")).toBe(true);
  });

  it("builds a v2 bundle from the 2025 Foundation Foods release", async () => {
    const foundationFoods = Array.from({ length: 340 }, (_, index) => ({
      fdcId: 1000 + index,
      description: `Foundation food ${index}`,
      dataType: "Foundation",
      foodCategory: { description: "Vegetables and Vegetable Products" },
      foodNutrients: mockNutrients,
    }));

    vi.spyOn(release, "loadAllFoundationFoods").mockResolvedValue(foundationFoods);

    const adaptor = createUsdaAdaptor();
    const bundle = await adaptor.fetch(USDA_SLICE_VERSION_V2);

    expect(bundle.sourceVersion).toBe(USDA_SLICE_VERSION_V2);
    expect(bundle.foods).toHaveLength(340);
    expect(bundle.foods.every((food) => food.externalId.startsWith("fdc-"))).toBe(true);
  });

  it("builds a v3 bundle from the 2026 Foundation Foods release", async () => {
    const foundationFoods = Array.from({ length: 363 }, (_, index) => ({
      fdcId: 2000 + index,
      description: `Foundation food ${index}`,
      dataType: "Foundation",
      foodCategory: { description: "Vegetables and Vegetable Products" },
      foodNutrients: mockNutrients,
    }));

    vi.spyOn(release, "loadAllFoundationFoods").mockResolvedValue(foundationFoods);

    const adaptor = createUsdaAdaptor();
    const bundle = await adaptor.fetch(USDA_SLICE_VERSION_V3);

    expect(bundle.sourceVersion).toBe(USDA_SLICE_VERSION_V3);
    expect(bundle.foods).toHaveLength(363);
    expect(bundle.foods.every((food) => food.externalId.startsWith("fdc-"))).toBe(true);
  });

  it("lists v1, v2, and v3 slice versions", async () => {
    const adaptor = createUsdaAdaptor();
    await expect(adaptor.listVersions()).resolves.toEqual([
      USDA_SLICE_VERSION_V1,
      USDA_SLICE_VERSION_V2,
      USDA_SLICE_VERSION_V3,
    ]);
  });
});
