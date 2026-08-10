import { PageSections, PageShell } from "../layout";
import { PageHeader } from "../page-header";
import { ProgramsHub } from "../programs-hub";
import type { PortalEntitlements } from "@/lib/portal/load-portal-data";

export function ProgramsViewContent({
  entitlements,
  hasPlan,
  rotationPosition,
  authoredWeeks,
  basePath,
}: {
  entitlements: PortalEntitlements;
  hasPlan: boolean;
  rotationPosition: number;
  authoredWeeks: number;
  basePath: string;
}) {
  return (
    <ProgramsHub
      entitlements={entitlements}
      hasPlan={hasPlan}
      rotationPosition={rotationPosition}
      authoredWeeks={authoredWeeks}
      basePath={basePath}
    />
  );
}

export function ProgramsView({
  entitlements,
  hasPlan,
  rotationPosition,
  authoredWeeks,
  basePath,
}: {
  entitlements: PortalEntitlements;
  hasPlan: boolean;
  rotationPosition: number;
  authoredWeeks: number;
  basePath: string;
}) {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Programs"
          description="What you are working through now, and what you could add."
        />
        <ProgramsViewContent
          entitlements={entitlements}
          hasPlan={hasPlan}
          rotationPosition={rotationPosition}
          authoredWeeks={authoredWeeks}
          basePath={basePath}
        />
      </PageSections>
    </PageShell>
  );
}
