"use client";

import type { ReactNode } from "react";
import { LayoutGroup } from "framer-motion";
import { MobileBottomNav, MobileTopBar } from "./mobile-navigation";
import { PageTransition } from "./page-transition";
import { PortalSidebar } from "./portal-sidebar";
import { ScrollReset } from "./scroll-reset";

/**
 * Product shell: a stable rail beside an open content canvas. The shell adds no
 * container around page content - pages compose their own sections.
 */
export function AppShell({
  title,
  weekLabel,
  programLabel,
  rotationPosition,
  authoredWeeks,
  children,
  basePath = "/portal",
  devBar,
}: {
  /** Names the main region for assistive technology. */
  title: string;
  weekLabel?: string;
  programLabel?: string;
  rotationPosition?: number;
  authoredWeeks?: number;
  children: ReactNode;
  basePath?: string;
  /** Compact developer-only bar. Never used for customer-facing copy. */
  devBar?: ReactNode;
}) {
  const shellGroupId = `shell-${basePath.replace(/\/$/, "") || "portal"}`;

  return (
    <div className="min-h-dvh bg-surface-canvas text-foreground">
      <ScrollReset />
      {devBar}
      <LayoutGroup id={shellGroupId}>
        <div className="lg:pl-rail">
          <PortalSidebar
            weekLabel={weekLabel}
            programLabel={programLabel}
            rotationPosition={rotationPosition}
            authoredWeeks={authoredWeeks}
            basePath={basePath}
          />
          <div className="flex min-h-dvh min-w-0 flex-col pb-16 lg:pb-0">
            <MobileTopBar
              weekLabel={weekLabel}
              programLabel={programLabel}
              rotationPosition={rotationPosition}
              authoredWeeks={authoredWeeks}
              basePath={basePath}
            />
            <main aria-label={title} className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <MobileBottomNav basePath={basePath} />
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
}
