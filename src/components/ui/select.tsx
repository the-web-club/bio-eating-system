"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { useReducedMotion } from "framer-motion";
import { useCallback, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { duration, easeCss } from "@/lib/motion";
import { ScrollArea } from "./scroll-area";

export type SelectOption = { value: string; label: string };

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  label,
  disabled,
}: {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const onOpenChange = useCallback((next: boolean) => setOpen(next), []);

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <span className="text-body text-foreground" id="select-label">
          {label}
        </span>
      ) : null}
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={onOpenChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          aria-labelledby={label ? "select-label" : undefined}
          className={cn(
            "inline-flex h-11 w-full items-center justify-between gap-2 rounded-input border border-hairline-strong bg-surface px-3 text-body text-foreground",
            "cursor-[var(--cursor-control)] transition-colors [transition-duration:var(--duration-instant)]",
            "data-[placeholder]:text-muted disabled:opacity-60",
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className="text-muted" aria-hidden>
            ▾
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={cn(
              "z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-panel bg-surface shadow-floating",
              "origin-[var(--radix-select-content-transform-origin)]",
              "data-[state=open]:animate-[menu-in_var(--duration-fast)_var(--ease-out)]",
              "data-[state=closed]:animate-[menu-out_var(--duration-exit)_var(--ease-exit)]",
            )}
            style={
              reduceMotion
                ? {
                    animationDuration: `${duration.exit}ms`,
                    animationTimingFunction: easeCss.linear,
                  }
                : undefined
            }
          >
            <ScrollArea className="max-h-[min(320px,var(--radix-select-content-available-height))]">
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectPrimitive.Viewport>
            </ScrollArea>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

function SelectItem({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  // No highlight transition: keyboard arrows must not smear.
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        "relative flex h-9 cursor-[var(--cursor-control)] select-none items-center rounded-control py-2 pl-8 pr-3 text-body text-foreground outline-none",
        "data-[disabled]:pointer-events-none data-[disabled]:text-disabled",
        "data-[highlighted]:bg-surface-inset",
      )}
    >
      <span className="absolute left-2 inline-flex w-4 items-center justify-center">
        <span className="opacity-0" aria-hidden>
          ✓
        </span>
        <SelectPrimitive.ItemIndicator className="absolute text-foreground">
          ✓
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="tabular">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
