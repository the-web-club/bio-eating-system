import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import { TodayViewContent } from "@/components/portal/views/today-view-content";
import { ActionLink } from "@/components/ui/action-link";
import { SCREENING_REASON_COPY } from "@/lib/content/labels";
import { assembleMeals, todaySummary } from "@/lib/portal/meal-assembly";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";

async function TodayGreeting() {
  try {
    const data = await loadPortalData();
    const firstName = data.user.name?.split(" ")[0] || "there";
    return <p className="text-body-lg text-foreground">Good morning, {firstName}</p>;
  } catch {
    return <p className="text-body-lg text-foreground">Good morning</p>;
  }
}

async function TodayPageContent() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
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
    );
  }

  if (!data.entitlements.corePlan) {
    return (
      <PortalEmptyState tone="locked" title="Personal nutrition plan not on your account">
        Add the plan on the website. Your setup and daily meals appear here once
        the purchase is confirmed.
      </PortalEmptyState>
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
    <TodayViewContent
      basePath="/portal"
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
  );
}

export default function TodayPage() {
  return (
    <PortalPageWithSuspense
      copy={PORTAL_PAGE_COPY.today}
      meta={
        <Suspense
          fallback={<p className="text-body-lg text-foreground">Good morning</p>}
        >
          <TodayGreeting />
        </Suspense>
      }
      actions={
        <ActionLink href="/portal/plan" variant="quiet" size="compact">
          View full plan
        </ActionLink>
      }
    >
      <TodayPageContent />
    </PortalPageWithSuspense>
  );
}
