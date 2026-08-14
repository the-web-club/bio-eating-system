import { describe, expect, it } from "vitest";
import {
  computeEnergyEstimate,
  exerciseKcalPerWeek,
  mifflinStJeorBmr,
} from "@/lib/biological-os/energy";

describe("energy calculations", () => {
  it("computes Mifflin-St Jeor BMR for a female profile", () => {
    const bmr = mifflinStJeorBmr({
      sex: "female",
      ageYears: 30,
      heightCm: 170,
      weightKg: 65,
    });

    expect(bmr).toBeCloseTo(1401.5, 1);
  });

  it("computes weekly exercise kcal from MET", () => {
    const weekly = exerciseKcalPerWeek({
      metValue: 7,
      weightKg: 65,
      minutesPerSession: 90,
      sessionsPerWeek: 2,
    });

    expect(weekly).toBeCloseTo(1365, 0);
  });

  it("builds a versioned TDEE estimate from the pack example", () => {
    const estimate = computeEnergyEstimate({
      sex: "female",
      ageYears: 30,
      heightCm: 170,
      weightKg: 65,
      baselineOccupationPal: 1.2,
      weeklyExerciseKcal: 1365,
    });

    expect(estimate.calculationVersion).toBe("energy-mifflin-met-v1");
    expect(estimate.tdeeKcal).toBeCloseTo(1876.8, 0);
    expect(estimate.dailyExerciseKcal).toBeCloseTo(195, 0);
  });
});
