import { describe, expect, it } from "vitest";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
  buildEngineDataVersions,
  createFoodMatrixSnapshot,
  nextMatrixVersion,
  optimizeMinimalFoodSet,
  resolveEngineRequirements,
  snapshotFromOptimizer,
} from "@/lib/biological-os";
import {
  ALL_TEST_FOODS,
  EFSA_REQUIREMENT_ROWS,
  FIXED_TIMESTAMP,
  TEST_PROFILE_FEMALE,
  buildCategoryCandidates,
} from "./fixtures";

describe("matrix versioning", () => {
  const requirements = resolveEngineRequirements({
    profile: TEST_PROFILE_FEMALE,
    rows: EFSA_REQUIREMENT_ROWS,
    requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
  });

  it("increments matrix version monotonically", () => {
    expect(nextMatrixVersion()).toBe(1);
    expect(nextMatrixVersion(3)).toBe(4);
  });

  it("records engine and data versions on snapshots", () => {
    const optimizer = optimizeMinimalFoodSet({
      categoryCandidates: buildCategoryCandidates(),
      candidates: ALL_TEST_FOODS,
      requirements,
      dataVersions: buildEngineDataVersions(),
    });

    const snapshot = snapshotFromOptimizer({
      userId: "user-1",
      version: 1,
      optimizer,
      redundancyAssessments: [],
      redundancyChoices: [],
      createdAtIso: FIXED_TIMESTAMP,
    });

    expect(snapshot.version).toBe(1);
    expect(snapshot.engineVersion).toMatch(/biological-os-engine/);
    expect(snapshot.foodDatasetVersion).toBe("2026-04-30-production-slice-v3");
    expect(snapshot.requirementSetVersion).toBe("efsa-drv-eu-2017-v2");
    expect(snapshot.calculationVersion).toBe("energy-mifflin-met-v1");
    expect(snapshot.changeReasons.length).toBeGreaterThan(0);
    expect(snapshot.createdAtIso).toBe(FIXED_TIMESTAMP);
  });

  it("preserves appended change reasons", () => {
    const snapshot = createFoodMatrixSnapshot({
      userId: "user-1",
      version: 2,
      draft: { items: [] },
      coverage: [],
      changeReasons: [{ code: "category_seed", foodId: "food-eggs" }],
      redundancyAssessments: [],
      redundancyChoices: [],
      createdAtIso: FIXED_TIMESTAMP,
    });

    expect(snapshot.changeReasons).toEqual([
      { code: "category_seed", foodId: "food-eggs" },
    ]);
  });
});
