import { describe, expect, it } from "vitest";
import {
  nutrientAmountForPortion,
  totalsForPortions,
} from "@/lib/nutrition/contribution";

describe("contribution", () => {
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
  ];

  it("scales nutrient amount by portion grams", () => {
    expect(nutrientAmountForPortion(liverProfile[0]!, 50)).toBeCloseTo(8.45, 4);
    expect(nutrientAmountForPortion(liverProfile[1]!, 15)).toBeCloseTo(1.35, 4);
  });

  it("sums totals across multiple foods deterministically", () => {
    const eggProfile = [
      {
        nutrientCode: "protein",
        unit: "g" as const,
        amount: 12.6,
        perAmountG: 100,
        source: "fixture-v1",
        sourceVersion: "2026.08.12",
      },
    ];

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

    const protein = totals.find((row) => row.nutrientCode === "protein");
    expect(protein?.total).toBeCloseTo(15.135, 3);
  });
});
