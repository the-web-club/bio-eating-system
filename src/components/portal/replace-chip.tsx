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
        "rounded-control border border-hairline bg-transparent px-4 py-2.5 text-meta text-foreground",
        "transition-colors duration-fast ease-standard",
        "hover:bg-surface-inset hover:border-hairline-strong",
        selected &&
          "border-foreground bg-foreground text-surface hover:border-foreground hover:bg-foreground",
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
          className="h-[2.375rem] animate-skeleton rounded-control bg-surface-inset"
          style={{ width }}
        />
      ))}
    </div>
  );
}
