import { describe, expect, it } from "vitest";
import { totalsForPortions } from "@/lib/nutrition/contribution";
import {
  compareCoverage,
  gapsFromRemoval,
  nutrientDeltaOnRemoval,
} from "@/lib/nutrition/coverage";
import { resolveDailyRequirements } from "@/lib/nutrition/requirements";

describe("coverage", () => {
  const liverProfile = [
    {
      nutrientCode: "protein",
      unit: "g" as const,
      amount: 16.9,
      perAmountG: 100,
      source: "fixture-v1",
      sourceVersion: "2026.08.12",
    },
    {
      nutrientCode: "iron",
      unit: "mg" as const,
      amount: 9,
      perAmountG: 100,
      source: "fixture-v1",
      sourceVersion: "2026.08.12",
    },
    {
      nutrientCode: "vitamin_a",
      unit: "mcg" as const,
      amount: 11000,
      perAmountG: 100,
      source: "fixture-v1",
      sourceVersion: "2026.08.12",
    },
  ];

  const eggProfile = [
    {
      nutrientCode: "protein",
      unit: "g" as const,
      amount: 12.6,
      perAmountG: 100,
      source: "fixture-v1",
      sourceVersion: "2026.08.12",
    },
    {
      nutrientCode: "iron",
      unit: "mg" as const,
      amount: 1.8,
      perAmountG: 100,
      source: "fixture-v1",
      sourceVersion: "2026.08.12",
    },
  ];

  const requirements = resolveDailyRequirements({
    profile: { age: 30, sex: "female" },
    rows: [
      {
        nutrientCode: "protein",
        ageMin: 19,
        ageMax: 50,
        sex: "female",
        referenceType: "PRI",
        value: 45,
        valueMin: null,
        valueMax: null,
        unit: "g",
      },
      {
        nutrientCode: "iron",
        ageMin: 19,
        ageMax: 50,
        sex: "female",
        referenceType: "PRI",
        value: 15,
        valueMin: null,
        valueMax: null,
        unit: "mg",
      },
      {
        nutrientCode: "vitamin_a",
        ageMin: 19,
        ageMax: 50,
        sex: null,
        referenceType: "PRI",
        value: 700,
        valueMin: null,
        valueMax: null,
        unit: "mcg",
      },
    ],
  });

  it("reports gaps and surpluses against daily requirements", () => {
    const totals = totalsForPortions({
      portions: [
        { foodId: "liver", grams: 15 },
        { foodId: "egg", grams: 100 },
      ],
      profiles: new Map([
        ["liver", liverProfile],
        ["egg", eggProfile],
      ]),
    });

    const coverage = compareCoverage({ requirements, totals });
    const iron = coverage.find((row) => row.nutrientCode === "iron");
    expect(iron?.actual).toBeCloseTo(3.15, 3);
    expect(iron?.gap).toBeCloseTo(11.85, 3);
  });

  it("computes nutrient loss when a food is removed", () => {
    const withLiver = totalsForPortions({
      portions: [
        { foodId: "liver", grams: 15 },
        { foodId: "egg", grams: 100 },
      ],
      profiles: new Map([
        ["liver", liverProfile],
        ["egg", eggProfile],
      ]),
    });

    const withoutLiver = totalsForPortions({
      portions: [{ foodId: "egg", grams: 100 }],
      profiles: new Map([
        ["liver", liverProfile],
        ["egg", eggProfile],
      ]),
    });

    const delta = nutrientDeltaOnRemoval({
      withFood: withLiver,
      withoutFood: withoutLiver,
    });

    const ironLost = delta.find((row) => row.nutrientCode === "iron");
    expect(ironLost?.lost).toBeCloseTo(1.35, 3);

    const baseline = compareCoverage({ requirements, totals: withLiver });
    const afterRemoval = gapsFromRemoval({
      baselineCoverage: baseline,
      removalDelta: delta,
    });
    const ironGap = afterRemoval.find((row) => row.nutrientCode === "iron");
    expect(ironGap?.gap).toBeGreaterThan(
      baseline.find((row) => row.nutrientCode === "iron")!.gap,
    );
  });
});
