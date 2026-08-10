import { SLOT_LABELS } from "@/lib/content/labels";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";

/** Always-visible note when a portion absorbed another through a swap. */
export function personalSubstitutionNote(
  absorbedFrom: readonly FoodSlot[],
): string | undefined {
  if (absorbedFrom.length === 0) return undefined;
  return "Personal substitution applied";
}

/**
 * Explains a swap in product language. Describes engine behaviour only — not
 * nutrient science, which must come from the reviewed catalogue.
 */
export function personalSubstitutionDetail(
  absorbedFrom: readonly FoodSlot[],
): string | undefined {
  if (absorbedFrom.length === 0) return undefined;

  const labels = absorbedFrom.map(
    (slot) => SLOT_LABELS[slot]?.toLowerCase() ?? slot.replace(/_/g, " "),
  );

  if (labels.length === 1) {
    return `Your usual ${labels[0]} allocation was directed here based on your preferences.`;
  }

  const head = labels.slice(0, -1).join(", ");
  const tail = labels[labels.length - 1];
  return `Your usual ${head} and ${tail} allocations were directed here based on your preferences.`;
}
