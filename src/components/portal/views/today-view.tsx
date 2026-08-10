import { PageSections, PageShell } from "../layout";
import { PageHeader } from "../page-header";
import { ActionLink } from "@/components/ui/action-link";
import {
  TodayViewContent,
  type TodayViewProps,
} from "./today-view-content";

export type { TodayViewProps } from "./today-view-content";

/** Full Today page for previews and other callers that render their own shell. */
export function TodayView(props: TodayViewProps) {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title={`Good morning, ${props.firstName}`}
          description="Today's plan"
          actions={
            <ActionLink href={`${props.basePath}/plan`} variant="secondary">
              View full plan
            </ActionLink>
          }
        />
        <TodayViewContent {...props} />
      </PageSections>
    </PageShell>
  );
}
