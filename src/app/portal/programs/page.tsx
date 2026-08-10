import { PortalErrorState } from "@/components/portal/error-state";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import { ProgramsViewContent } from "@/components/portal/views/programs-view";
import { ActionLink } from "@/components/ui/action-link";
import { rotationPosition } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";

async function ProgramsPageContent() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <PortalErrorState
        title="Your programs did not load"
        action={
          <ActionLink href="/portal/programs" variant="secondary" size="compact">
            Try again
          </ActionLink>
        }
      >
        Check your connection, then try again.
      </PortalErrorState>
    );
  }

  const position = rotationPosition(data.week, data.authoredWeeks);

  return (
    <ProgramsViewContent
      basePath="/portal"
      entitlements={data.entitlements}
      hasPlan={Boolean(data.plan)}
      rotationPosition={position}
      authoredWeeks={data.authoredWeeks}
    />
  );
}

export default function ProgramsPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.programs}>
      <ProgramsPageContent />
    </PortalPageWithSuspense>
  );
}
