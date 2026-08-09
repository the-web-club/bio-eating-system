import { ProgramsView } from "@/components/portal/views/programs-view";
import { rotationPosition } from "@/lib/portal/format";
import {
  FIXTURE_AUTHORED_WEEKS,
  FIXTURE_ENTITLEMENTS,
  FIXTURE_WEEK,
} from "../fixtures";
import { PREVIEW_BASE, PreviewShell } from "../preview-shell";

export default function PreviewProgramsPage() {
  return (
    <PreviewShell title="Programs">
      <ProgramsView
        basePath={PREVIEW_BASE}
        entitlements={FIXTURE_ENTITLEMENTS}
        hasPlan
        rotationPosition={rotationPosition(FIXTURE_WEEK, FIXTURE_AUTHORED_WEEKS)}
        authoredWeeks={FIXTURE_AUTHORED_WEEKS}
      />
    </PreviewShell>
  );
}
