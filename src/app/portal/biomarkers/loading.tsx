import { AppShell } from "@/components/portal/app-shell";
import { ListSkeleton } from "@/components/portal/skeleton";

export default function BiomarkersLoading() {
  return (
    <AppShell title="Biomarkers">
      <ListSkeleton label="Loading the biomarker reference" />
    </AppShell>
  );
}
