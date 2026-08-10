import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { InlineNote } from "@/components/portal/inline-note";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import { ActionLink } from "@/components/ui/action-link";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";

async function LearnPageContent() {
  try {
    await loadPortalData();
  } catch {
    return (
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
    );
  }

  return (
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
  );
}

export default function LearnPage() {
  return (
    <PortalPageWithSuspense
      copy={PORTAL_PAGE_COPY.learn}
      meta={<p className="text-meta text-muted">In development</p>}
    >
      <LearnPageContent />
    </PortalPageWithSuspense>
  );
}
