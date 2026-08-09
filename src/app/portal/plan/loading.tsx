import { AppShell } from "@/components/portal/app-shell";
import { PlanSkeleton } from "@/components/portal/skeleton";

export default function PlanLoading() {
  return (
    <AppShell title="Daily plan">
      <PlanSkeleton />
    </AppShell>
  );
}
