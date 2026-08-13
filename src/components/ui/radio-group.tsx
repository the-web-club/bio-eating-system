"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/cn";

export function RadioGroup({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      aria-label={label}
      className="control-group"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="control-checkbox text-body text-foreground"
        >
          <RadioGroupPrimitive.Item
            value={option.value}
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-control border border-hairline-strong bg-surface",
              "cursor-[var(--cursor-control)] transition-colors [transition-duration:var(--duration-selection)] [transition-timing-function:var(--ease-state)]",
              "data-[state=checked]:border-accent",
            )}
          >
            <RadioGroupPrimitive.Indicator className="size-2.5 rounded-control bg-accent" />
          </RadioGroupPrimitive.Item>
          {option.label}
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
