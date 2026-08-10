import { redirect } from "next/navigation";
import { ContentMeasure, PageBody, Split } from "@/components/portal/layout";
import { MealListWithReplace } from "@/components/portal/meal-list-with-replace";
import { PlanAside } from "@/components/portal/plan-aside";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import {
  estimateCookingHours,
  estimateWeeklyCostEur,
} from "@/components/portal/views/shop-view";
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

  return (
    <PageBody>
      <Split
        main={
          <ContentMeasure>
            <MealListWithReplace meals={meals} />
          </ContentMeasure>
        }
        aside={
          <PlanAside
            weekLabel={week}
            weekNumber={position}
            goal={data.profile.goal}
            estimatedCostEur={estimatedCost}
            cookingHours={cookingHours}
            mealCount={21}
            budgetEur={budget}
            overBudget={overBudget}
            weeklyAvailable={data.entitlements.weeklyRotation}
            basePath="/portal"
          />
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
    </PageBody>
  );
}

export default function PlanPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.plan}>
      <PlanPageContent />
    </PortalPageWithSuspense>
  );
}
