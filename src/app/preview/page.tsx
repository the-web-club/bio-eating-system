import { TodayView } from "@/components/portal/views/today-view";
import { rotationPosition } from "@/lib/portal/format";
import {
  FIXTURE_AUTHORED_WEEKS,
  FIXTURE_ENTITLEMENTS,
  FIXTURE_TODAY,
  FIXTURE_TODAY_REST,
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
        portionCount={FIXTURE_TODAY.length + FIXTURE_TODAY_REST.length}
        focus={FIXTURE_TODAY}
        rest={FIXTURE_TODAY_REST}
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
