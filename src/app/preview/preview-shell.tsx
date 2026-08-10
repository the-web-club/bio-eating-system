import type { ReactNode } from "react";
import { AppShell } from "@/components/portal/app-shell";
import { FIXTURE_AUTHORED_WEEKS, FIXTURE_WEEK } from "./fixtures";

export const PREVIEW_BASE = "/preview";
export const PREVIEW_WEEK = "Week 03";
export const PREVIEW_PROGRAM = "Core plan";

/** Local copy — avoid importing portal/format (pulls the content catalogue / fs). */
function previewRotationPosition(week: number, authoredWeeks: number): number {
  if (authoredWeeks <= 0) return 1;
  return ((week - 1) % authoredWeeks) + 1;
}

/**
 * The preview route renders the real views with fixture data. Development
 * context lives in one compact bar above the shell so it never reads as
 * customer-facing product copy.
 */
export function PreviewShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <AppShell
      title={title}
      weekLabel={PREVIEW_WEEK}
      programLabel={PREVIEW_PROGRAM}
      rotationPosition={previewRotationPosition(
        FIXTURE_WEEK,
        FIXTURE_AUTHORED_WEEKS,
      )}
      authoredWeeks={FIXTURE_AUTHORED_WEEKS}
      basePath={PREVIEW_BASE}
      devBar={
        <div className="flex items-center gap-2 border-b border-hairline bg-surface-inset px-gutter py-1.5 sm:px-8">
          <span className="size-1.5 shrink-0 rounded-pill bg-accent" aria-hidden />
          <p className="text-micro text-muted">Design preview · fixture data</p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
