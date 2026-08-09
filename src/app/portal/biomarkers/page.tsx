import { AppShell } from "@/components/portal/app-shell";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { InlineNote } from "@/components/portal/inline-note";
import { PageSections, PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import {
  BIOMARKER_DISCLAIMER,
  BiomarkersView,
} from "@/components/portal/views/biomarkers-view";
import { ActionLink } from "@/components/ui/action-link";
import { resolveContent } from "@/lib/content/resolve";
import { weekLabel } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { BiomarkerUpgradeClient } from "./biomarker-upgrade-client";

/** Keys only — bodies come from content/ when authored. No invented ranges. */
const MARKER_KEYS = [
  { id: "ferritin", nameKey: "biomarker.ferritin.name" },
  { id: "vitamin_d", nameKey: "biomarker.vitamin_d.name" },
  { id: "b12", nameKey: "biomarker.b12.name" },
] as const;

export default async function BiomarkersPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <AppShell title="Biomarkers">
        <PageShell width="reading">
          <PageHeader title="Biomarkers" />
          <div className="mt-group">
            <PortalErrorState
              title="The biomarker reference did not load"
              action={
                <ActionLink
                  href="/portal/biomarkers"
                  variant="secondary"
                  size="compact"
                >
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

  if (!data.entitlements.labReference) {
    return (
      <AppShell title="Biomarkers" weekLabel={week} programLabel="Core plan">
        <PageShell width="reading">
          <PageSections>
            <PageHeader
              title="Biomarkers"
              description="A plain-language reference for common markers, written and reviewed by a dietitian."
            />
            <div className="space-y-group">
              <PortalEmptyState
                title="Not on your account yet"
                action={<BiomarkerUpgradeClient />}
              >
                Biomarker support explains what each marker describes and gives
                reference context, without scoring your results.
              </PortalEmptyState>
              <InlineNote>{BIOMARKER_DISCLAIMER}</InlineNote>
            </div>
          </PageSections>
        </PageShell>
      </AppShell>
    );
  }

  const markers = MARKER_KEYS.map((marker) => ({
    id: marker.id,
    name: resolveContent(marker.nameKey),
    reference: resolveContent(`biomarker.${marker.id}.reference`),
    why: resolveContent(`biomarker.${marker.id}.why`),
    rationale: resolveContent(`biomarker.${marker.id}.rationale`),
  })).filter(
    (marker): marker is typeof marker & { name: string } => Boolean(marker.name),
  );

  return (
    <AppShell title="Biomarkers" weekLabel={week} programLabel="Core plan">
      <BiomarkersView markers={markers} />
    </AppShell>
  );
}
