import { describe, expect, it } from "vitest";
import { resolveDailyRequirements } from "@/lib/nutrition/requirements";

describe("requirements", () => {
  const rows = [
    {
      nutrientCode: "protein",
      ageMin: 19,
      ageMax: 50,
      sex: "female" as const,
      referenceType: "PRI" as const,
      value: 45,
      valueMin: null,
      valueMax: null,
      unit: "g" as const,
    },
    {
      nutrientCode: "protein",
      ageMin: 19,
      ageMax: 50,
      sex: "male" as const,
      referenceType: "PRI" as const,
      value: 56,
      valueMin: null,
      valueMax: null,
      unit: "g" as const,
    },
    {
      nutrientCode: "zinc",
      ageMin: 19,
      ageMax: 50,
      sex: null,
      referenceType: "PRI" as const,
      value: 8,
      valueMin: null,
      valueMax: null,
      unit: "mg" as const,
    },
  ];

  it("selects sex-specific targets when available", () => {
    const female = resolveDailyRequirements({
      profile: { age: 30, sex: "female" },
      rows,
    });
    expect(female.find((row) => row.nutrientCode === "protein")?.value).toBe(45);

    const male = resolveDailyRequirements({
      profile: { age: 30, sex: "male" },
      rows,
    });
    expect(male.find((row) => row.nutrientCode === "protein")?.value).toBe(56);
  });

  it("falls back to sex-neutral targets", () => {
    const female = resolveDailyRequirements({
      profile: { age: 30, sex: "female" },
      rows,
    });
    expect(female.find((row) => row.nutrientCode === "zinc")?.value).toBe(8);
  });
});
