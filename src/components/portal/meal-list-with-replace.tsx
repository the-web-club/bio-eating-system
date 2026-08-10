"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { AssembledMeal } from "@/lib/portal/meal-assembly";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";
import { ReplaceMealButton, type ReplaceStep } from "./replace-meal-button";

export function MealListWithReplace({ meals }: { meals: AssembledMeal[] }) {
  const [activeRow, setActiveRow] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-hairline border-t border-hairline">
      {meals
        .filter((m) => m.items.length > 0)
        .map((meal) => {
          const primarySlot = meal.items[0]?.slot as FoodSlot | undefined;
          const isReplacing = activeRow === meal.kind;

          return (
            <li
              key={meal.kind}
              className={cn(
                "py-4 transition-[opacity,transform]",
                "[transition-duration:var(--duration-disclosure)] [transition-timing-function:var(--ease-state)]",
                isReplacing && "opacity-[0.55] translate-y-0.5",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div
                  className={cn(
                    "transition-opacity [transition-duration:var(--duration-disclosure)] [transition-timing-function:var(--ease-state)]",
                    isReplacing && "opacity-90",
                  )}
                >
                  <p className="text-lead text-foreground">{meal.label}</p>
                  <p className="mt-1 text-body text-muted">{meal.summary}</p>
                </div>
                {primarySlot ? (
                  <ReplaceMealButton
                    slot={primarySlot}
                    mealLabel={meal.label}
                    onStepChange={(step: ReplaceStep) => {
                      setActiveRow(step === "idle" || step === "done" ? null : meal.kind);
                    }}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
    </ul>
  );
}
