import { describe, expect, it } from "vitest";
import { buildMatrixPersistencePayload } from "@/lib/biological-os/persist-matrix";
import type { EnginePipelineResult, FoodMatrixSnapshot } from "@/lib/biological-os/types";

describe("persist matrix", () => {
  const snapshot: FoodMatrixSnapshot = {
    userId: "user-1",
    version: 1,
    status: "DRAFT",
    engineVersion: "biological-os-engine-0.1.0",
    foodDatasetVersion: "2025-04-24-production-slice-v2",
    requirementSetVersion: "efsa-drv-eu-2017-v2",
    calculationVersion: "biological-os-engine-0.1.0",
    draft: {
      items: [
        {
          foodId: "food-1",
          biologicalCategorySlug: "eggs",
          portionGrams: 100,
          preference: "SOFT_PREFERENCE",
          sortOrder: 0,
        },
      ],
    },
    coverage: [
      {
        nutrientCode: "protein",
        unit: "g",
        target: 48.6,
        actual: 50,
        gap: 0,
        surplus: 1.4,
      },
    ],
    changeReasons: [{ code: "category_seed", foodId: "food-1" }],
    redundancyAssessments: [
      {
        foodAId: "food-2",
        foodBId: "food-3",
        overlapNutrients: ["fiber"],
        level: "POTENTIAL",
      },
    ],
    redundancyChoices: [],
    createdAtIso: "2026-08-12T18:00:00.000Z",
  };

  const pipeline: EnginePipelineResult = {
    requirements: [],
    optimizer: {
      status: "ok",
      draft: snapshot.draft,
      coverage: snapshot.coverage,
      changeReasons: snapshot.changeReasons,
      engineVersion: snapshot.engineVersion,
      dataVersions: {
        foodSource: "usda-fdc",
        foodSourceVersion: snapshot.foodDatasetVersion,
        requirementSetVersion: snapshot.requirementSetVersion,
        constraintVersion: snapshot.calculationVersion,
      },
    },
    redundancyProposals: [],
    snapshot,
  };

  it("normalizes redundancy pairs and stores audit detail", () => {
    const payload = buildMatrixPersistencePayload({ snapshot, pipeline });

    expect(payload.items).toHaveLength(1);
    expect(payload.assessments[0]).toMatchObject({
      foodAId: "food-2",
      foodBId: "food-3",
      overlapNutrients: ["fiber"],
    });
    expect(payload.auditDetail).toMatchObject({
      optimizerStatus: "ok",
      changeReasons: [{ code: "category_seed", foodId: "food-1" }],
    });
  });
});
