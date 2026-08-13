import { Suspense, type ReactNode } from "react";
import type { PortalPageCopy } from "@/lib/portal/page-copy";
import { PortalPageFrame } from "./portal-page-frame";
import { portalBodySkeleton } from "./skeleton";

/**
 * Static page opening with a streaming body. Title and description paint
 * immediately; only `{children}` waits on data.
 */
export function PortalPageWithSuspense({
  copy,
  meta,
  actions,
  children,
}: {
  copy: PortalPageCopy;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PortalPageFrame
      title={copy.title}
      description={copy.description}
      width={copy.width}
      meta={meta}
      actions={actions}
    >
      <Suspense fallback={portalBodySkeleton(copy.skeleton)}>{children}</Suspense>
    </PortalPageFrame>
  );
}
