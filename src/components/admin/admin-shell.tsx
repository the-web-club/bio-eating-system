"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BrandSignature } from "@/components/portal/brand-signature";
import { IconAccount, IconPrograms, IconToday, IconWeek } from "@/components/portal/icons";
import { PageTransition } from "@/components/portal/page-transition";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Overview", icon: IconToday },
  { href: "/admin/people", label: "People", icon: IconAccount },
  { href: "/admin/activity", label: "Activity", icon: IconWeek },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  title,
  staffEmail,
  children,
}: {
  title: string;
  staffEmail: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-surface-canvas text-foreground">
      <div className="flex">
        <aside className="sticky top-0 hidden h-dvh w-rail shrink-0 flex-col border-r border-hairline lg:flex">
          <div className="px-s4 pb-s6 pt-s6">
            <BrandSignature href="/admin" />
            <p className="mt-s4 border-t border-hairline pt-s4 text-label text-faint u-caps">
              Staff
            </p>
            <p className="mt-s1 truncate text-meta text-muted">{staffEmail}</p>
          </div>

          <nav aria-label="Staff" className="flex-1 px-s1">
            <ul>
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex min-h-11 items-center gap-s2 rounded-control py-s2 pl-4 pr-s2 text-body",
                        "transition-colors [transition-duration:var(--duration-fast)]",
                        active
                          ? "font-medium text-foreground"
                          : "text-muted hover:bg-surface-inset hover:text-foreground",
                      )}
                    >
                      {active ? (
                        <span
                          className="absolute inset-y-1.5 left-0 w-0.5 rounded-control bg-accent"
                          aria-hidden
                        />
                      ) : null}
                      <Icon
                        className={cn("size-4 shrink-0", active ? "text-soft" : "text-faint")}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-hairline px-s1 py-s2">
            <Link
              href="/portal"
              className="flex min-h-11 items-center gap-s2 rounded-control py-s2 pl-4 pr-s2 text-body text-muted hover:bg-surface-inset hover:text-foreground"
            >
              <IconPrograms className="size-4 shrink-0 text-faint" />
              Open portal
            </Link>
          </div>
        </aside>

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-s4 border-b border-hairline px-gutter py-s2 lg:hidden">
            <BrandSignature href="/admin" size="compact" />
            <p className="truncate text-meta text-muted">{staffEmail}</p>
          </header>
          <nav
            aria-label="Staff"
            className="flex gap-s1 overflow-x-auto border-b border-hairline px-gutter py-s2 lg:hidden"
          >
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-control px-s2 py-s2 text-meta",
                    active
                      ? "bg-surface-selected font-medium text-foreground"
                      : "text-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/portal"
              className="shrink-0 rounded-control px-s2 py-s2 text-meta text-muted"
            >
              Portal
            </Link>
          </nav>
          <main aria-label={title} className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
