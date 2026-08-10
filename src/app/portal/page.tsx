import { redirect } from "next/navigation";
import { LifeHappenedButton } from "@/components/portal/life-happened-button";
import { MealListWithReplace } from "@/components/portal/meal-list-with-replace";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { TodayView } from "@/components/portal/views/today-view";
import { ActionLink } from "@/components/ui/action-link";
import { SCREENING_REASON_COPY } from "@/lib/content/labels";
import { assembleMeals, todaySummary } from "@/lib/portal/meal-assembly";
import { loadPortalData } from "@/lib/portal/load-portal-data";

export default async function TodayPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <PageShell width="reading">
        <PageHeader title="Today" />
        <div className="mt-group">
          <PortalErrorState
            title="Your plan did not load"
            action={
              <ActionLink href="/portal" variant="secondary" size="compact">
                Try again
              </ActionLink>
            }
          >
            Check your connection, then try again.
          </PortalErrorState>
        </div>
      </PageShell>
    );
  }

  if (!data.entitlements.corePlan) {
    return (
      <PageShell width="reading">
        <PageHeader
          title="Welcome"
          description="Your account is signed in. The personal nutrition plan is not on it yet."
        />
        <div className="mt-group">
          <PortalEmptyState title="Personal nutrition plan not on your account">
            Add the plan on the website. Your setup and daily meals appear here once
            the purchase is confirmed.
          </PortalEmptyState>
        </div>
      </PageShell>
    );
  }

  if (!data.hasProfile || !data.plan) {
    redirect("/portal/intake");
  }

  const plan = data.plan;
  const meals = assembleMeals(plan.slots);
  const summary = todaySummary(meals, {
    groceryTasks: data.entitlements.weeklyRotation ? 1 : 0,
    decisions: Math.max(0, 0),
  });

  return (
    <>
      <TodayView
        basePath="/portal"
        firstName={data.user.name?.split(" ")[0] || "there"}
        meals={meals}
        summary={summary}
        notices={plan.screeningReasons
          .map((code) => SCREENING_REASON_COPY[code])
          .filter(Boolean)}
        maintenanceOnly={plan.screeningOutcome === "maintenance_only"}
        weeklyAvailable={data.entitlements.weeklyRotation}
        showRecalibration={data.recalibrationDue}
        showCheckIn={data.pendingCheckIn}
      />
      <div className="mx-auto max-w-content px-page pb-group">
        <LifeHappenedButton basePath="/portal" />
      </div>
    </>
  );
}
