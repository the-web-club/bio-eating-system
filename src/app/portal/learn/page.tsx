import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
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
    <PortalEmptyState tone="default" title="No lessons published yet">
      Lessons are not available on your account yet. Check back when your program
      includes them.
    </PortalEmptyState>
  );
}

export default function LearnPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.learn}>
      <LearnPageContent />
    </PortalPageWithSuspense>
  );
}
