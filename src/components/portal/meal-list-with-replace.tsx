"use client";

import { ReplaceMealButton } from "./replace-meal-button";
import type { AssembledMeal } from "@/lib/portal/meal-assembly";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";

export function MealListWithReplace({ meals }: { meals: AssembledMeal[] }) {
  return (
    <ul className="divide-y divide-hairline border-t border-hairline">
      {meals
        .filter((m) => m.items.length > 0)
        .map((meal) => {
          const primarySlot = meal.items[0]?.slot as FoodSlot | undefined;
          return (
            <li key={meal.kind} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lead text-foreground">{meal.label}</p>
                  <p className="mt-1 text-body text-muted">{meal.summary}</p>
                </div>
                {primarySlot ? (
                  <ReplaceMealButton slot={primarySlot} mealLabel={meal.label} />
                ) : null}
              </div>
            </li>
          );
        })}
    </ul>
  );
}
