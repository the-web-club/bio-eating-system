import { WeeklyView } from "@/components/portal/views/weekly-view";
import { rotationPosition } from "@/lib/portal/format";
import { FIXTURE_AUTHORED_WEEKS, FIXTURE_WEEK, FIXTURE_WEEKLY } from "../fixtures";
import { PREVIEW_BASE, PreviewShell } from "../preview-shell";

export default function PreviewWeeklyPage() {
  return (
    <PreviewShell title="Weekly plan">
      <WeeklyView
        basePath={PREVIEW_BASE}
        position={rotationPosition(FIXTURE_WEEK, FIXTURE_AUTHORED_WEEKS)}
        authoredWeeks={FIXTURE_AUTHORED_WEEKS}
        items={FIXTURE_WEEKLY}
      />
    </PreviewShell>
  );
}
