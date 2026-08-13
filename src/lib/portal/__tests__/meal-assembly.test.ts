import { describe, expect, it } from "vitest";
import { assembleMeals, todaySummary } from "@/lib/portal/meal-assembly";
import type { PlanSlot } from "@/lib/nutrition/plan-engine";

function slot(name: PlanSlot["slot"], grams: number): PlanSlot {
  return {
    slot: name,
    grams,
    householdCount: null,
    householdLabelKey: null,
    nameKey: `slot.${name}.name`,
    guidanceKey: `slot.${name}.guidance`,
    absorbedFrom: [],
  };
}

describe("meal-assembly", () => {
  it("groups slots into meals", () => {
    const meals = assembleMeals([
      slot("eggs", 100),
      slot("muscle_meat", 150),
      slot("small_fish", 60),
    ]);
    expect(meals.find((m) => m.kind === "breakfast")?.items).toHaveLength(1);
    expect(meals.find((m) => m.kind === "lunch")?.items).toHaveLength(1);
    expect(meals.find((m) => m.kind === "dinner")?.items).toHaveLength(1);
  });

  it("summarizes today counts", () => {
    const meals = assembleMeals([
      slot("eggs", 100),
      slot("berries", 100),
      slot("muscle_meat", 150),
      slot("tubers", 120),
      slot("small_fish", 60),
      slot("aromatics", 25),
    ]);
    const summary = todaySummary(meals, { groceryTasks: 1, decisions: 0 });
    expect(summary.mealCount).toBeGreaterThanOrEqual(2);
    expect(summary.decisions).toBe(0);
  });
});
