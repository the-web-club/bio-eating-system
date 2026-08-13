"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ScrollArea } from "./scroll-area";

export type ComboboxOption = { value: string; label: string };

/**
 * Combobox: Popover + filterable list. Hand-rolled listbox behaviour on top of
 * Radix Popover (Radix has no Combobox primitive; cmdk powers CommandMenu).
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Search…",
  label,
}: {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="flex w-full flex-col gap-s1">
      {label ? <span className="text-meta text-soft">{label}</span> : null}
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-11 w-full items-center justify-between border-0 border-b border-hairline-strong bg-transparent px-0 text-body",
              "cursor-[var(--cursor-control)] text-left transition-colors duration-instant",
              "hover:border-accent data-[state=open]:border-accent",
              selected ? "text-foreground" : "text-muted",
            )}
          >
            <span>{selected?.label ?? placeholder}</span>
            <span className="text-muted" aria-hidden>
              ▾
            </span>
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className={cn(
              "surface-panel z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden bg-surface",
              "origin-[var(--radix-popover-content-transform-origin)]",
              "data-[state=open]:animate-[menu-in_var(--duration-fast)_var(--ease-out)]",
              "data-[state=closed]:animate-[menu-out_var(--duration-exit)_var(--ease-exit)]",
            )}
          >
            <div className="border-b border-hairline p-s2">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                className="h-9 w-full border-0 border-b border-hairline bg-transparent px-0 text-body text-foreground outline-none focus:border-accent focus:outline-none"
              />
            </div>
            <ScrollArea className="max-h-56">
              <ul role="listbox" className="p-s1">
                {filtered.map((option) => {
                  const active = option.value === value;
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={cn(
                          "relative flex h-9 w-full items-center rounded-control py-s2 pl-8 pr-s2 text-left text-body text-foreground",
                          "cursor-[var(--cursor-control)] hover:bg-surface-inset",
                        )}
                        onClick={() => {
                          onValueChange?.(option.value);
                          setOpen(false);
                          setQuery("");
                        }}
                      >
                        <span
                          className={cn(
                            "absolute left-2 text-foreground",
                            active ? "opacity-100" : "opacity-0",
                          )}
                          aria-hidden
                        >
                          ✓
                        </span>
                        {option.label}
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 ? (
                  <li className="px-s2 py-s2 text-body text-muted">No matches</li>
                ) : null}
              </ul>
            </ScrollArea>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
