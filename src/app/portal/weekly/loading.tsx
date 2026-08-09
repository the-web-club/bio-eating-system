import { AppShell } from "@/components/portal/app-shell";
import { ListSkeleton } from "@/components/portal/skeleton";

export default function WeeklyLoading() {
  return (
    <AppShell title="Weekly plan">
      <ListSkeleton label="Loading your weekly plan" />
    </AppShell>
  );
}
