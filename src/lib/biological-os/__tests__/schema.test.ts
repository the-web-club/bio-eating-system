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
});
