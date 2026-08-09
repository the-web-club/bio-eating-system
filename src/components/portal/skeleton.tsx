import { cn } from "@/lib/cn";
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

function HeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      {action ? <Skeleton className="h-11 w-40 rounded-button sm:mt-1.5" /> : null}
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

function Frame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell>
      <div aria-busy="true" aria-label={label}>
        <PageSections>{children}</PageSections>
      </div>
    </PageShell>
  );
}

/** Mirrors the Today composition: editorial header, focus list, side column. */
export function PortalSkeleton() {
  return (
    <Frame label="Loading your program">
      <HeaderSkeleton />
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
    </Frame>
  );
}

/** Mirrors the grouped daily plan. */
export function PlanSkeleton() {
  return (
    <Frame label="Loading your daily plan">
      <HeaderSkeleton action={false} />
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
    </Frame>
  );
}

/** Mirrors a single wide list, such as the weekly plan or marker index. */
export function ListSkeleton({ label }: { label: string }) {
  return (
    <Frame label={label}>
      <HeaderSkeleton />
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
    </Frame>
  );
}

/** Mirrors the programs hub: one feature panel, then grouped rows. */
export function ProgramsSkeleton() {
  return (
    <Frame label="Loading your programs">
      <HeaderSkeleton action={false} />
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
    </Frame>
  );
}
