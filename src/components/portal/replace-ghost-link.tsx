import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const ReplaceGhostLink = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { active?: boolean }
>(function ReplaceGhostLink({ children, className, active, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "cursor-[var(--cursor-link)] bg-transparent p-0 text-meal-replace text-ink-soft underline decoration-ink-faint underline-offset-4",
        "transition-colors [transition-duration:var(--duration-fast)] [transition-timing-function:var(--ease-standard)]",
        "hover:text-ink hover:decoration-ink focus-visible:text-ink focus-visible:decoration-ink",
        active && "text-ink decoration-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
