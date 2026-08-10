"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { selectionTransition } from "@/lib/motion";
import { BrandSignature } from "./brand-signature";
import { getAccountNav, getPrimaryNav, isNavItemActive } from "./nav-config";
import { IconClose, IconMenu } from "./icons";
import { ProgramIdentity } from "./program-identity";

export function MobileTopBar({
  weekLabel,
  programLabel,
  rotationPosition,
  authoredWeeks,
  basePath = "/portal",
}: {
  weekLabel?: string;
  programLabel?: string;
  rotationPosition?: number;
  authoredWeeks?: number;
  basePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const primary = getPrimaryNav(basePath);
  const account = getAccountNav(basePath);
  const root = basePath.replace(/\/$/, "") || "/portal";

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface-canvas lg:hidden">
      <div className="flex min-h-14 items-center gap-1 px-2">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-muted transition-colors [transition-duration:var(--duration-fast)] hover:bg-surface-inset hover:text-foreground"
              aria-label="Open menu"
            >
              <IconMenu className="size-5" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-surface-overlay data-[state=open]:animate-[overlay-in_var(--duration-disclosure)_var(--ease-emphasized)] data-[state=closed]:animate-[overlay-out_var(--duration-exit)_var(--ease-exit)]" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(19rem,86vw)] flex-col rounded-r-dialog border-r border-hairline bg-surface-canvas shadow-floating focus:outline-none data-[state=open]:animate-[sheet-in_var(--duration-disclosure)_var(--ease-emphasized)]">
              <div className="flex items-start justify-between gap-3 px-5 pb-5 pt-6">
                <Dialog.Title asChild>
                  <div>
                    <BrandSignature />
                  </div>
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-muted transition-colors [transition-duration:var(--duration-fast)] hover:bg-surface-inset hover:text-foreground"
                    aria-label="Close menu"
                  >
                    <IconClose className="size-5" />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">
                Move to another part of your program.
              </Dialog.Description>
              <ProgramIdentity
                className="mx-5 border-t border-hairline pt-4"
                programLabel={programLabel}
                weekLabel={weekLabel}
                rotationPosition={rotationPosition}
                authoredWeeks={authoredWeeks}
              />
              <nav className="mt-5 flex-1 px-3" aria-label="Mobile primary">
                <ul>
                  {[...primary, account].map((item) => {
                    const active = isNavItemActive(pathname, item.href, basePath);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Dialog.Close asChild>
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "relative flex min-h-12 items-center gap-2.5 rounded-control py-2 pl-4 pr-3 text-lead",
                              active
                                ? "font-medium text-foreground"
                                : "text-muted",
                            )}
                          >
                            {active ? (
                              <span
                                className="absolute inset-y-2 left-0 w-0.5 rounded-pill bg-accent"
                                aria-hidden
                              />
                            ) : null}
                            <Icon
                              className={cn(
                                "size-4 shrink-0",
                                active ? "text-soft" : "text-faint",
                              )}
                            />
                            {item.label}
                          </Link>
                        </Dialog.Close>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className="min-w-0 flex-1">
          <BrandSignature href={root} size="compact" />
        </div>
        {weekLabel ? (
          <span className="shrink-0 pr-2 font-meta text-meta tabular text-faint">
            {weekLabel}
          </span>
        ) : null}
      </div>
    </header>
  );
}

export function MobileBottomNav({ basePath = "/portal" }: { basePath?: string }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const items = getPrimaryNav(basePath)
    .filter((item) => item.mobilePrimary)
    .slice(0, 5);

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface-canvas pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul
        className={cn(
          "grid",
          items.length === 5 && "grid-cols-5",
          items.length === 4 && "grid-cols-4",
          items.length === 3 && "grid-cols-3",
        )}
      >
        {items.map((item) => {
          const active = isNavItemActive(pathname, item.href, basePath);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-micro",
                  active ? "font-medium text-foreground" : "text-muted",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId={reduceMotion ? undefined : "nav-tab-indicator"}
                    transition={selectionTransition(reduceMotion)}
                    className="absolute inset-x-4 top-0 h-0.5 rounded-pill bg-accent"
                    aria-hidden
                  />
                ) : null}
                <Icon className={cn("size-5", active ? "text-soft" : "text-faint")} />
                <span className="w-full truncate text-center">{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
