import { describe, expect, it } from "vitest";
import { FIXTURE_FOOD_SOURCE } from "@/lib/nutrition-data/constants";
import {
  assertProductionNutritionDataset,
  getProductionDatasetStatus,
  isDevOnlySourceKey,
} from "@/lib/nutrition-data/production-gate";

describe("production nutrition gate", () => {
  it("treats fixture source key as dev-only", () => {
    expect(isDevOnlySourceKey(FIXTURE_FOOD_SOURCE)).toBe(true);
  });

  it("reports not ready when no approved production sources exist", async () => {
    const status = await getProductionDatasetStatus({
      foodDataSource: {
        count: async () => 0,
      },
      requirementSet: {
        count: async () => 0,
      },
      food: {
        count: async () => 6,
      },
    });

    expect(status.ready).toBe(false);
    expect(status.approvedFoodSources).toBe(0);
  });

  it("throws when production dataset is not approved", async () => {
    await expect(
      assertProductionNutritionDataset({
        foodDataSource: { count: async () => 0 },
        requirementSet: { count: async () => 0 },
        food: { count: async () => 0 },
      }),
    ).rejects.toThrow(/Production nutrition dataset not yet approved/);
  });
});
