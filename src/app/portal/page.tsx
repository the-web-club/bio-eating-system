import { redirect } from "next/navigation";
import { AppShell } from "@/components/portal/app-shell";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { TodayView } from "@/components/portal/views/today-view";
import { ActionLink } from "@/components/ui/action-link";
import { SCREENING_REASON_COPY, SLOT_LABELS } from "@/lib/content/labels";
import { resolveContent } from "@/lib/content/resolve";
import type { PlanSlot } from "@/lib/nutrition/plan-engine";
import {
  formatPlanSlot,
  formatVarietyKey,
  rotationPosition,
  weekLabel,
} from "@/lib/portal/format";
import {
  personalSubstitutionDetail,
  personalSubstitutionNote,
} from "@/lib/portal/portion-copy";
import { loadPortalData } from "@/lib/portal/load-portal-data";

const PROGRAM_NAME = "Core plan";

/** How many portions lead the composition before the remainder is listed. */
const FOCUS_COUNT = 4;

function toFocusItem(slot: PlanSlot) {
  const { name, amount, unit } = formatPlanSlot(slot);
  return {
    id: slot.slot,
    name,
    amount,
    unit,
    note: personalSubstitutionNote(slot.absorbedFrom),
    why: resolveContent(slot.guidanceKey),
    adjustment: personalSubstitutionDetail(slot.absorbedFrom) ?? null,
  };
}

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
  const position = rotationPosition(data.week, data.authoredWeeks);

  return (
    <AppShell
      title="Today"
      weekLabel={week}
      programLabel={PROGRAM_NAME}
      rotationPosition={position}
      authoredWeeks={data.authoredWeeks}
    >
      <TodayView
        basePath="/portal"
        firstName={data.user.name?.split(" ")[0] || "there"}
        weekLabel={week}
        programName={PROGRAM_NAME}
        portionCount={plan.slots.length}
        focus={plan.slots.slice(0, FOCUS_COUNT).map(toFocusItem)}
        rest={plan.slots.slice(FOCUS_COUNT).map(toFocusItem)}
        energyKcal={plan.energyKcal}
        rotationPosition={position}
        authoredWeeks={data.authoredWeeks}
        notices={plan.screeningReasons
          .map((code) => SCREENING_REASON_COPY[code])
          .filter(Boolean)}
        maintenanceOnly={plan.screeningOutcome === "maintenance_only"}
        varieties={data.rotationItems.slice(0, 4).map((item) => ({
          id: item.slot,
          name: resolveContent(item.labelKey) ?? formatVarietyKey(item.labelKey),
          group: SLOT_LABELS[item.slot] ?? item.slot,
        }))}
        weeklyAvailable={data.entitlements.weeklyRotation}
      />
    </AppShell>
  );
}
