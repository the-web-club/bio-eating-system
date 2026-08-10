"use client";

import { cn } from "@/lib/cn";

/**
 * A discrete interactive row. Selection is marked by the radio indicator only.
 */
export function OptionCard({
  selected,
  title,
  description,
  onSelect,
  name,
  value,
}: {
  selected: boolean;
  title: string;
  description?: string;
  onSelect: () => void;
  name: string;
  value: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-12 cursor-[var(--cursor-control)] items-start gap-s4 border-b border-hairline py-s4",
        "transition-colors [transition-duration:var(--duration-selection)] [transition-timing-function:var(--ease-state)]",
        "hover:bg-surface-inset",
      )}
    >
      <input
        type="radio"
        className="mt-0.5 size-4 shrink-0 accent-accent"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
      />
      <span className="min-w-0">
        <span className="block text-body text-foreground">{title}</span>
        {description ? (
          <span className="mt-s1 block text-meta text-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
