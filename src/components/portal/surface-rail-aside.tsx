"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSurfaceScrolled } from "@/hooks/use-surface-scrolled";

export function SurfaceRailAside({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scrolled = useSurfaceScrolled();

  return (
    <div
      className={cn(
        "surface-rail surface-rail--leading min-w-0 space-y-s5 border-t border-hairline pt-s5 md:border-t-0 md:border-l md:pl-s5 md:pt-0",
        className,
      )}
      data-scrolled={scrolled ? "true" : undefined}
    >
      {children}
    </div>
  );
}
