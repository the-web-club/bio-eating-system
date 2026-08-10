"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { useReducedMotion } from "motion/react";
import { useCallback, useId, useState, type ReactNode } from "react";
import { IconCheck, IconChevronDown } from "@/components/portal/icons";
import { cn } from "@/lib/cn";
import {
  menuSurfaceAnimationClasses,
  menuSurfaceReducedMotionStyle,
} from "@/lib/motion";
import { ScrollArea } from "./scroll-area";

export type SelectOption = { value: string; label: string };

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  label,
  disabled,
  error,
}: {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const onOpenChange = useCallback((next: boolean) => setOpen(next), []);
  const labelId = useId();

  return (
    <div className="flex w-full flex-col gap-s1">
      {label ? (
        <span className="text-meta text-soft" id={labelId}>
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
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={error || undefined}
          className={cn(
            "inline-flex h-11 w-full items-center justify-between gap-s2 border-0 border-b border-hairline-strong bg-transparent px-0 text-body text-foreground",
            "cursor-control transition-colors duration-instant",
            "hover:border-accent data-[state=open]:border-accent",
            "data-[placeholder]:text-muted",
            error
              ? "border-status-danger-line"
              : "focus-visible:border-accent",
            "disabled:cursor-not-allowed disabled:border-hairline disabled:text-disabled",
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className="text-faint" aria-hidden>
            <IconChevronDown className="size-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={cn(
              "z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-surface bg-surface shadow-floating",
              "origin-[var(--radix-select-content-transform-origin)]",
              menuSurfaceAnimationClasses,
            )}
            style={menuSurfaceReducedMotionStyle(reduceMotion)}
          >
            <ScrollArea className="max-h-[min(var(--max-height-menu),var(--radix-select-content-available-height))]">
              <SelectPrimitive.Viewport className="p-s1">
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
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        "relative flex h-9 cursor-control select-none items-center rounded-control py-s2 pl-8 pr-s2 text-body text-foreground outline-none",
        "data-[disabled]:pointer-events-none data-[disabled]:text-disabled",
        "data-[highlighted]:bg-surface-inset",
      )}
    >
      <span className="absolute left-2 inline-flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator className="text-foreground">
          <IconCheck className="size-3.5" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="tabular">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
