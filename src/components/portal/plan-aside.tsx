import { Eyebrow } from "@/components/portal/layout";
import { ActionLink } from "@/components/ui/action-link";
import { Status } from "@/components/ui/status";
import { GOAL_LABELS } from "@/lib/content/labels";

export type PlanAsideProps = {
  weekLabel: string;
  weekNumber: number;
  goal: string;
  estimatedCostEur: number;
  cookingHours: number;
  mealCount: number;
  budgetEur: number | null;
  overBudget: boolean;
  weeklyAvailable: boolean;
  basePath: string;
};

export function PlanAside({
  weekLabel,
  weekNumber,
  goal,
  estimatedCostEur,
  cookingHours,
  mealCount,
  budgetEur,
  overBudget,
  weeklyAvailable,
  basePath,
}: PlanAsideProps) {
  const goalLabel =
    goal in GOAL_LABELS ? GOAL_LABELS[goal as keyof typeof GOAL_LABELS] : goal;

  return (
    <>
      <div>
        <Eyebrow>Your week</Eyebrow>
        <p className="mt-s2 text-body-lg tabular text-foreground">
          {weekLabel}
          <span className="text-faint"> · </span>
          Week {String(weekNumber).padStart(2, "0")}
        </p>
      </div>

      <dl className="space-y-s4 text-body">
        <div>
          <dt className="text-meta text-muted">Goal</dt>
          <dd className="mt-s1 text-foreground">{goalLabel}</dd>
        </div>
        <div>
          <dt className="text-meta text-muted">Estimated shopping</dt>
          <dd className="mt-s1 text-foreground">€{estimatedCostEur}</dd>
        </div>
        <div>
          <dt className="text-meta text-muted">Cooking</dt>
          <dd className="mt-s1 text-foreground">~{cookingHours} hours</dd>
        </div>
        <div>
          <dt className="text-meta text-muted">Meals</dt>
          <dd className="mt-s1 text-foreground">{mealCount}</dd>
        </div>
      </dl>

      {weeklyAvailable ? (
        <ActionLink href={`${basePath}/weekly`} variant="quiet" size="compact">
          Open shopping list
        </ActionLink>
      ) : null}

      {overBudget && budgetEur != null ? (
        <Status role="neutral">
          Your current plan exceeds your €{budgetEur} weekly budget.{" "}
          <ActionLink href={`${basePath}/weekly`} variant="quiet" size="compact">
            Review shopping list
          </ActionLink>
        </Status>
      ) : null}
    </>
  );
}
