import { describe, expect, it } from "vitest";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
  runDeterministicEnginePipeline,
} from "@/lib/biological-os";
import {
  ALL_TEST_FOODS,
  EFSA_REQUIREMENT_ROWS,
  FIXED_TIMESTAMP,
  TEST_PROFILE_FEMALE,
  buildCategoryCandidates,
} from "./fixtures";

describe("biological os engine pipeline", () => {
  const baseInput = {
    userId: "user-spike-1",
    profile: TEST_PROFILE_FEMALE,
    requirementRows: EFSA_REQUIREMENT_ROWS,
    candidates: ALL_TEST_FOODS,
    categoryCandidates: buildCategoryCandidates(),
    matrixVersion: 0,
    timestampIso: FIXED_TIMESTAMP,
  };

  it("runs requirement resolution through snapshot creation", () => {
    const result = runDeterministicEnginePipeline(baseInput);

    expect(result.requirements).toHaveLength(29);
    expect(result.optimizer.status).toBe("ok");
    expect(result.snapshot.version).toBe(1);
    expect(result.snapshot.status).toBe("DRAFT");
    expect(result.snapshot.draft.items.length).toBeGreaterThan(0);
    expect(result.snapshot.draft.items.length).toBeLessThanOrEqual(13);
  });

  it("is deterministic for identical inputs and data versions", () => {
    const first = runDeterministicEnginePipeline(baseInput);
    const second = runDeterministicEnginePipeline(baseInput);

    expect(first.snapshot).toEqual(second.snapshot);
    expect(first.optimizer).toEqual(second.optimizer);
  });

  it("uses only the approved requirement set version", () => {
    const result = runDeterministicEnginePipeline(baseInput);

    expect(result.snapshot.requirementSetVersion).toBe(APPROVED_REQUIREMENT_SET_VERSION);
  });

  it("excludes egg foods when egg allergen is declared", () => {
    const result = runDeterministicEnginePipeline({
      ...baseInput,
      excludedAllergens: ["egg"],
    });

    expect(result.optimizer.status).toBe("infeasible");
    expect(result.optimizer.infeasibleReason).toBe("no_candidate_for_category");
  });
});
