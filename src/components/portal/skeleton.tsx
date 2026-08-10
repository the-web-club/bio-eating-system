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

/** Matches meal row height and hairline. */
function MealRowSkeleton({ optional = false }: { optional?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-s4 border-t border-hairline py-s4",
        optional && "opacity-80",
      )}
    >
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function AsideSkeleton() {
  return (
    <div className="space-y-s5">
      <div className="space-y-s2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-44 max-w-full" />
      </div>
      <div className="space-y-s2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-4 w-36" />
    </div>
  );
}

/** Mirrors the Today body: meal list and supporting rail. */
export function TodayBodySkeleton() {
  return (
    <Split
      main={
        <div>
          <MealRowSkeleton />
          <MealRowSkeleton />
          <MealRowSkeleton />
          <MealRowSkeleton optional />
        </div>
      }
      aside={<AsideSkeleton />}
    />
  );
}

/** Mirrors the plan body: meal list and week rail. */
export function PlanBodySkeleton() {
  return (
    <Split
      main={
        <div>
          <MealRowSkeleton />
          <MealRowSkeleton />
          <MealRowSkeleton />
          <MealRowSkeleton optional />
        </div>
      }
      aside={<AsideSkeleton />}
    />
  );
}

/** Mirrors the weekly shop list and cost rail. */
export function ListBodySkeleton() {
  return (
    <Split
      main={
        <div>
          <Skeleton className="mb-s2 h-4 w-32" />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-s4 border-t border-hairline py-s4"
            >
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-12" />
            </div>
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
    <div className="space-y-s6">
      <Skeleton className="h-48 w-full rounded-surface sm:h-40" />
      <div>
        <Skeleton className="mb-s2 h-4 w-32" />
        <MealRowSkeleton />
        <MealRowSkeleton />
      </div>
      <div className="border-t border-hairline pt-s5">
        <Skeleton className="mb-s2 h-4 w-28" />
        <MealRowSkeleton />
        <MealRowSkeleton />
      </div>
    </div>
  );
}

/** Mirrors profile sections at reading width. */
export function ReadingBodySkeleton() {
  return (
    <div className="space-y-s6">
      <div>
        <Skeleton className="mb-s2 h-4 w-24" />
        <MealRowSkeleton />
        <MealRowSkeleton />
      </div>
      <div className="border-t border-hairline pt-s5">
        <Skeleton className="mb-s2 h-4 w-28" />
        <MealRowSkeleton />
        <MealRowSkeleton />
      </div>
      <div className="border-t border-hairline pt-s5">
        <Skeleton className="mb-s2 h-4 w-20" />
        <Skeleton className="mt-s2 h-11 w-40" />
      </div>
    </div>
  );
}

/** Mirrors progress sections below the page header. */
export function ProgressBodySkeleton() {
  return (
    <div className="space-y-s6">
      <div>
        <Skeleton className="mb-s2 h-4 w-28" />
        <MealRowSkeleton />
        <MealRowSkeleton />
        <MealRowSkeleton />
      </div>
      <div className="border-t border-hairline pt-s5">
        <Skeleton className="mb-s2 h-4 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

/** Mirrors the check-in form below the page header. */
export function CheckInBodySkeleton() {
  return (
    <div className="space-y-s5 border-t border-hairline pt-s5">
      <Skeleton className="h-4 w-28" />
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="space-y-s2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <Skeleton className="h-11 w-32" />
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
}: PortalPageCopy & {
  body: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
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
    skeleton: "today",
    loadingLabel: "Loading your program",
  });
}

/** @deprecated Use PageLoadingState with PlanBodySkeleton. */
export function PlanSkeleton() {
  return pageLoadingFromCopy({
    title: "Plan",
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
