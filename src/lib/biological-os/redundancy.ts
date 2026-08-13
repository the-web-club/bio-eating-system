import type { RedundancyDecision } from "@/generated/prisma/client";
import { GRAIN_OVERLAP_NUTRIENTS } from "@/lib/biological-os/constants";
import { nutrientAmountForPortion } from "@/lib/nutrition/contribution";
import type {
  ChangeReason,
  EngineFoodCandidate,
  FoodMatrixDraft,
  RedundancyAssessmentRecord,
  RedundancyChoiceRecord,
  RedundancyProposal,
} from "@/lib/biological-os/types";

const OVERLAP_THRESHOLD = 0.1;

function pairKey(foodAId: string, foodBId: string): string {
  return foodAId < foodBId ? `${foodAId}|${foodBId}` : `${foodBId}|${foodAId}`;
}

function normalizePair(foodAId: string, foodBId: string): { foodAId: string; foodBId: string } {
  return foodAId < foodBId ? { foodAId, foodBId } : { foodAId: foodBId, foodBId: foodAId };
}

export function overlapNutrients(args: {
  foodA: EngineFoodCandidate;
  foodB: EngineFoodCandidate;
  portionGrams: number;
}): string[] {
  if (args.foodA.biologicalCategory !== args.foodB.biologicalCategory) {
    return [];
  }

  const overlap: string[] = [];

  for (const nutrientCode of GRAIN_OVERLAP_NUTRIENTS) {
    const rowA = args.foodA.nutrients.find((row) => row.nutrientCode === nutrientCode);
    const rowB = args.foodB.nutrients.find((row) => row.nutrientCode === nutrientCode);
    if (!rowA || !rowB) continue;

    const amountA = nutrientAmountForPortion(rowA, args.portionGrams);
    const amountB = nutrientAmountForPortion(rowB, args.portionGrams);
    if (amountA <= 0 || amountB <= 0) continue;

    const ratio = Math.min(amountA, amountB) / Math.max(amountA, amountB);
    if (ratio >= OVERLAP_THRESHOLD) {
      overlap.push(nutrientCode);
    }
  }

  return overlap.sort();
}

export function detectRedundancyPairs(args: {
  draft: FoodMatrixDraft;
  candidatesById: Map<string, EngineFoodCandidate>;
  redundancyChoices?: RedundancyChoiceRecord[];
  portionGrams: number;
}): RedundancyAssessmentRecord[] {
  const choicesByPair = new Map(
    (args.redundancyChoices ?? []).map((choice) => [
      pairKey(choice.foodAId, choice.foodBId),
      choice,
    ]),
  );

  const foodIds = [...new Set(args.draft.items.map((item) => item.foodId))].sort();
  const assessments: RedundancyAssessmentRecord[] = [];

  for (let i = 0; i < foodIds.length; i += 1) {
    for (let j = i + 1; j < foodIds.length; j += 1) {
      const foodA = args.candidatesById.get(foodIds[i]!);
      const foodB = args.candidatesById.get(foodIds[j]!);
      if (!foodA || !foodB) continue;

      const overlap = overlapNutrients({
        foodA,
        foodB,
        portionGrams: args.portionGrams,
      });
      if (overlap.length === 0) continue;

      const pair = normalizePair(foodA.foodId, foodB.foodId);
      const prior = choicesByPair.get(pairKey(pair.foodAId, pair.foodBId));
      const level =
        prior?.decision === "keep_both" ? ("INTENTIONAL" as const) : ("POTENTIAL" as const);

      assessments.push({
        foodAId: pair.foodAId,
        foodBId: pair.foodBId,
        overlapNutrients: overlap,
        level,
      });
    }
  }

  return assessments.sort((a, b) => pairKey(a.foodAId, a.foodBId).localeCompare(pairKey(b.foodAId, b.foodBId)));
}

export function buildRedundancyProposals(
  assessments: RedundancyAssessmentRecord[],
): RedundancyProposal[] {
  return assessments
    .filter((assessment) => assessment.level === "POTENTIAL")
    .map((assessment) => ({
      assessment,
      suggestedActions: ["keep_both", "remove_a", "remove_b", "review"] as RedundancyDecision[],
    }));
}

export function applyRedundancyDecisionsToDraft(args: {
  draft: FoodMatrixDraft;
  choices: RedundancyChoiceRecord[];
  changeReasons: ChangeReason[];
}): FoodMatrixDraft {
  let items = [...args.draft.items];

  for (const choice of args.choices) {
    if (choice.decision === "keep_both") {
      args.changeReasons.push({
        code: "redundancy_keep_both",
        foodId: choice.foodAId,
        detail: choice.foodBId,
      });
      continue;
    }

    if (choice.decision === "review") {
      continue;
    }

    const removeId = choice.decision === "remove_a" ? choice.foodAId : choice.foodBId;
    items = items.filter((item) => item.foodId !== removeId);
    args.changeReasons.push({
      code: "optimizer_prune",
      foodId: removeId,
      detail: choice.decision,
    });
  }

  return { items };
}

export function applyRedundancyChoice(args: {
  draft: FoodMatrixDraft;
  choice: RedundancyChoiceRecord;
  changeReasons: ChangeReason[];
}): FoodMatrixDraft {
  return applyRedundancyDecisionsToDraft({
    draft: args.draft,
    choices: [args.choice],
    changeReasons: args.changeReasons,
  });
}

export function isProtectedByKeepBoth(args: {
  foodId: string;
  choices: RedundancyChoiceRecord[];
}): boolean {
  return args.choices.some(
    (choice) =>
      choice.decision === "keep_both" &&
      (choice.foodAId === args.foodId || choice.foodBId === args.foodId),
  );
}
