"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/cn";

export function CheckboxGroup({
  children,
  layout = "stack",
  className,
}: {
  children: React.ReactNode;
  layout?: "stack" | "wrap";
  className?: string;
}) {
  return (
    <div
      className={cn(
        layout === "wrap" ? "checkbox-group-wrap" : "checkbox-group",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Checkbox({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
  disabledReason,
}: {
  id: string;
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "control-checkbox text-body text-foreground",
        disabled && "text-disabled",
      )}
      title={disabled ? disabledReason : undefined}
    >
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange?.(value === true)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-control border border-hairline-strong bg-surface",
          "cursor-[var(--cursor-control)] transition-colors [transition-duration:var(--duration-selection)] [transition-timing-function:var(--ease-state)]",
          "data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-on-accent",
        )}
      >
        <CheckboxPrimitive.Indicator>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2.5 6.2 5 8.5 9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label}
    </label>
  );
}
