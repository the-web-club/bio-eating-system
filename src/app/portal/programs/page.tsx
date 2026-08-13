import { PortalErrorState } from "@/components/portal/error-state";
import { MasterPortalGrid } from "@/components/portal/master-portal-grid";
import { ProgramsHub } from "@/components/portal/programs-hub";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import { PageSections, Section } from "@/components/portal/layout";
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
    <PageSections>
      <MasterPortalGrid
        productAccess={data.productAccess}
        hasPlan={Boolean(data.plan)}
        basePath="/portal"
      />

      {data.entitlements.corePlan ? (
        <Section
          ruled
          title="Inside Biological OS"
          description="Tools and add-ons tied to your current biological plan."
        >
          <ProgramsHub
            entitlements={data.entitlements}
            hasPlan={Boolean(data.plan)}
            rotationPosition={position}
            authoredWeeks={data.authoredWeeks}
            basePath="/portal"
          />
        </Section>
      ) : null}
    </PageSections>
  );
}

export default function ProgramsPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.programs}>
      <ProgramsPageContent />
    </PortalPageWithSuspense>
  );
}
