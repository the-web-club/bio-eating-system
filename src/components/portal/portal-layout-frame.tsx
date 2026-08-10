"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { PortalShellIdentity } from "@/lib/portal/shell-identity";
import { AppShell } from "./app-shell";

const BARE_ROUTE_PREFIXES = ["/portal/intake", "/portal/recalibrate", "/portal/setup"];

function portalUsesShell(pathname: string) {
  return !BARE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function PortalLayoutFrame({
  identity,
  children,
}: {
  identity: PortalShellIdentity;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (!portalUsesShell(pathname)) {
    return children;
  }

  return (
    <AppShell title="Portal" basePath="/portal" {...identity}>
      {children}
    </AppShell>
  );
}
