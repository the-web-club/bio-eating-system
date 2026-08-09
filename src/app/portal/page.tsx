import { redirect } from "next/navigation";
import { AppShell } from "@/components/portal/app-shell";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { TodayView } from "@/components/portal/views/today-view";
import { ActionLink } from "@/components/ui/action-link";
import { SCREENING_REASON_COPY } from "@/lib/content/labels";
import { resolveContent } from "@/lib/content/resolve";
import {
  formatPlanSlot,
  formatVarietyKey,
  rotationPosition,
  weekLabel,
} from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";

const PROGRAM_NAME = "Core plan";

export default async function TodayPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <AppShell title="Today">
        <PageShell width="reading">
          <PageHeader title="Today" />
          <div className="mt-group">
            <PortalErrorState
              title="Your program did not load"
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
      </AppShell>
    );
  }

  if (!data.entitlements.corePlan) {
    return (
      <AppShell title="Today">
        <PageShell width="reading">
          <PageHeader
            title="Welcome"
            description="Your account is signed in. The core plan is not on it yet."
          />
          <div className="mt-group">
            <PortalEmptyState title="Core plan not on your account">
              Add the core plan on the website. Your intake and daily portions appear
              here once the purchase is confirmed.
            </PortalEmptyState>
          </div>
        </PageShell>
      </AppShell>
    );
  }

  if (!data.hasProfile || !data.plan) {
    redirect("/portal/intake");
  }

  const plan = data.plan;
  const week = weekLabel(data.week);

  return (
    <AppShell title="Today" weekLabel={week} programLabel={PROGRAM_NAME}>
      <TodayView
        basePath="/portal"
        firstName={data.user.name?.split(" ")[0] || "there"}
        weekLabel={week}
        programName={PROGRAM_NAME}
        portionCount={plan.slots.length}
        focus={plan.slots.slice(0, 4).map((slot) => {
          const { name, amount, unit } = formatPlanSlot(slot);
          return {
            id: slot.slot,
            name,
            amount,
            unit,
            note:
              slot.absorbedFrom.length > 0
                ? "Personal substitution applied"
                : undefined,
          };
        })}
        energyKcal={plan.energyKcal}
        rotationPosition={rotationPosition(data.week, data.authoredWeeks)}
        authoredWeeks={data.authoredWeeks}
        notices={plan.screeningReasons
          .map((code) => SCREENING_REASON_COPY[code])
          .filter(Boolean)}
        maintenanceOnly={plan.screeningOutcome === "maintenance_only"}
        varieties={data.rotationItems
          .slice(0, 4)
          .map(
            (item) =>
              resolveContent(item.labelKey) ?? formatVarietyKey(item.labelKey),
          )}
        weeklyAvailable={data.entitlements.weeklyRotation}
      />
    </AppShell>
  );
}
