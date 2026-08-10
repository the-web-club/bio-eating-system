"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { disclosureTransition, disclosureVariants } from "@/lib/motion";
import { IconChevronDown } from "./icons";

/**
 * A data row that reveals its rationale in place. The row is the control, the
 * detail expands directly beneath it, and the whole thing sits on hairlines
 * rather than inside a card.
 *
 * Rows without detail render as static rows: no chevron, no false affordance.
 */
export function DisclosureRow({
  title,
  summary,
  value,
  children,
  detailLabel,
  className,
}: {
  title: string;
  /** Always-visible supporting line. */
  summary?: ReactNode;
  /** Right-aligned structured value or reference context. */
  value?: ReactNode;
  /** Expanded content. Omit to render a static row. */
  children?: ReactNode;
  /** Accessible name for the control, e.g. "Ferritin rationale". */
  detailLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const panelId = useId();
  const variants = disclosureVariants(reduceMotion);

  const heading = (
    <div className="min-w-0">
      <p className="text-title text-foreground">{title}</p>
      {summary ? <div className="mt-1 text-body text-muted">{summary}</div> : null}
    </div>
  );

  if (!children) {
    return (
      <li className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 py-4", className)}>
        {heading}
        {value ? <div className="justify-self-end">{value}</div> : null}
      </li>
    );
  }

  return (
    <li className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={detailLabel}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group -mx-3 grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 rounded-control px-3 py-4 text-left",
          "cursor-[var(--cursor-control)] transition-colors [transition-duration:var(--duration-fast)] hover:bg-surface-inset",
        )}
      >
        {heading}
        <span className="flex items-baseline gap-3 justify-self-end">
          {value}
          <IconChevronDown
            className={cn(
              "size-4 shrink-0 translate-y-0.5 text-faint transition-transform [transition-duration:var(--duration-selection)] [transition-timing-function:var(--ease-state)] group-hover:text-foreground",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </span>
      </button>
      <div id={panelId} role="region">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={variants.collapsed}
              animate={variants.expanded}
              exit={variants.collapsed}
              transition={disclosureTransition(reduceMotion)}
              className="overflow-hidden"
            >
              <div className="measure space-y-2 pb-4 text-body text-soft">
                {children}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  );
}
