import { AppShell } from "@/components/portal/app-shell";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PageSections, PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { WeeklyView } from "@/components/portal/views/weekly-view";
import { ActionLink } from "@/components/ui/action-link";
import { SLOT_LABELS } from "@/lib/content/labels";
import { formatVarietyKey, rotationPosition, weekLabel } from "@/lib/portal/format";
import { resolveContent } from "@/lib/content/resolve";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { WeeklyUpgradeClient } from "./weekly-upgrade-client";

export default async function WeeklyPlanPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <AppShell title="Weekly plan">
        <PageShell width="reading">
          <PageHeader title="Weekly plan" />
          <div className="mt-group">
            <PortalErrorState
              title="Your weekly plan did not load"
              action={
                <ActionLink href="/portal/weekly" variant="secondary" size="compact">
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

  const week = weekLabel(data.week);
  const position = rotationPosition(data.week, data.authoredWeeks);

  if (!data.entitlements.weeklyRotation) {
    return (
      <AppShell
        title="Weekly plan"
        weekLabel={week}
        programLabel="Core plan"
        rotationPosition={position}
        authoredWeeks={data.authoredWeeks}
      >
        <PageShell width="reading">
          <PageSections>
            <PageHeader
              title="Weekly plan"
              description="A grocery list for the current authored week, matched to your daily portions."
            />
            <PortalEmptyState
              title="Not on your account yet"
              action={<WeeklyUpgradeClient />}
            >
              With the weekly plan you get the varieties for the current authored week
              and the quantities to buy, taken from your daily portions.
            </PortalEmptyState>
          </PageSections>
        </PageShell>
      </AppShell>
    );
  }

  if (!data.plan) {
    return (
      <AppShell
        title="Weekly plan"
        weekLabel={week}
        programLabel="Core plan"
        rotationPosition={position}
        authoredWeeks={data.authoredWeeks}
      >
        <PageShell width="reading">
          <PageSections>
            <PageHeader
              title="Weekly plan"
              description="A grocery list for the current authored week, matched to your daily portions."
            />
            <PortalEmptyState
              title="Finish your profile first"
              action={<ActionLink href="/portal/intake">Open intake</ActionLink>}
            >
              Quantities come from your daily portions, so this list fills in once your
              profile is complete.
            </PortalEmptyState>
          </PageSections>
        </PageShell>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Weekly plan"
      weekLabel={week}
      programLabel="Core plan"
      rotationPosition={position}
      authoredWeeks={data.authoredWeeks}
    >
      <WeeklyView
        basePath="/portal"
        position={position}
        authoredWeeks={data.authoredWeeks}
        items={data.rotationItems.map((item) => {
          const hasGrams = item.grams > 0;
          return {
            id: item.slot,
            name:
              resolveContent(item.labelKey) ??
              formatVarietyKey(item.labelKey) ??
              SLOT_LABELS[item.slot],
            note: SLOT_LABELS[item.slot],
            value: hasGrams ? String(item.grams) : item.householdDisplay || "—",
            unit: hasGrams ? "g" : undefined,
          };
        })}
      />
    </AppShell>
  );
}
