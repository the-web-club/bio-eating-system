"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { selectionTransition } from "@/lib/motion";

export type TabItem = {
  id: string;
  label: string;
  panel: ReactNode;
};

/**
 * Sentence-case labels in the body face, with a shared indicator that travels
 * between tabs. Labels wrap rather than scroll, so there is no hidden overflow.
 */
export function Tabs({
  items,
  defaultValue,
}: {
  items: TabItem[];
  defaultValue?: string;
}) {
  const layoutId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const [value, setValue] = useState(defaultValue ?? items[0]?.id ?? "");

  return (
    <TabsPrimitive.Root value={value} onValueChange={setValue}>
      <TabsPrimitive.List
        aria-label="Sections"
        className="relative flex flex-wrap gap-x-6 border-b border-hairline"
      >
        {items.map((item) => {
          const selected = item.id === value;
          return (
            <TabsPrimitive.Trigger
              key={item.id}
              value={item.id}
              className={cn(
                "relative -mb-px cursor-[var(--cursor-control)] px-s1 py-s2 text-body",
                "transition-colors [transition-duration:var(--duration-fast)]",
                selected
                  ? "font-medium text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {item.label}
              {selected ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : `tab-indicator-${layoutId}`}
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-pill bg-accent"
                  transition={selectionTransition(reduceMotion)}
                />
              ) : null}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content
          key={item.id}
          value={item.id}
          className="pt-tight text-body text-soft outline-none"
        >
          {item.panel}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
