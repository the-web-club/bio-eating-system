import { describe, expect, it } from "vitest";
import {
  resolveActivityProfile,
  resolveActivityRow,
  resolveOccupationPal,
} from "@/lib/biological-os/activity-profile";

describe("activity profile", () => {
  it("resolves occupation PAL from the reference table", () => {
    expect(resolveOccupationPal("mostly_sitting")).toBe(1.2);
  });

  it("matches padel to the racket MET by alias", () => {
    const resolved = resolveActivityRow({
      row: {
        label: "padel",
        minutesPerSession: 90,
        sessionsPerWeek: 2,
      },
      weightKg: 65,
    });

    expect(resolved.metCode).toBe("RACKET_GENERIC_MODERATE");
    expect(resolved.metValue).toBe(7);
    expect(resolved.resolution).toBe("category_match");
    expect(resolved.weeklyKcal).toBeGreaterThan(0);
  });

  it("aggregates multiple activities for a profile", () => {
    const profile = resolveActivityProfile({
      weightKg: 65,
      occupationMovement: "mostly_sitting",
      activities: [
        { label: "padel", minutesPerSession: 90, sessionsPerWeek: 2 },
        {
          label: "strength training",
          minutesPerSession: 60,
          sessionsPerWeek: 3,
          metCode: "STRENGTH_GENERIC_MODERATE",
          metValue: 5,
          resolution: "exact",
        },
      ],
    });

    expect(profile.baselineOccupationPal).toBe(1.2);
    expect(profile.weeklyExerciseKcal).toBeGreaterThan(0);
    expect(profile.unresolvedActivityLabels).toEqual([]);
  });
});
