import type { ReactNode } from "react";
import { PortalLayoutFrame } from "@/components/portal/portal-layout-frame";
import { loadPortalShellIdentity } from "@/lib/portal/shell-identity";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const identity = await loadPortalShellIdentity();

  return <PortalLayoutFrame identity={identity}>{children}</PortalLayoutFrame>;
}
