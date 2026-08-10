"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Elevation level 3. Overlay fades in place; the panel settles 4px with
 * emphasized easing. No scale. Internal hairline only above the footer.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  description,
  footer,
  showClose = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children?: ReactNode;
  description?: string;
  /** Primary actions. Prefer this over nesting buttons in children. */
  footer?: ReactNode;
  /** Quiet corner dismiss when there is no footer. */
  showClose?: boolean;
}) {
  const hasFooter = Boolean(footer);
  const showCornerClose = showClose && !hasFooter;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-surface-overlay",
            "data-[state=open]:animate-[overlay-in_var(--duration-disclosure)_var(--ease-emphasized)]",
            "data-[state=closed]:animate-[overlay-out_var(--duration-exit)_var(--ease-exit)]",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-sheet bg-surface px-6 py-6 shadow-modal sm:px-7 sm:py-7",
            "focus:outline-none",
            "data-[state=open]:animate-[dialog-in_var(--duration-disclosure)_var(--ease-emphasized)]",
            "data-[state=closed]:animate-[dialog-out_var(--duration-exit)_var(--ease-exit)]",
          )}
        >
          <div className={cn(showCornerClose && "pr-8")}>
            <DialogPrimitive.Title className="text-body-lg font-semibold text-foreground">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1.5 measure text-body text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">
                {title}
              </DialogPrimitive.Description>
            )}
          </div>

          {children ? <div className="mt-group">{children}</div> : null}

          {hasFooter ? (
            <div className="mt-group flex flex-wrap items-center justify-end gap-3 border-t border-hairline pt-tight">
              {footer}
            </div>
          ) : null}

          {showCornerClose ? (
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className={cn(
                  "absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-control",
                  "text-faint transition-[color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
                  "hover:bg-surface-inset hover:text-muted",
                  "focus-visible:outline-none focus-visible:bg-surface-inset focus-visible:text-muted",
                )}
                aria-label="Close"
              >
                <CloseGlyph />
              </button>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function CloseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
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
