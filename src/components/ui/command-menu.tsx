"use client";

import { Command } from "cmdk";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import * as Dialog from "@radix-ui/react-dialog";

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  onSelect: () => void;
};

export function CommandMenu({
  items,
  open: controlledOpen,
  onOpenChange,
}: {
  items: CommandItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const groups = items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const key = item.group ?? "Actions";
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-surface-overlay data-[state=open]:animate-[overlay-in_var(--duration-disclosure)_var(--ease-emphasized)] data-[state=closed]:animate-[overlay-out_var(--duration-exit)_var(--ease-exit)]" />
        <Dialog.Content
          className={cn(
            "surface-modal fixed left-1/2 top-[20%] z-[70] w-full max-w-lg -translate-x-1/2 overflow-hidden bg-surface",
            "data-[state=open]:animate-[menu-in_var(--duration-disclosure)_var(--ease-out)]",
            "focus:outline-none",
          )}
        >
          <Dialog.Title className="sr-only">Command menu</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search navigation and actions
          </Dialog.Description>
          <Command
            className="flex flex-col"
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <Command.Input
              placeholder="Search…"
              className="h-12 w-full border-0 border-b border-hairline bg-transparent px-4 text-body-lg text-foreground outline-none placeholder:text-muted"
            />
            <Command.List className="max-h-72 overflow-auto p-2">
              <Command.Empty className="px-3 py-6 text-center text-body text-muted">
                No results
              </Command.Empty>
              {Object.entries(groups).map(([group, groupItems]) => (
                <Command.Group
                  key={group}
                  heading={group}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:text-faint [&_[cmdk-group-heading]]:u-caps"
                >
                  {groupItems.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={item.label}
                      onSelect={() => {
                        item.onSelect();
                        setOpen(false);
                      }}
                      className={cn(
                        "flex h-9 cursor-[var(--cursor-control)] items-center justify-between rounded-control px-3 text-body text-foreground outline-none",
                        "data-[selected=true]:bg-surface-inset",
                      )}
                    >
                      <span>{item.label}</span>
                      {item.shortcut ? (
                        <span className="text-meta text-muted">
                          {item.shortcut}
                        </span>
                      ) : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CommandMenuHint({ children }: { children?: ReactNode }) {
  return (
    <p className="text-meta text-muted">
      {children ?? (
        <>
          Press{" "}
          <kbd className="rounded-control border border-hairline px-1.5 text-meta">
            ⌘K
          </kbd>{" "}
          for the command menu
        </>
      )}
    </p>
  );
}
