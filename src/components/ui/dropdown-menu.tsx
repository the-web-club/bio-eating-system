"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function DropdownMenu({
  trigger,
  children,
}: {
  trigger: ReactNode;
  children: ReactNode;
}) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={4}
          className={cn(
            "z-50 min-w-44 overflow-hidden rounded-surface bg-surface p-1 shadow-floating",
            "origin-[var(--radix-dropdown-menu-content-transform-origin)]",
            "data-[state=open]:animate-[menu-in_var(--duration-fast)_var(--ease-out)]",
            "data-[state=closed]:animate-[menu-out_var(--duration-exit)_var(--ease-exit)]",
          )}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export function DropdownMenuItem({
  children,
  shortcut,
  destructive,
  onSelect,
  disabled,
}: {
  children: ReactNode;
  shortcut?: string;
  destructive?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        "relative flex h-9 cursor-[var(--cursor-control)] select-none items-center rounded-control px-3 text-body outline-none",
        "data-[highlighted]:bg-surface-inset data-[disabled]:text-disabled",
        destructive ? "text-status-danger-text" : "text-foreground",
      )}
    >
      <span className="flex-1">{children}</span>
      {shortcut ? (
        <span className="ml-4 text-meta text-muted">{shortcut}</span>
      ) : null}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuSeparator() {
  return (
    <DropdownMenuPrimitive.Separator className="my-1 h-px bg-hairline" />
  );
}
