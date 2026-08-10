import type { AssembledMealItem } from "@/lib/portal/meal-assembly";

export function MealIngredientLine({ items }: { items: readonly AssembledMealItem[] }) {
  if (items.length === 0) {
    return <span className="text-meal-content text-ink-deep">Nothing planned</span>;
  }

  return (
    <span className="text-meal-content leading-[1.45] text-ink-deep">
      {items.map((item, index) => (
        <span key={item.slot}>
          {index > 0 ? <span className="text-ink-faint"> + </span> : null}
          {item.name}
        </span>
      ))}
    </span>
  );
}

/** Plain sentence for aria-live and optimistic labels. */
export function formatMealIngredientNames(items: readonly AssembledMealItem[]): string {
  return items.map((item) => item.name).join(" + ");
}
