import { describe, expect, it } from "vitest";
import {
  assertNoAllergenLeak,
  generatePlan,
  type PlanInput,
} from "../plan-engine";

function baseInput(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    age: 30,
    heightCm: 170,
    weightKg: 70,
    sex: "female",
    activityFactor: 1.375,
    goal: "MAINTAIN",
    unitSystem: "METRIC",
    declaredAllergens: [],
    excludedSlots: [],
    swapRequests: [],
    screeningFlags: [],
    ...overrides,
  };
}

describe("plan engine", () => {
  it("removes bivalves for a crustaceans allergen and passes the leak check", () => {
    const input = baseInput({ declaredAllergens: ["crustaceans"] });
    const result = generatePlan(input);

    expect(result.slots.some((s) => s.slot === "bivalves")).toBe(false);
    expect(result.removed).toEqual(
      expect.arrayContaining([
        { slot: "bivalves", reasonCode: "allergen:crustaceans" },
      ]),
    );
    expect(() => assertNoAllergenLeak(input, result)).not.toThrow();
  });

  it("never includes a user-excluded slot in output", () => {
    const input = baseInput({ excludedSlots: ["organ_meat", "kiwi"] });
    const result = generatePlan(input);

    expect(result.slots.map((s) => s.slot)).not.toContain("organ_meat");
    expect(result.slots.map((s) => s.slot)).not.toContain("kiwi");
    expect(result.removed).toEqual(
      expect.arrayContaining([
        { slot: "organ_meat", reasonCode: "excluded_by_user" },
        { slot: "kiwi", reasonCode: "excluded_by_user" },
      ]),
    );
    expect(() => assertNoAllergenLeak(input, result)).not.toThrow();
  });

  it("moves 80% of swapped grams into the target, conserves that total, and ignores request order", () => {
    const forward = generatePlan(
      baseInput({ swapRequests: ["eggs", "tubers"] }),
    );
    const reverse = generatePlan(
      baseInput({ swapRequests: ["tubers", "eggs"] }),
    );

    expect(forward.slots.map((s) => s.slot).sort()).toEqual(
      reverse.slots.map((s) => s.slot).sort(),
    );
    expect(forward.slots.map((s) => `${s.slot}:${s.grams}`).sort()).toEqual(
      reverse.slots.map((s) => `${s.slot}:${s.grams}`).sort(),
    );

    const eggsGone = !forward.slots.some((s) => s.slot === "eggs");
    const tubersGone = !forward.slots.some((s) => s.slot === "tubers");
    expect(eggsGone).toBe(true);
    expect(tubersGone).toBe(true);

    const muscle = forward.slots.find((s) => s.slot === "muscle_meat");
    const berries = forward.slots.find((s) => s.slot === "berries");
    expect(muscle).toBeDefined();
    expect(berries).toBeDefined();
    expect(muscle?.absorbedFrom).toContain("eggs");
    expect(berries?.absorbedFrom).toContain("tubers");

    const unswapped = generatePlan(baseInput());
    const baselineEggs = unswapped.slots.find((s) => s.slot === "eggs")!.grams;
    const baselineMuscle = unswapped.slots.find(
      (s) => s.slot === "muscle_meat",
    )!.grams;
    const baselineTubers = unswapped.slots.find(
      (s) => s.slot === "tubers",
    )!.grams;
    const baselineBerries = unswapped.slots.find(
      (s) => s.slot === "berries",
    )!.grams;

    const expectedMuscle = Math.round(baselineMuscle + baselineEggs * 0.8);
    const expectedBerries = Math.round(baselineBerries + baselineTubers * 0.8);
    expect(muscle!.grams).toBe(expectedMuscle);
    expect(berries!.grams).toBe(expectedBerries);

    const conservedEggsMuscle =
      muscle!.grams + 0 ===
      Math.round(baselineMuscle + baselineEggs * 0.8);
    expect(conservedEggsMuscle).toBe(true);
  });

  it("leaves the original slot when the swap target is blocked by an allergen", () => {
    const input = baseInput({
      declaredAllergens: ["egg"],
      swapRequests: ["muscle_meat"],
    });
    const result = generatePlan(input);

    expect(result.slots.some((s) => s.slot === "muscle_meat")).toBe(true);
    expect(result.slots.some((s) => s.slot === "eggs")).toBe(false);
    expect(
      result.removed.some(
        (r) => r.slot === "muscle_meat" && r.reasonCode === "swapped_by_user",
      ),
    ).toBe(false);
  });

  it("keeps REDUCE at maintenance when eating_disorder_history is present", () => {
    const result = generatePlan(
      baseInput({
        goal: "REDUCE",
        screeningFlags: ["eating_disorder_history"],
      }),
    );

    expect(result.screening.outcome).toBe("maintenance_only");
    expect(result.energyKcal).toBe(result.maintenanceKcal);
  });

  it("refuses age 17 with an empty slot list", () => {
    const result = generatePlan(baseInput({ age: 17 }));

    expect(result.screening.outcome).toBe("refused");
    expect(result.slots).toEqual([]);
    expect(result.screening.reasons).toContain("age_below_minimum");
  });

  it("refuses BMI below 18.5", () => {
    // 50 kg at 170 cm => BMI ≈ 17.3
    const result = generatePlan(baseInput({ weightKg: 50, heightCm: 170 }));

    expect(result.screening.outcome).toBe("refused");
    expect(result.slots).toEqual([]);
    expect(result.screening.reasons).toContain("requires_professional_support");
  });

  it("never produces energy below the screening floor when a deficit is permitted", () => {
    const result = generatePlan(
      baseInput({
        goal: "REDUCE",
        // High activity, large body so maintenance is well above the floor.
        weightKg: 90,
        heightCm: 180,
        sex: "male",
        activityFactor: 1.9,
      }),
    );

    expect(result.screening.outcome).toBe("allowed");
    expect(result.energyKcal).toBeGreaterThanOrEqual(
      result.screening.energyFloorKcal,
    );
    expect(result.energyKcal).toBeLessThan(result.maintenanceKcal);
  });

  it("sets householdCount null for METRIC and a labelled number for HOUSEHOLD", () => {
    const metric = generatePlan(baseInput({ unitSystem: "METRIC" }));
    const household = generatePlan(baseInput({ unitSystem: "HOUSEHOLD" }));

    expect(metric.slots.length).toBeGreaterThan(0);
    for (const slot of metric.slots) {
      expect(slot.householdCount).toBeNull();
      expect(slot.householdLabelKey).toBeNull();
    }

    expect(household.slots.length).toBeGreaterThan(0);
    for (const slot of household.slots) {
      expect(typeof slot.householdCount).toBe("number");
      expect(slot.householdLabelKey).toMatch(/^unit\./);
    }
  });
});
