import type { AssembledMealItem } from "@/lib/portal/meal-assembly";

export function MealIngredientLine({ items }: { items: readonly AssembledMealItem[] }) {
  if (items.length === 0) {
    return <span className="text-body-lg text-foreground">Nothing planned</span>;
  }

  return (
    <span className="text-body-lg leading-[1.45] text-foreground">
      {items.map((item, index) => (
        <span key={item.slot}>
          {index > 0 ? <span className="text-faint"> + </span> : null}
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
