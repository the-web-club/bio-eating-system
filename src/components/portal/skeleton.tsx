import type { ReactNode } from "react";
import type { PortalPageCopy, PortalPageSkeleton } from "@/lib/portal/page-copy";
import { cn } from "@/lib/cn";
import { PageHeader } from "./page-header";
import { PageShell, PageSections, Split } from "./layout";

/**
 * Placeholder block. Dimensions mirror the resolved content so nothing shifts
 * when data arrives.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-skeleton rounded-control bg-surface-inset", className)}
      aria-hidden
    />
  );
}

/** Matches DataRow / DisclosureRow height and hairline. */
function RowSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 border-t border-hairline",
        tall ? "py-4" : "py-3",
      )}
    >
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function AsideSkeleton() {
  return (
    <div className="space-y-group">
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-0.5 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-44 max-w-full" />
        <Skeleton className="h-9 w-36 rounded-input" />
      </div>
    </div>
  );
}

/** Mirrors the Today body: focus list and side column below the page header. */
export function TodayBodySkeleton() {
  return (
    <>
      <Split
        main={
          <div>
            <Skeleton className="mb-tight h-4 w-32" />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        }
        aside={<AsideSkeleton />}
      />
      <div className="border-t border-hairline pt-group">
        <div className="mb-tight space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <div className="grid gap-x-12 xl:grid-cols-2">
          <div>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
          <div className="hidden xl:block">
            <RowSkeleton />
            <RowSkeleton />
          </div>
        </div>
      </div>
    </>
  );
}

/** Mirrors the grouped daily plan below the page header. */
export function PlanBodySkeleton() {
  return (
    <Split
      main={
        <div className="space-y-section">
          {[0, 1].map((group) => (
            <div key={group}>
              <Skeleton className="mb-tight h-4 w-28" />
              <RowSkeleton tall />
              <RowSkeleton tall />
              <RowSkeleton tall />
            </div>
          ))}
        </div>
      }
      aside={<AsideSkeleton />}
    />
  );
}

/** Mirrors a single wide list below the page header. */
export function ListBodySkeleton() {
  return (
    <Split
      main={
        <div>
          <Skeleton className="mb-tight h-4 w-32" />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <RowSkeleton key={row} tall />
          ))}
        </div>
      }
      aside={<AsideSkeleton />}
    />
  );
}

/** Mirrors the programs hub below the page header. */
export function ProgramsBodySkeleton() {
  return (
    <div>
      <Skeleton className="h-48 w-full rounded-panel sm:h-40" />
      <div className="mt-section">
        <Skeleton className="mb-tight h-4 w-32" />
        <RowSkeleton tall />
        <RowSkeleton tall />
      </div>
      <div className="mt-section border-t border-hairline pt-group">
        <Skeleton className="mb-tight h-4 w-28" />
        <RowSkeleton tall />
        <RowSkeleton tall />
      </div>
    </div>
  );
}

/** Mirrors a reading-width page body with stacked blocks. */
export function ReadingBodySkeleton() {
  return (
    <div className="space-y-group">
      <Skeleton className="h-24 w-full rounded-panel" />
      <Skeleton className="h-16 w-full rounded-panel" />
      <Skeleton className="h-16 w-full rounded-panel" />
    </div>
  );
}

/** Mirrors the progress charts and suggestions below the page header. */
export function ProgressBodySkeleton() {
  return (
    <>
      <div className="space-y-3 border-t border-hairline pt-group">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-40 w-full rounded-panel" />
      </div>
      <div className="space-y-3 border-t border-hairline pt-group">
        <Skeleton className="h-4 w-32" />
        <RowSkeleton tall />
        <RowSkeleton tall />
      </div>
    </>
  );
}

/** Mirrors the check-in form below the page header. */
export function CheckInBodySkeleton() {
  return (
    <div className="space-y-4 border-t border-hairline pt-group">
      <Skeleton className="h-4 w-28" />
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-11 w-full rounded-input" />
        </div>
      ))}
      <Skeleton className="h-11 w-32 rounded-button" />
    </div>
  );
}

export function portalBodySkeleton(kind: PortalPageSkeleton) {
  switch (kind) {
    case "today":
      return <TodayBodySkeleton />;
    case "plan":
      return <PlanBodySkeleton />;
    case "list":
      return <ListBodySkeleton />;
    case "programs":
      return <ProgramsBodySkeleton />;
    case "reading":
      return <ReadingBodySkeleton />;
    case "progress":
      return <ProgressBodySkeleton />;
    case "check-in":
      return <CheckInBodySkeleton />;
  }
}

/**
 * Route loading UI: real title and description, skeleton body only. Used in
 * loading.tsx and as a Suspense fallback when it matches the page frame.
 */
export function PageLoadingState({
  title,
  description,
  meta,
  actions,
  width = "wide",
  body,
  loadingLabel,
}: PortalPageCopy & { body: ReactNode }) {
  return (
    <PageShell width={width}>
      <div aria-busy="true" aria-label={loadingLabel}>
        <PageSections>
          <PageHeader
            title={title}
            description={description}
            meta={meta}
            actions={actions}
          />
          {body}
        </PageSections>
      </div>
    </PageShell>
  );
}

export function pageLoadingFromCopy(copy: PortalPageCopy) {
  return (
    <PageLoadingState {...copy} body={portalBodySkeleton(copy.skeleton)} />
  );
}

/** @deprecated Use PageLoadingState with TodayBodySkeleton. */
export function PortalSkeleton() {
  return pageLoadingFromCopy({
    title: "Today",
    description: "Today's plan",
    skeleton: "today",
    loadingLabel: "Loading your program",
  });
}

/** @deprecated Use PageLoadingState with PlanBodySkeleton. */
export function PlanSkeleton() {
  return pageLoadingFromCopy({
    title: "Plan",
    description: "My week.",
    skeleton: "plan",
    loadingLabel: "Loading your daily plan",
  });
}

/** @deprecated Use PageLoadingState with ListBodySkeleton. */
export function ListSkeleton({ label }: { label: string }) {
  return pageLoadingFromCopy({
    title: "Shop",
    description: "What do I buy?",
    skeleton: "list",
    loadingLabel: label,
  });
}

/** @deprecated Use PageLoadingState with ProgramsBodySkeleton. */
export function ProgramsSkeleton() {
  return pageLoadingFromCopy({
    title: "Programs",
    description: "What you are working through now, and what you could add.",
    skeleton: "programs",
    loadingLabel: "Loading your programs",
  });
}
