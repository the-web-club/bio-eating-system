import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Elevation wrapper for discrete objects. Prefer Surface for new work; Panel
 * remains for existing call sites during migration.
 */
export function Panel({
  children,
  as: Tag = "div",
  elevation = "border",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  elevation?: "border" | "shadow" | "raised";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "p-5",
        elevation === "border" && "rounded-surface border border-hairline bg-surface",
        elevation === "shadow" && "surface bg-surface",
        elevation === "raised" && "surface bg-surface",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Elevation level 1: a warm inset surface for selected or actionable content.
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
    <Tag className={cn("surface surface--sunken bg-surface-inset p-5", className)}>
      {children}
    </Tag>
  );
}
