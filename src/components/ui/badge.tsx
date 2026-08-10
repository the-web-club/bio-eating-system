import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Small state indicator. Deliberately rare: state normally comes from the
 * composition, so reach for quiet metadata before reaching for this. Sentence
 * case, body face - a badge is not a place for decorative monospace.
 */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge px-1.5 py-0.5 text-micro",
        tone === "accent"
          ? "bg-accent-subtle text-accent-text"
          : "bg-surface-inset text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
