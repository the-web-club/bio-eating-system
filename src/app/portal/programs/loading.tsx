import { AppShell } from "@/components/portal/app-shell";
import { ProgramsSkeleton } from "@/components/portal/skeleton";

export default function ProgramsLoading() {
  return (
    <AppShell title="Programs">
      <ProgramsSkeleton />
    </AppShell>
  );
}
