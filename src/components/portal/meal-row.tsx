"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { IconCheck } from "@/components/portal/icons";
import { SLOT_LABELS } from "@/lib/content/labels";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";
import { cn } from "@/lib/cn";
import {
  CONFIRM_HOLD_MS,
  mealSwapTransition,
  mealSwapVariants,
  opacityTween,
} from "@/lib/motion";
import type { AssembledMeal, AssembledMealItem } from "@/lib/portal/meal-assembly";
import {
  formatMealIngredientNames,
  MealIngredientLine,
} from "./meal-ingredient-line";
import {
  MealReplacePopover,
  type ReplaceSelection,
} from "./meal-replace-popover";
import { ReplaceGhostLink } from "./replace-ghost-link";
import { postReplaceMeal } from "@/lib/portal/replace-meal-client";

export function MealRow({
  meal,
  primarySlot,
  open,
  onOpenChange,
  showDivider,
}: {
  meal: AssembledMeal;
  primarySlot: FoodSlot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showDivider: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [items, setItems] = useState<AssembledMealItem[]>(() => [...meal.items]);
  const [showCheck, setShowCheck] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<ReplaceSelection | null>(
    null,
  );

  useEffect(() => {
    setItems([...meal.items]);
  }, [meal.items]);

  useEffect(() => {
    if (!showCheck) return;
    const hold = window.setTimeout(() => setShowCheck(false), CONFIRM_HOLD_MS);
    return () => window.clearTimeout(hold);
  }, [showCheck]);

  async function runMutation(selection: ReplaceSelection, previousItems: AssembledMealItem[]) {
    try {
      const res = await postReplaceMeal({
        slot: primarySlot,
        reason: selection.reason,
        replacementSlot: selection.replacementSlot,
      });
      if (!res.ok) throw new Error("replace_failed");
      setFailed(false);
      setPendingSelection(null);
    } catch {
      setItems(previousItems);
      setFailed(true);
      setPendingSelection(selection);
      setLiveMessage("Replacement did not save. Try again.");
    }
  }

  function handleReplace(selection: ReplaceSelection) {
    const previousItems = items;
    const nextItems = selection.replacementSlot
      ? items.map((item) =>
          item.slot === primarySlot
            ? {
                ...item,
                slot: selection.replacementSlot!,
                name: SLOT_LABELS[selection.replacementSlot!],
              }
            : item,
        )
      : items;
    const mealText = formatMealIngredientNames(nextItems);

    setItems(nextItems);
    setShowCheck(true);
    setFailed(false);
    setLiveMessage(`${meal.label} replaced with ${mealText}.`);
    void runMutation(selection, previousItems);
  }

  function retryReplace() {
    if (!pendingSelection) return;
    handleReplace(pendingSelection);
  }

  return (
    <li
      className={cn(
        "py-5",
        showDivider && "border-t border-ink-faint",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="mb-1.5 text-meal-slot uppercase tracking-[0.14em] text-ink-soft">
          {meal.label}
        </p>
        <MealReplacePopover
          slot={primarySlot}
          mealLabel={meal.label}
          open={open}
          onOpenChange={onOpenChange}
          onReplace={handleReplace}
        />
      </div>

      <div className="flex min-h-[calc(2*1.45*1.0625rem)] items-start gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={formatMealIngredientNames(items)}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={mealSwapVariants(reduceMotion)}
            transition={mealSwapTransition(reduceMotion)}
            className="min-w-0 flex-1"
          >
            <MealIngredientLine items={items} />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {showCheck ? (
            <motion.span
              key="check"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={opacityTween(reduceMotion, "confirmFade")}
              className="mt-0.5 shrink-0 text-olive"
              aria-hidden
            >
              <IconCheck className="size-4" />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      {failed ? (
        <p className="mt-2 text-meal-replace text-alert">
          Replacement did not save.{" "}
          <ReplaceGhostLink onClick={retryReplace}>Try again</ReplaceGhostLink>
        </p>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {liveMessage}
      </p>
    </li>
  );
}
