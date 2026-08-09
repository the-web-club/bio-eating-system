import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Elevation level 2: a discrete interactive object. It takes a hairline border
 * OR a minimal shadow, never both, and it is not the default wrapper for page
 * content. Ordinary sections use spacing and rules instead.
 */
export function Panel({
  children,
  as: Tag = "div",
  elevation = "border",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  elevation?: "border" | "shadow";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "rounded-panel bg-surface p-5",
        elevation === "border" ? "border border-hairline" : "shadow-object",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Elevation level 1: a warm inset surface for selected or actionable content.
 * No border, no shadow — the surface shift is the whole signal.
 */
export function InsetPanel({
  children,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag className={cn("rounded-panel bg-surface-inset p-5", className)}>
      {children}
    </Tag>
  );
}
