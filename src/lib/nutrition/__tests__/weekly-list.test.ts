import { describe, expect, it } from "vitest";
import {
  buildWeeklyListRows,
  mergeRotationWithPlan,
  rotationItemDisplayName,
} from "../weekly-list";
import type { PlanSlot } from "../plan-engine";
import type { RotationItem } from "../rotation";

const items: RotationItem[] = [
  {
    slot: "muscle_meat",
    labelKey: "variety.beef_sirloin",
    grams: 0,
    householdDisplay: "",
  },
  {
    slot: "eggs",
    labelKey: "variety.eggs_pasture",
    grams: 0,
    householdDisplay: "",
  },
];

const slots: PlanSlot[] = [
  {
    slot: "muscle_meat",
    grams: 140,
    householdCount: null,
    householdLabelKey: null,
    nameKey: "slot.muscle_meat",
    guidanceKey: "guidance.muscle_meat",
    absorbedFrom: [],
  },
  {
    slot: "eggs",
    grams: 100,
    householdCount: 2,
    householdLabelKey: "unit.eggs",
    nameKey: "slot.eggs",
    guidanceKey: "guidance.eggs",
    absorbedFrom: [],
  },
];

describe("rotationItemDisplayName", () => {
  it("falls back to a readable variety leaf when catalogue copy is missing", () => {
    expect(rotationItemDisplayName("muscle_meat", "variety.beef_sirloin")).toBe(
      "Beef sirloin",
    );
  });
});

describe("buildWeeklyListRows", () => {
  it("never emits raw catalogue keys as the display name", () => {
    const rows = buildWeeklyListRows(items, null, "HOUSEHOLD");
    for (const row of rows) {
      expect(row.name.includes(".")).toBe(false);
      expect(row.name.startsWith("variety")).toBe(false);
    }
  });

  it("uses plan amounts when a GeneratedPlan is available", () => {
    const rows = buildWeeklyListRows(items, slots, "METRIC");
    expect(rows.find((r) => r.slot === "muscle_meat")?.amount).toBe("140 g");
    expect(rows.find((r) => r.slot === "eggs")?.amount).toBe("100 g");
  });

  it("prefers household wording when the unit system is HOUSEHOLD", () => {
    const rows = buildWeeklyListRows(items, slots, "HOUSEHOLD");
    expect(rows.find((r) => r.slot === "eggs")?.amount).toBe("2 eggs");
  });
});

describe("mergeRotationWithPlan", () => {
  it("copies grams from the plan onto matching rotation slots", () => {
    const merged = mergeRotationWithPlan(items, slots);
    expect(merged.find((i) => i.slot === "muscle_meat")?.grams).toBe(140);
  });
});
