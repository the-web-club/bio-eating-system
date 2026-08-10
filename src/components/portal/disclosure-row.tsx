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
  summary?: ReactNode;
  value?: ReactNode;
  children?: ReactNode;
  detailLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const panelId = useId();
  const variants = disclosureVariants(reduceMotion);

  const heading = (
    <div className="min-w-0">
      <p className="text-body-lg font-semibold text-foreground">{title}</p>
      {summary ? <div className="mt-s1 text-body text-muted">{summary}</div> : null}
    </div>
  );

  if (!children) {
    return (
      <li
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-s4 py-s4",
          className,
        )}
      >
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
          "group -mx-3 grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-s4 rounded-control px-3 py-s4 text-left",
          "cursor-control transition-colors duration-fast hover:bg-surface-inset",
        )}
      >
        {heading}
        <span className="flex items-baseline gap-s4 justify-self-end">
          {value}
          <IconChevronDown
            className={cn(
              "size-4 shrink-0 translate-y-0.5 text-faint transition-transform duration-selection ease-state group-hover:text-foreground",
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
              <div className="measure space-y-s4 pb-s4 text-body text-soft">
                {children}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  );
}
