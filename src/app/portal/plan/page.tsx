import { redirect } from "next/navigation";
import { MealListWithReplace } from "@/components/portal/meal-list-with-replace";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import { MealListMeta } from "@/components/portal/meal-list-section";
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
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";
import { Status } from "@/components/ui/status";

async function PlanPageContent() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    redirect("/portal");
  }

  if (!data.entitlements.corePlan) {
    return (
      <PortalEmptyState tone="locked" title="Personal nutrition plan not on your account">
        Add the plan on the website to see your weekly meals here.
      </PortalEmptyState>
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
    <>
      <p className="text-meta text-muted">
        <span className="font-meta tabular">{week}</span>
      </p>
      {data.entitlements.weeklyRotation ? (
        <div className="flex flex-wrap gap-3">
          <ActionLink href="/portal/weekly" variant="secondary">
            Shopping list
          </ActionLink>
        </div>
      ) : null}

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

      <MealListWithReplace
        title="This week"
        meals={meals}
        meta={
          <MealListMeta goal={goalLabel} focus="simple high-protein meals" />
        }
      />

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
    </>
  );
}

export default function PlanPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.plan}>
      <PlanPageContent />
    </PortalPageWithSuspense>
  );
}
