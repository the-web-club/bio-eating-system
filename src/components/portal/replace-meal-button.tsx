"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";
import { postReplaceMeal } from "@/lib/portal/replace-meal-client";
import { MealReplacePopover, type ReplaceSelection } from "./meal-replace-popover";
import { ReplaceGhostLink } from "./replace-ghost-link";

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
  const [failed, setFailed] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<ReplaceSelection | null>(
    null,
  );

  async function handleReplace(selection: ReplaceSelection) {
    setFailed(false);
    try {
      const res = await postReplaceMeal({
        slot,
        reason: selection.reason,
        replacementSlot: selection.replacementSlot,
      });
      if (!res.ok) throw new Error("replace_failed");
      setPendingSelection(null);
      router.refresh();
    } catch {
      setFailed(true);
      setPendingSelection(selection);
    }
  }

  function retryReplace() {
    if (!pendingSelection) return;
    void handleReplace(pendingSelection);
  }

  return (
    <div className={className}>
      <MealReplacePopover
        slot={slot}
        mealLabel={mealLabel}
        onReplace={(selection) => void handleReplace(selection)}
      />
      {failed ? (
        <p className="mt-2 text-meal-replace text-alert">
          Replacement did not save.{" "}
          <ReplaceGhostLink onClick={retryReplace}>Try again</ReplaceGhostLink>
        </p>
      ) : null}
    </div>
  );
}
