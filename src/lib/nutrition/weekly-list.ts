import { SLOT_LABELS, humanizeKey } from "@/lib/content/labels";
import { resolveContent } from "@/lib/content/resolve";
import { formatVarietyKey } from "@/lib/portal/format";
import type { FoodSlot, PlanSlot } from "./plan-engine";
import type { RotationItem } from "./rotation";

export type WeeklyListUnit = "METRIC" | "HOUSEHOLD" | "SIMPLE";

export type WeeklyListRow = {
  slot: FoodSlot;
  name: string;
  amount: string;
};

/**
 * Variety catalogue key → readable name. Same fallback chain as the weekly
 * portal view: reviewed copy, then a capitalised leaf, then the slot label.
 */
export function rotationItemDisplayName(
  slot: FoodSlot,
  labelKey: string,
): string {
  return (
    resolveContent(labelKey) ??
    formatVarietyKey(labelKey) ??
    SLOT_LABELS[slot] ??
    humanizeKey(labelKey)
  );
}

/**
 * Overlay daily-plan quantities onto rotation varieties so email and portal
 * can share one merge rule.
 */
export function mergeRotationWithPlan(
  items: readonly RotationItem[],
  slots: readonly PlanSlot[] | null,
): RotationItem[] {
  if (!slots || slots.length === 0) return [...items];
  const bySlot = new Map(slots.map((s) => [s.slot, s]));

  return items.map((item) => {
    const match = bySlot.get(item.slot);
    if (!match) return item;
    return {
      ...item,
      grams: match.grams,
      householdDisplay: formatPlanAmount(match, "HOUSEHOLD"),
    };
  });
}

function formatPlanAmount(slot: PlanSlot, unit: WeeklyListUnit): string {
  if (unit === "METRIC" || slot.householdCount == null) {
    return `${slot.grams} g`;
  }
  const unitLabel =
    resolveContent(slot.householdLabelKey ?? "") ??
    (slot.householdLabelKey ? humanizeKey(slot.householdLabelKey) : "portion");
  return `${slot.householdCount} ${unitLabel}`;
}

/** Rows ready for the weekly shopping-list email or a plain text preview. */
export function buildWeeklyListRows(
  items: readonly RotationItem[],
  slots: readonly PlanSlot[] | null,
  unit: WeeklyListUnit,
): WeeklyListRow[] {
  const bySlot = slots ? new Map(slots.map((s) => [s.slot, s])) : null;

  return items.map((item) => {
    const match = bySlot?.get(item.slot);
    const amount = match
      ? formatPlanAmount(match, unit)
      : item.grams > 0
        ? `${item.grams} g`
        : item.householdDisplay || "-";

    return {
      slot: item.slot,
      name: rotationItemDisplayName(item.slot, item.labelKey),
      amount,
    };
  });
}
