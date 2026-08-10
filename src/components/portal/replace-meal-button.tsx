"use client";

import { useRouter } from "next/navigation";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";
import { MealReplacePopover, type ReplaceSelection } from "./meal-replace-popover";

/** Thin wrapper so shop list and other call sites keep a stable import path. */
export function ReplaceMealButton({
  slot,
  mealLabel,
  className,
}: {
  slot: FoodSlot;
  mealLabel: string;
  className?: string;
}) {
  const router = useRouter();

  function handleReplace(_selection: ReplaceSelection) {
    router.refresh();
  }

  return (
    <MealReplacePopover
      slot={slot}
      mealLabel={mealLabel}
      className={className}
      onReplace={handleReplace}
    />
  );
}
