import { TodayView } from "@/components/portal/views/today-view";
import {
  FIXTURE_ENTITLEMENTS,
  FIXTURE_MEALS,
  FIXTURE_TODAY_SUMMARY,
} from "./fixtures";
import { PREVIEW_BASE } from "./preview-shell";

export default function PreviewTodayPage() {
  return (
    <TodayView
      basePath={PREVIEW_BASE}
      firstName="Maya"
      meals={FIXTURE_MEALS}
      summary={FIXTURE_TODAY_SUMMARY}
      notices={[]}
      maintenanceOnly={false}
      weeklyAvailable={FIXTURE_ENTITLEMENTS.weeklyRotation}
    />
  );
}
