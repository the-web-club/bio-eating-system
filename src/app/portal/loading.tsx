import { AppShell } from "@/components/portal/app-shell";
import { PortalSkeleton } from "@/components/portal/skeleton";

export default function PortalLoading() {
  return (
    <AppShell title="Loading">
      <PortalSkeleton />
    </AppShell>
  );
}
