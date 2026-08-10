import { PortalErrorState } from "@/components/portal/error-state";
import { PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { ProgramsView } from "@/components/portal/views/programs-view";
import { ActionLink } from "@/components/ui/action-link";
import { rotationPosition } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";

export default async function ProgramsPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <PageShell width="reading">
        <PageHeader title="Programs" />
        <div className="mt-group">
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
        </div>
      </PageShell>
    );
  }

  const position = rotationPosition(data.week, data.authoredWeeks);

  return (
    <ProgramsView
      basePath="/portal"
      entitlements={data.entitlements}
      hasPlan={Boolean(data.plan)}
      rotationPosition={position}
      authoredWeeks={data.authoredWeeks}
    />
  );
}
