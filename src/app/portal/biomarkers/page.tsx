import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { InlineNote } from "@/components/portal/inline-note";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import {
  BIOMARKER_DISCLAIMER,
  BiomarkersViewContent,
} from "@/components/portal/views/biomarkers-view";
import { ActionLink } from "@/components/ui/action-link";
import { resolveContent } from "@/lib/content/resolve";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";
import { BiomarkerUpgradeClient } from "./biomarker-upgrade-client";

/** Keys only - bodies come from content/ when authored. No invented ranges. */
const MARKER_KEYS = [
  { id: "ferritin", nameKey: "biomarker.ferritin.name" },
  { id: "vitamin_d", nameKey: "biomarker.vitamin_d.name" },
  { id: "b12", nameKey: "biomarker.b12.name" },
] as const;

async function BiomarkersPageContent() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <PortalErrorState
        title="The biomarker reference did not load"
        action={
          <ActionLink href="/portal/biomarkers" variant="secondary" size="compact">
            Try again
          </ActionLink>
        }
      >
        Check your connection, then try again.
      </PortalErrorState>
    );
  }

  if (!data.entitlements.labReference) {
    return (
      <div className="space-y-group">
        <PortalEmptyState
          tone="locked"
          title="Not on your account yet"
          action={<BiomarkerUpgradeClient />}
        >
          Biomarker support explains what each marker describes and gives
          reference context, without scoring your results.
        </PortalEmptyState>
        <InlineNote>{BIOMARKER_DISCLAIMER}</InlineNote>
      </div>
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

  return <BiomarkersViewContent markers={markers} />;
}

export default function BiomarkersPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.biomarkers}>
      <BiomarkersPageContent />
    </PortalPageWithSuspense>
  );
}
