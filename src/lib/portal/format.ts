import type { PlanSlot } from "@/lib/nutrition/plan-engine";
import { SLOT_LABELS, humanizeKey } from "@/lib/content/labels";
import { resolveContent } from "@/lib/content/resolve";

/**
 * Display shape for one planned food. Household counts win over grams when the
 * plan carries them, so the reader sees "2 eggs" rather than "100 g".
 */
export function formatPlanSlot(slot: PlanSlot): {
  name: string;
  amount: string;
  unit: string;
} {
  const name = resolveContent(slot.nameKey) ?? SLOT_LABELS[slot.slot] ?? slot.slot;

  if (slot.householdCount != null) {
    const key = slot.householdLabelKey ?? "";
    return {
      name,
      amount: String(slot.householdCount),
      unit: resolveContent(key) ?? (key ? humanizeKey(key) : "portion"),
    };
  }

  return { name, amount: String(slot.grams), unit: "g" };
}

export function weekLabel(week: number): string {
  return `Week ${String(week).padStart(2, "0")}`;
}

/** Position inside the authored rotation, which is what the product may claim. */
export function rotationPosition(week: number, authoredWeeks: number): number {
  if (authoredWeeks <= 0) return 1;
  return ((week - 1) % authoredWeeks) + 1;
}

/**
 * Variety keys are catalogue identifiers. Until reviewed copy lands, show a
 * readable leaf rather than inventing a name.
 */
export function formatVarietyKey(key: string): string {
  const leaf = key.split(".").pop() ?? key;
  const words = leaf.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
