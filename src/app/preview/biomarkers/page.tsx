import { BiomarkersView } from "@/components/portal/views/biomarkers-view";
import { FIXTURE_MARKERS } from "../fixtures";
import { PreviewShell } from "../preview-shell";

export default function PreviewBiomarkersPage() {
  return (
    <PreviewShell title="Biomarkers">
      <BiomarkersView markers={FIXTURE_MARKERS} />
    </PreviewShell>
  );
}
