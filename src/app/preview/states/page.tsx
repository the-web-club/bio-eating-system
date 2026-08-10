import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { PortalSkeleton } from "@/components/portal/skeleton";
import { ActionLink } from "@/components/ui/action-link";
import { PREVIEW_BASE } from "../preview-shell";

/**
 * Loading, failure and empty states in one place, so they can be reviewed
 * against the resolved pages without waiting for a real failure.
 */
export default function PreviewStatesPage() {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="States"
          description="How the product behaves while loading, when a load fails, and when there is nothing to show yet."
        />

        <Section
          title="Loading"
          description="Placeholder dimensions match the resolved Today composition, so nothing shifts when data arrives."
        >
          <div className="-mx-gutter sm:-mx-8 xl:-mx-10">
            <PortalSkeleton />
          </div>
        </Section>

        <Section
          ruled
          title="Load failure"
          description="Says what happened and what to do next, with the retry beside the message."
        >
          <PortalErrorState
            title="Your program did not load"
            action={
              <ActionLink href={PREVIEW_BASE} variant="secondary" size="compact">
                Try again
              </ActionLink>
            }
          >
            Check your connection, then try again.
          </PortalErrorState>
        </Section>

        <Section
          ruled
          title="Nothing published yet"
          description="An empty state uses a quiet eyebrow, a clear title, and one next action - never a dashed box."
        >
          <PortalEmptyState
            tone="unpublished"
            title="No lessons published yet"
            action={
              <ActionLink
                href={`${PREVIEW_BASE}/programs`}
                variant="secondary"
                size="compact"
              >
                View programs
              </ActionLink>
            }
          >
            When the first lessons are reviewed you will find the lesson list here,
            with a reading view and previous and next controls.
          </PortalEmptyState>
        </Section>
      </PageSections>
    </PageShell>
  );
}
