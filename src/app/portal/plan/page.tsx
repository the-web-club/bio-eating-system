import { redirect } from "next/navigation";
import { MealListWithReplace } from "@/components/portal/meal-list-with-replace";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import {
  WeeklyBriefing,
  estimateCookingHours,
  estimateWeeklyCostEur,
} from "@/components/portal/views/shop-view";
import { ActionLink } from "@/components/ui/action-link";
import { SCREENING_REASON_COPY, GOAL_LABELS } from "@/lib/content/labels";
import { assembleMeals } from "@/lib/portal/meal-assembly";
import { rotationPosition, weekLabel } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { Status } from "@/components/ui/status";

export default async function PlanPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    redirect("/portal");
  }

  if (!data.entitlements.corePlan) {
    return (
      <PageShell width="reading">
        <PortalEmptyState title="Personal nutrition plan not on your account">
          Add the plan on the website to see your weekly meals here.
        </PortalEmptyState>
      </PageShell>
    );
  }

  if (!data.plan || !data.profile) {
    redirect("/portal/intake");
  }

  const plan = data.plan;
  const week = weekLabel(data.week);
  const position = rotationPosition(data.week, data.authoredWeeks);
  const meals = assembleMeals(plan.slots);
  const estimatedCost = estimateWeeklyCostEur(plan.slots);
  const budget = data.profile.weeklyBudgetEur;
  const overBudget = budget != null && estimatedCost > budget;
  const cookingHours = estimateCookingHours(data.profile.practical);
  const goalLabel =
    data.profile.goal in GOAL_LABELS
      ? GOAL_LABELS[data.profile.goal as keyof typeof GOAL_LABELS]
      : data.profile.goal;

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Plan"
          description="My week."
          meta={
            <p className="text-meta text-muted">
              <span className="font-meta tabular">{week}</span>
            </p>
          }
          actions={
            data.entitlements.weeklyRotation ? (
              <ActionLink href="/portal/weekly" variant="secondary">
                Shopping list
              </ActionLink>
            ) : null
          }
        />

        <WeeklyBriefing
          weekNumber={position}
          goal={data.profile.goal}
          estimatedCostEur={estimatedCost}
          cookingHours={cookingHours}
          mealCount={21}
          budgetEur={budget}
          overBudget={overBudget}
          basePath="/portal"
        />

        <Section title="This week">
          <p className="mb-3 text-body text-muted">
            Goal: {goalLabel} · Focus: simple high-protein meals
          </p>
          <MealListWithReplace meals={meals} />
        </Section>

        {plan.screeningOutcome === "maintenance_only" ||
        plan.screeningReasons.length ? (
          <Status role="neutral">
            {plan.screeningOutcome === "maintenance_only" ? (
              <p>Your plan stays at maintenance energy.</p>
            ) : null}
            {plan.screeningReasons
              .map((code) => SCREENING_REASON_COPY[code])
              .filter(Boolean)
              .map((line) => (
                <p key={line}>{line}</p>
              ))}
          </Status>
        ) : null}
      </PageSections>
    </PageShell>
  );
}
