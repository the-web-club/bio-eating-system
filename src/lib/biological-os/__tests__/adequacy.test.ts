import { describe, expect, it } from "vitest";
import { buildBiologicalAdequacyReport, nutrientsWithCompositionData } from "@/lib/biological-os/adequacy";
import type { DailyRequirement } from "@/lib/nutrition-data/types";

describe("biological adequacy", () => {
  const requirements: DailyRequirement[] = [
    { nutrientCode: "iron", unit: "mg", value: 16 },
    { nutrientCode: "chromium", unit: "mcg", value: 40 },
  ];

  it("marks nutrients without composition data as unknown", () => {
    const compositionNutrientCodes = nutrientsWithCompositionData([
      { nutrients: [{ nutrientCode: "iron", amount: 2.1 }] },
    ]);

    const report = buildBiologicalAdequacyReport({
      coverage: [
        {
          nutrientCode: "iron",
          unit: "mg",
          target: 16,
          actual: 2.1,
          gap: 13.9,
          surplus: 0,
        },
        {
          nutrientCode: "chromium",
          unit: "mcg",
          target: 40,
          actual: 0,
          gap: 40,
          surplus: 0,
        },
      ],
      requirements,
      compositionNutrientCodes,
    });

    expect(report.isBiologicallyComplete).toBe(false);
    expect(report.unresolvedNutrients).toEqual(["chromium"]);
    expect(report.rows.find((row) => row.nutrientCode === "chromium")?.status).toBe("unknown");
    expect(report.rows.find((row) => row.nutrientCode === "iron")?.status).toBe("gap");
  });
});
