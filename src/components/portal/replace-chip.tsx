import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const ReplaceChip = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { selected?: boolean }
>(function ReplaceChip({ children, className, selected, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "rounded-spa-control border border-ink-faint bg-transparent px-4 py-2.5 text-meal-chip text-ink-deep",
        "transition-colors [transition-duration:var(--duration-fast)] [transition-timing-function:var(--ease-standard)]",
        "hover:bg-paper-shade hover:border-ink-hairline",
        selected && "border-ink bg-ink text-paper-high hover:bg-ink hover:border-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export function ReplaceChipSkeleton() {
  const widths = [88, 104, 72] as const;
  return (
    <div className="flex flex-wrap gap-2" aria-hidden>
      {widths.map((width) => (
        <div
          key={width}
          className="h-[2.375rem] animate-skeleton rounded-spa-control bg-paper-shade"
          style={{ width }}
        />
      ))}
    </div>
  );
}
