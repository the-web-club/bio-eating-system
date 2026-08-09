import { PlanView } from "@/components/portal/views/plan-view";
import { FIXTURE_PLAN_GROUPS } from "../fixtures";
import { PREVIEW_PROGRAM, PREVIEW_WEEK, PreviewShell } from "../preview-shell";

export default function PreviewPlanPage() {
  return (
    <PreviewShell title="Daily plan">
      <PlanView
        energyKcal={1850}
        groups={FIXTURE_PLAN_GROUPS}
        weekLabel={PREVIEW_WEEK}
        programName={PREVIEW_PROGRAM}
        notices={[]}
        maintenanceOnly={false}
      />
    </PreviewShell>
  );
}
