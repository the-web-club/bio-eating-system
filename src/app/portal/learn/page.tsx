import { AppShell } from "@/components/portal/app-shell";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { InlineNote } from "@/components/portal/inline-note";
import { PageSections, PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { ActionLink } from "@/components/ui/action-link";
import { rotationPosition, weekLabel } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";

export default async function LearnPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <AppShell title="Learn">
        <PageShell>
          <PageHeader title="Learn" />
          <div className="mt-group">
            <PortalErrorState
              title="Lessons did not load"
              action={
                <ActionLink href="/portal/learn" variant="secondary" size="compact">
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

  return (
    <AppShell
      title="Learn"
      weekLabel={week}
      programLabel="Core plan"
      rotationPosition={position}
      authoredWeeks={data.authoredWeeks}
    >
      <PageShell width="reading">
        <PageSections>
          <PageHeader
            title="Learn"
            description="Short lessons on eating practices, to read alongside your plan."
            meta={<p className="text-meta text-muted">In development</p>}
          />
          <div className="space-y-group">
            <PortalEmptyState title="No lessons published yet">
              When the first lessons are reviewed you will find the lesson list here,
              with a reading view and previous and next controls.
            </PortalEmptyState>
            <InlineNote>
              Lesson text comes from the reviewed content catalogue. The product does
              not write it.
            </InlineNote>
          </div>
        </PageSections>
      </PageShell>
    </AppShell>
  );
}
