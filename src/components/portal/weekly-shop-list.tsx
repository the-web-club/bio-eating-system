"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Checkbox } from "@/components/ui/checkbox";
import { ReplaceMealButton } from "./replace-meal-button";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";

export type ShopItem = {
  id: string;
  slot: FoodSlot;
  name: string;
  line: string;
  category: string;
};

export function WeeklyShopList({ items }: { items: ShopItem[] }) {
  const [have, setHave] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shop-have");
      if (raw) setHave(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleHave(id: string, checked: boolean) {
    setHave((prev) => {
      const next = { ...prev, [id]: checked };
      localStorage.setItem("shop-have", JSON.stringify(next));
      return next;
    });
  }

  const byCategory = items.reduce<Record<string, ShopItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-group">
      {Object.entries(byCategory).map(([category, catItems]) => (
        <div key={category}>
          <h3 className="text-lead text-foreground">{category}</h3>
          <ul className="mt-2 divide-y divide-hairline border-t border-hairline">
            {catItems.map((item) => {
              const checked = have[item.id] ?? false;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "py-3 transition-[opacity,color]",
                    "[transition-duration:var(--duration-selection)] [transition-timing-function:var(--ease-state)]",
                    checked && "opacity-70",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Checkbox
                      id={`have-${item.id}`}
                      label={item.line}
                      checked={checked}
                      onCheckedChange={(c) => toggleHave(item.id, c)}
                    />
                    <ReplaceMealButton slot={item.slot} mealLabel={item.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
