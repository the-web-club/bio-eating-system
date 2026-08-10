import { redirect } from "next/navigation";
import { AppShell } from "@/components/portal/app-shell";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { PlanView } from "@/components/portal/views/plan-view";
import { ActionLink } from "@/components/ui/action-link";
import { SCREENING_REASON_COPY } from "@/lib/content/labels";
import { resolveContent } from "@/lib/content/resolve";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";
import { formatPlanSlot, rotationPosition, weekLabel } from "@/lib/portal/format";
import {
  personalSubstitutionDetail,
  personalSubstitutionNote,
} from "@/lib/portal/portion-copy";
import { loadPortalData } from "@/lib/portal/load-portal-data";

const GROUPS: { title: string; slots: FoodSlot[] }[] = [
  {
    title: "Protein",
    slots: ["eggs", "organ_meat", "small_fish", "bivalves", "muscle_meat"],
  },
  {
    title: "Plants and fibre",
    slots: [
      "tubers",
      "cruciferous",
      "berries",
      "kiwi",
      "mushrooms",
      "aromatics",
      "fermented",
    ],
  },
  { title: "Fats", slots: ["olive_oil"] },
];

export default async function DailyPlanPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <AppShell title="Daily plan">
        <PageShell width="reading">
          <PageHeader title="Daily plan" />
          <div className="mt-group">
            <PortalErrorState
              title="Your daily plan did not load"
              action={
                <ActionLink href="/portal/plan" variant="secondary" size="compact">
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
      <AppShell title="Daily plan">
        <PageShell width="reading">
          <PageHeader title="Daily plan" />
          <div className="mt-group">
            <PortalEmptyState
              title="Not on your account yet"
              action={
                <ActionLink href="/portal/programs" variant="secondary" size="compact">
                  View upgrade
                </ActionLink>
              }
            >
              The core plan sets your daily portions. Add it to see them here.
            </PortalEmptyState>
          </div>
        </PageShell>
      </AppShell>
    );
  }

  if (!data.plan) {
    redirect("/portal/intake");
  }

  const plan = data.plan;
  const week = weekLabel(data.week);
  const position = rotationPosition(data.week, data.authoredWeeks);
  const bySlot = new Map(plan.slots.map((slot) => [slot.slot, slot]));
  const groups = GROUPS.map((group) => ({
    title: group.title,
    items: group.slots
      .map((slot) => bySlot.get(slot))
      .filter((slot): slot is NonNullable<typeof slot> => Boolean(slot))
      .map((slot) => {
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
      }),
  })).filter((group) => group.items.length > 0);

  return (
    <AppShell
      title="Daily plan"
      weekLabel={week}
      programLabel="Core plan"
      rotationPosition={position}
      authoredWeeks={data.authoredWeeks}
    >
      <PlanView
        energyKcal={plan.energyKcal}
        groups={groups}
        weekLabel={week}
        programName="Core plan"
        portionCount={plan.slots.length}
        notices={plan.screeningReasons
          .map((code) => SCREENING_REASON_COPY[code])
          .filter(Boolean)}
        maintenanceOnly={plan.screeningOutcome === "maintenance_only"}
      />
    </AppShell>
  );
}
