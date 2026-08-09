import type { ReactNode } from "react";
import { MobileBottomNav, MobileTopBar } from "./mobile-navigation";
import { PageTransition } from "./page-transition";
import { PortalSidebar } from "./portal-sidebar";

/**
 * Product shell: a stable rail beside an open content canvas. The shell adds no
 * container around page content — pages compose their own sections.
 */
export function AppShell({
  title,
  weekLabel,
  programLabel,
  children,
  basePath = "/portal",
  devBar,
}: {
  /** Names the main region for assistive technology. */
  title: string;
  weekLabel?: string;
  programLabel?: string;
  children: ReactNode;
  basePath?: string;
  /** Compact developer-only bar. Never used for customer-facing copy. */
  devBar?: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface-canvas text-foreground">
      {devBar}
      <div className="flex">
        <PortalSidebar
          weekLabel={weekLabel}
          programLabel={programLabel}
          basePath={basePath}
        />
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col pb-16 lg:pb-0">
          <MobileTopBar
            weekLabel={weekLabel}
            programLabel={programLabel}
            basePath={basePath}
          />
          <main aria-label={title} className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <MobileBottomNav basePath={basePath} />
        </div>
      </div>
    </div>
  );
}
