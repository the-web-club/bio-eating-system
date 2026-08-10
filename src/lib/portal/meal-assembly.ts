import type { FoodSlot, PlanSlot } from "@/lib/nutrition/plan-engine";
import { SLOT_LABELS, humanizeKey } from "@/lib/content/labels";

export type MealKind = "breakfast" | "lunch" | "dinner" | "optional";

export type AssembledMealItem = {
  slot: FoodSlot;
  name: string;
  amount: string;
  unit: string;
};

export type AssembledMeal = {
  kind: MealKind;
  label: string;
  items: AssembledMealItem[];
  /** Combined summary line, e.g. "Eggs + berries + kiwi" */
  summary: string;
};

/** Heuristic slot→meal map. Replace with dietitian templates in Phase D. */
export const MEAL_SLOT_MAP: Record<MealKind, readonly FoodSlot[]> = {
  breakfast: ["eggs", "berries", "kiwi"],
  lunch: ["muscle_meat", "tubers", "cruciferous", "olive_oil"],
  dinner: ["small_fish", "bivalves", "organ_meat", "mushrooms", "fermented"],
  optional: ["aromatics"],
};

const MEAL_LABELS: Record<MealKind, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  optional: "Optional",
};

function formatSlotForDisplay(slot: PlanSlot): {
  name: string;
  amount: string;
  unit: string;
} {
  const name = SLOT_LABELS[slot.slot] ?? slot.slot;
  if (slot.householdCount != null) {
    const key = slot.householdLabelKey ?? "";
    return {
      name,
      amount: String(slot.householdCount),
      unit: key ? humanizeKey(key) : "portion",
    };
  }
  return { name, amount: String(slot.grams), unit: "g" };
}

function slotToItem(slot: PlanSlot): AssembledMealItem {
  const { name, amount, unit } = formatSlotForDisplay(slot);
  return { slot: slot.slot, name, amount, unit };
}

/**
 * Groups daily plan portions into customer-facing meals.
 * Portions not in the map fall into optional.
 */
export function assembleMeals(slots: readonly PlanSlot[]): AssembledMeal[] {
  const bySlot = new Map(slots.map((s) => [s.slot, s]));
  const assigned = new Set<FoodSlot>();

  const meals: AssembledMeal[] = (Object.keys(MEAL_SLOT_MAP) as MealKind[]).map(
    (kind) => {
      const items = MEAL_SLOT_MAP[kind]
        .map((slot) => bySlot.get(slot))
        .filter((s): s is PlanSlot => s != null)
        .map(slotToItem);
      items.forEach((i) => assigned.add(i.slot));
      const summary =
        items.length > 0
          ? items.map((i) => i.name).join(" + ")
          : "Nothing planned";
      return { kind, label: MEAL_LABELS[kind], items, summary };
    },
  );

  const unassigned = slots.filter((s) => !assigned.has(s.slot));
  if (unassigned.length > 0) {
    const optional = meals.find((m) => m.kind === "optional");
    if (optional) {
      for (const slot of unassigned) {
        optional.items.push(slotToItem(slot));
      }
      optional.summary =
        optional.items.length > 0
          ? optional.items.map((i) => i.name).join(" + ")
          : "Nothing planned";
    }
  }

  return meals.filter((m) => m.kind !== "optional" || m.items.length > 0);
}

export type TodaySummary = {
  mealCount: number;
  optionalCount: number;
  groceryTasks: number;
  decisions: number;
};

export function todaySummary(
  meals: readonly AssembledMeal[],
  options?: { groceryTasks?: number; decisions?: number },
): TodaySummary {
  const mainMeals = meals.filter(
    (m) => m.kind !== "optional" && m.items.length > 0,
  );
  const optional = meals.filter(
    (m) => m.kind === "optional" && m.items.length > 0,
  );
  return {
    mealCount: mainMeals.length,
    optionalCount: optional.length,
    groceryTasks: options?.groceryTasks ?? 1,
    decisions: options?.decisions ?? 0,
  };
}

export function mealKindLabel(kind: MealKind): string {
  return MEAL_LABELS[kind];
}

export function slotDisplayName(slot: FoodSlot): string {
  return SLOT_LABELS[slot];
}
