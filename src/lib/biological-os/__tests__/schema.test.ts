import { describe, expect, it } from "vitest";
import { biologicalOsEngineRunBodySchema } from "@/lib/biological-os/schema";

describe("biological os engine run schema", () => {
  it("accepts a valid internal run payload", () => {
    const parsed = biologicalOsEngineRunBodySchema.safeParse({
      age: 30,
      sex: "female",
      bodyWeightKg: 65,
      excludedAllergens: ["egg"],
    });

    expect(parsed.success).toBe(true);
  });

  it("requires customValue for custom protein preference", () => {
    const parsed = biologicalOsEngineRunBodySchema.safeParse({
      age: 30,
      sex: "female",
      bodyWeightKg: 65,
      proteinPreference: { preference: "custom" },
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts activity and daily life fields from the master contract", () => {
    const parsed = biologicalOsEngineRunBodySchema.safeParse({
      age: 30,
      sex: "female",
      bodyWeightKg: 65,
      heightCm: 170,
      dailyLife: {
        occupationMovement: "mostly_sitting",
        baselineOccupationPal: 1.2,
      },
      activities: [
        {
          label: "padel",
          minutesPerSession: 90,
          sessionsPerWeek: 2,
          metCode: "RACKET_GENERIC_MODERATE",
          metValue: 7,
          resolution: "category_match",
        },
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it("requires heightCm when dailyLife is provided", () => {
    const parsed = biologicalOsEngineRunBodySchema.safeParse({
      age: 30,
      sex: "female",
      bodyWeightKg: 65,
      dailyLife: {
        occupationMovement: "mostly_sitting",
        baselineOccupationPal: 1.2,
      },
    });

    expect(parsed.success).toBe(false);
  });
});
