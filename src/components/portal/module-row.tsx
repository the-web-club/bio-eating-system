"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconArrowRight, IconCheck, IconLock } from "./icons";

/**
 * Module states are read from the composition, not from a badge on every row.
 * Included rows are ordinary interactive rows. Locked rows keep full text
 * contrast and name their unlock action. Upcoming rows carry no affordance.
 */
export type ModuleState = "included" | "locked" | "soon" | "complete";

export function ModuleRows({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("divide-y divide-hairline border-t border-hairline", className)}>
      {children}
    </ul>
  );
}

const ROW = "group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 py-4";

function Body({
  title,
  description,
  hint,
  state,
}: {
  title: string;
  description: string;
  hint?: string;
  state: ModuleState;
}) {
  return (
    <>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-title text-foreground">
          {state === "locked" ? (
            <IconLock className="size-4 shrink-0 text-faint" />
          ) : null}
          {state === "complete" ? (
            <IconCheck className="size-4 shrink-0 text-confirm" />
          ) : null}
          {title}
        </p>
        <p className="mt-1 measure-narrow text-body text-muted">{description}</p>
      </div>
      <div className="flex items-center gap-3 justify-self-end pt-0.5">
        {hint ? (
          <span
            className={cn(
              "hidden text-small sm:inline",
              state === "soon" ? "text-faint" : "text-muted",
            )}
          >
            {hint}
          </span>
        ) : null}
        {state !== "soon" ? (
          <IconArrowRight
            className="size-4 shrink-0 text-faint transition-colors [transition-duration:var(--duration-fast)] group-hover:text-foreground"
            aria-hidden
          />
        ) : null}
      </div>
    </>
  );
}

export function ModuleRow({
  title,
  description,
  state,
  hint,
  href,
  onUnlock,
}: {
  title: string;
  description: string;
  state: ModuleState;
  /** Quiet metadata or the next action, e.g. "Ready to start". */
  hint?: string;
  href?: string;
  /** Locked rows open the upgrade detail rather than the module. */
  onUnlock?: () => void;
}) {
  const content = (
    <Body title={title} description={description} hint={hint} state={state} />
  );

  const interactiveClass =
    "-mx-3 rounded-control px-3 transition-colors [transition-duration:var(--duration-fast)] hover:bg-surface-inset";

  if (state === "locked" && onUnlock) {
    return (
      <li>
        <button
          type="button"
          onClick={onUnlock}
          className={cn(
            ROW,
            interactiveClass,
            "w-full cursor-[var(--cursor-control)] text-left",
          )}
        >
          {content}
        </button>
      </li>
    );
  }

  if (href && state !== "soon") {
    return (
      <li>
        <Link href={href} className={cn(ROW, interactiveClass)}>
          {content}
        </Link>
      </li>
    );
  }

  return <li className={ROW}>{content}</li>;
}
