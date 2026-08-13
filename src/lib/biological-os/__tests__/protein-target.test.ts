import { describe, expect, it } from "vitest";
import {
  applyProteinTargetToRequirements,
  resolveProteinTargetGrams,
} from "@/lib/biological-os/protein-target";
import { TEST_PROFILE_FEMALE } from "./fixtures";

describe("protein target", () => {
  it("returns null for no_preference", () => {
    expect(
      resolveProteinTargetGrams({
        profile: TEST_PROFILE_FEMALE,
        preference: { preference: "no_preference" },
      }),
    ).toBeNull();
  });

  it("computes g_per_kg targets from body weight", () => {
    expect(
      resolveProteinTargetGrams({
        profile: TEST_PROFILE_FEMALE,
        preference: { preference: "g_per_kg_1_0" },
      }),
    ).toBe(65);
  });

  it("uses custom value when provided", () => {
    expect(
      resolveProteinTargetGrams({
        profile: TEST_PROFILE_FEMALE,
        preference: { preference: "custom", customValue: 90 },
      }),
    ).toBe(90);
  });

  it("rejects invalid custom values", () => {
    expect(() =>
      resolveProteinTargetGrams({
        profile: TEST_PROFILE_FEMALE,
        preference: { preference: "custom", customValue: 0 },
      }),
    ).toThrow(/positive customValue/i);
  });

  it("overrides only the protein requirement row", () => {
    const next = applyProteinTargetToRequirements({
      requirements: [
        { nutrientCode: "protein", unit: "g", value: 48.6 },
        { nutrientCode: "iron", unit: "mg", value: 16 },
      ],
      proteinTargetGrams: 104,
    });

    expect(next).toEqual([
      { nutrientCode: "protein", unit: "g", value: 104 },
      { nutrientCode: "iron", unit: "mg", value: 16 },
    ]);
  });
});
