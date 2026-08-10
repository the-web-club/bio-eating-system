import { PlanView } from "@/components/portal/views/plan-view";
import {
  FIXTURE_PLAN_GROUPS,
  FIXTURE_TODAY,
  FIXTURE_TODAY_REST,
} from "../fixtures";
import { PREVIEW_PROGRAM, PREVIEW_WEEK, PreviewShell } from "../preview-shell";

export default function PreviewPlanPage() {
  const portionCount = FIXTURE_TODAY.length + FIXTURE_TODAY_REST.length;

  return (
    <PreviewShell title="Daily plan">
      <PlanView
        energyKcal={1850}
        groups={FIXTURE_PLAN_GROUPS}
        weekLabel={PREVIEW_WEEK}
        programName={PREVIEW_PROGRAM}
        portionCount={portionCount}
        notices={[]}
        maintenanceOnly={false}
      />
    </PreviewShell>
  );
}
