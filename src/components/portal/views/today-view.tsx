import { PageSections, PageShell } from "../layout";
import { PageHeader } from "../page-header";
import { ActionLink } from "@/components/ui/action-link";
import {
  TodayViewContent,
  type TodayViewProps,
} from "./today-view-content";

export type { TodayViewProps } from "./today-view-content";

/** Full Today page for previews and other callers that render their own shell. */
export function TodayView({
  firstName,
  ...props
}: TodayViewProps) {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Today"
          meta={
            <p className="text-body-lg text-foreground">Good morning, {firstName}</p>
          }
          actions={
            <ActionLink href={`${props.basePath}/plan`} variant="quiet" size="compact">
              View full plan
            </ActionLink>
          }
        />
        <TodayViewContent {...props} />
      </PageSections>
    </PageShell>
  );
}
