import { TodayView } from "@/components/portal/views/today-view";
import { rotationPosition } from "@/lib/portal/format";
import {
  FIXTURE_AUTHORED_WEEKS,
  FIXTURE_ENTITLEMENTS,
  FIXTURE_TODAY,
  FIXTURE_VARIETIES,
  FIXTURE_WEEK,
} from "./fixtures";
import { PREVIEW_BASE, PREVIEW_PROGRAM, PREVIEW_WEEK, PreviewShell } from "./preview-shell";

export default function PreviewTodayPage() {
  return (
    <PreviewShell title="Today">
      <TodayView
        basePath={PREVIEW_BASE}
        firstName="Maya"
        weekLabel={PREVIEW_WEEK}
        programName={PREVIEW_PROGRAM}
        portionCount={9}
        focus={FIXTURE_TODAY}
        energyKcal={1850}
        rotationPosition={rotationPosition(FIXTURE_WEEK, FIXTURE_AUTHORED_WEEKS)}
        authoredWeeks={FIXTURE_AUTHORED_WEEKS}
        notices={[]}
        maintenanceOnly={false}
        varieties={FIXTURE_VARIETIES}
        weeklyAvailable={FIXTURE_ENTITLEMENTS.weeklyRotation}
      />
    </PreviewShell>
  );
}
