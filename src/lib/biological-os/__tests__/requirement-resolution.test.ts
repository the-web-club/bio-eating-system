import { describe, expect, it } from "vitest";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
  resolveEngineRequirements,
} from "@/lib/biological-os";
import {
  EFSA_REQUIREMENT_ROWS,
  TEST_PROFILE_FEMALE,
  TEST_PROFILE_MALE,
} from "./fixtures";

describe("requirement resolution", () => {
  it("resolves approved EFSA requirements for female adults", () => {
    const requirements = resolveEngineRequirements({
      profile: TEST_PROFILE_FEMALE,
      rows: EFSA_REQUIREMENT_ROWS,
      requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
    });

    expect(requirements.find((row) => row.nutrientCode === "protein")).toMatchObject({
      value: 48.6,
      unit: "g",
    });
    expect(requirements.find((row) => row.nutrientCode === "iron")).toMatchObject({
      value: 16,
      unit: "mg",
    });
    expect(requirements).toHaveLength(29);
    expect(requirements.find((row) => row.nutrientCode === "vitamin_e")).toMatchObject({
      value: 11,
      unit: "mg",
    });
  });

  it("resolves approved EFSA requirements for male adults", () => {
    const requirements = resolveEngineRequirements({
      profile: TEST_PROFILE_MALE,
      rows: EFSA_REQUIREMENT_ROWS,
      requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
    });

    expect(requirements.find((row) => row.nutrientCode === "protein")).toMatchObject({
      value: 56.5,
      unit: "g",
    });
    expect(requirements.find((row) => row.nutrientCode === "iron")).toMatchObject({
      value: 11,
      unit: "mg",
    });
  });

  it("rejects non-approved requirement set versions", () => {
    expect(() =>
      resolveEngineRequirements({
        profile: TEST_PROFILE_FEMALE,
        rows: EFSA_REQUIREMENT_ROWS,
        requirementSetVersion: "fixture-v1",
      }),
    ).toThrow(/not approved/i);
  });

  it("overrides protein with preference target", () => {
    const requirements = resolveEngineRequirements({
      profile: TEST_PROFILE_FEMALE,
      rows: EFSA_REQUIREMENT_ROWS,
      requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
      proteinPreference: { preference: "g_per_kg_1_6" },
    });

    expect(requirements.find((row) => row.nutrientCode === "protein")?.value).toBe(104);
  });
});
