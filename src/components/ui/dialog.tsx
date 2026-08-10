"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

/**
 * Elevation level 3. Floating interfaces carry a controlled shadow and clear
 * layering, so they do not also need a border.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  description,
  showClose = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  description?: string;
  showClose?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-surface-overlay",
            "data-[state=open]:animate-[fade-in_var(--duration-disclosure)_var(--ease-emphasized)]",
            "data-[state=closed]:animate-[fade-out_var(--duration-exit)_var(--ease-exit)]",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-dialog bg-surface p-6 shadow-modal sm:p-7",
            "focus:outline-none",
            "data-[state=open]:animate-[dialog-in_var(--duration-disclosure)_var(--ease-emphasized)]",
            "data-[state=closed]:animate-[dialog-out_var(--duration-exit)_var(--ease-exit)]",
          )}
        >
          <DialogPrimitive.Title className="text-section text-foreground">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1.5 text-body text-muted">
              {description}
            </DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only">
              {title}
            </DialogPrimitive.Description>
          )}
          <div className="mt-tight text-body text-soft">{children}</div>
          {showClose ? (
            <div className="mt-group flex justify-end">
              <DialogPrimitive.Close asChild>
                <Button variant="secondary">Close</Button>
              </DialogPrimitive.Close>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Prefer Dialog - kept for existing imports. */
export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} title={title}>
      {children}
    </Dialog>
  );
}
