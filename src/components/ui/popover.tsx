"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Popover({
  trigger,
  children,
  align = "center",
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
}) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={8}
          className={cn(
            "surface-panel z-50 w-72 bg-surface p-4 outline-none",
            "origin-[var(--radix-popover-content-transform-origin)]",
            "data-[state=open]:animate-[menu-in_var(--duration-fast)_var(--ease-standard)]",
            "data-[state=closed]:animate-[menu-out_var(--duration-exit)_var(--ease-exit)]",
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
