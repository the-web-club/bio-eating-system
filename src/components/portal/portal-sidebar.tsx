"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { selectionTransition } from "@/lib/motion";
import { BrandSignature } from "./brand-signature";
import { getAccountNav, getPrimaryNav, isNavItemActive } from "./nav-config";
import type { NavItem } from "./nav-config";
import { ProgramIdentity } from "./program-identity";

function RailLink({
  item,
  active,
  indicatorId,
  reduceMotion,
}: {
  item: NavItem;
  active: boolean;
  indicatorId: string;
  reduceMotion: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center gap-2.5 rounded-control py-2 pl-4 pr-3 text-body",
        "transition-colors [transition-duration:var(--duration-fast)]",
        active
          ? "font-medium text-foreground"
          : "text-muted hover:bg-surface-inset hover:text-foreground",
      )}
    >
      {active ? (
        <motion.span
          layoutId={reduceMotion ? undefined : indicatorId}
          transition={selectionTransition(reduceMotion)}
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-pill bg-accent"
          aria-hidden
        />
      ) : null}
      <Icon className={cn("size-4 shrink-0", active ? "text-soft" : "text-faint")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/**
 * Narrow, stable product rail. The active destination is marked by a slim
 * accent rail and typographic weight — no large rounded block, no loud icons.
 */
export function PortalSidebar({
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
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const primary = getPrimaryNav(basePath);
  const account = getAccountNav(basePath);
  const root = basePath.replace(/\/$/, "") || "/portal";
  const indicatorId = `nav-rail-${root}`;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-dvh w-rail shrink-0 flex-col border-r border-hairline bg-surface-canvas lg:flex">
      <div className="px-5 pb-6 pt-8">
        <BrandSignature href={root} />
        <ProgramIdentity
          className="mt-6 border-t border-hairline pt-4"
          programLabel={programLabel}
          weekLabel={weekLabel}
          rotationPosition={rotationPosition}
          authoredWeeks={authoredWeeks}
        />
      </div>

      <nav aria-label="Primary" className="flex-1 px-2">
        <ul>
          {primary.map((item) => (
            <li key={item.href}>
              <RailLink
                item={item}
                active={isNavItemActive(pathname, item.href, basePath)}
                indicatorId={indicatorId}
                reduceMotion={reduceMotion}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-hairline px-2 py-3">
        <RailLink
          item={account}
          active={isNavItemActive(pathname, account.href, basePath)}
          indicatorId={indicatorId}
          reduceMotion={reduceMotion}
        />
      </div>
    </aside>
  );
}
