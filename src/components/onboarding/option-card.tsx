"use client";

import { cn } from "@/lib/cn";

/**
 * A discrete interactive object, so a border is earned here. Selection is an
 * inset surface plus an accent edge — not a fill.
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
        "flex min-h-12 cursor-[var(--cursor-control)] items-start gap-3 rounded-input border px-4 py-3",
        "transition-colors [transition-duration:var(--duration-selection)] [transition-timing-function:var(--ease-state)]",
        selected
          ? "border-accent bg-surface-selected"
          : "border-hairline-strong hover:bg-surface-inset",
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
          <span className="mt-0.5 block text-small text-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
