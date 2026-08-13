"use client";

import { MealRow } from "./meal-row";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AssembledMeal } from "@/lib/portal/meal-assembly";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";
import { MealListSection } from "./meal-list-section";

export function MealListWithReplace({
  meals,
  title,
  meta,
}: {
  meals: AssembledMeal[];
  title?: string;
  meta?: ReactNode;
}) {
  const [openKind, setOpenKind] = useState<string | null>(null);
  const visibleMeals = meals.filter((meal) => meal.items.length > 0);

  return (
    <MealListSection title={title} meta={meta}>
      <ul className="meal-stack">
        {visibleMeals.map((meal) => {
          const primarySlot = meal.items[0]?.slot as FoodSlot | undefined;
          if (!primarySlot) return null;

          return (
            <MealRow
              key={meal.kind}
              meal={meal}
              primarySlot={primarySlot}
              open={openKind === meal.kind}
              onOpenChange={(next) => setOpenKind(next ? meal.kind : null)}
            />
          );
        })}
      </ul>
    </MealListSection>
  );
}
