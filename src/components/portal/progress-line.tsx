"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { progressTransition } from "@/lib/motion";

/**
 * A thin progress line with its reading beside it. Typography carries the
 * meaning; the line is a 2px rule, not a container. The fill animates from its
 * previous value, so a week advancing looks like movement rather than a reset.
 */
export function ProgressLine({
  value,
  max,
  label,
  reading,
  tone = "default",
  className,
}: {
  value: number;
  max: number;
  label: string;
  /** Overrides the default "value/max" reading. */
  reading?: string;
  tone?: "default" | "feature";
  className?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const featured = tone === "feature";

  return (
    <div className={cn("space-y-s1", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span
          className={cn(
            "text-meta",
            featured ? "text-on-feature-muted" : "text-muted",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "text-meta tabular",
            featured ? "text-on-feature" : "text-foreground",
          )}
        >
          {reading ?? `${value}/${max}`}
        </span>
      </div>
      <div
        className={cn(
          "h-0.5 w-full overflow-hidden rounded-pill",
          featured ? "bg-on-feature-track" : "bg-accent-track",
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <motion.div
          className={cn(
            "h-full rounded-pill",
            featured ? "bg-on-feature" : "bg-accent",
          )}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={progressTransition(reduceMotion)}
        />
      </div>
    </div>
  );
}
