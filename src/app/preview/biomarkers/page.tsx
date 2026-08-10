import { BiomarkersView } from "@/components/portal/views/biomarkers-view";
import { FIXTURE_MARKERS } from "../fixtures";

export default function PreviewBiomarkersPage() {
  return <BiomarkersView markers={FIXTURE_MARKERS} />;
}
