import type { ReactNode } from "react";
import { PageSections, PageShell } from "./layout";
import { PageHeader } from "./page-header";

/**
 * Stable page opening that renders synchronously. Pair with Suspense for the
 * body so title and description appear before data resolves.
 */
export function PortalPageFrame({
  title,
  description,
  meta,
  actions,
  width = "wide",
  children,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  width?: "wide" | "reading";
  children: ReactNode;
}) {
  return (
    <PageShell width={width}>
      <PageSections>
        <PageHeader
          title={title}
          description={description}
          meta={meta}
          actions={actions}
        />
        {children}
      </PageSections>
    </PageShell>
  );
}
