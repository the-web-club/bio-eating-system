import { PageSections, PageShell } from "../layout";
import { PageHeader } from "../page-header";
import { ButtonLink } from "@/components/ui/button-link";
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
          title="Today"
          actions={
            <ButtonLink href={`${props.basePath}/plan`}>View full plan</ButtonLink>
          }
        />
        <TodayViewContent {...props} />
      </PageSections>
    </PageShell>
  );
}
