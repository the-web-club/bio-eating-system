"use client";

import { useState, type ReactNode } from "react";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const LEVELS = [
  { id: "flat", label: "flat" },
  { id: "raised", label: "raised" },
  { id: "sunken", label: "sunken" },
  { id: "panel", label: "panel" },
  { id: "modal", label: "modal" },
] as const;

function DemoTile({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-s2", className)}>
      <p className="text-label text-faint">{title}</p>
      {children}
    </div>
  );
}

export function SurfacesDemo() {
  const [forceReduced, setForceReduced] = useState(false);
  const [railScrolled, setRailScrolled] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  return (
    <div className={forceReduced ? "force-reduced-motion" : undefined}>
      <section className="space-y-s4 border-b border-hairline pb-s5">
        <h2 className="text-body-lg font-semibold text-foreground">Controls</h2>
        <label className="flex w-fit cursor-control items-center gap-s2 text-body text-muted">
          <input
            type="checkbox"
            checked={forceReduced}
            onChange={(e) => setForceReduced(e.target.checked)}
            className="size-4 accent-accent"
          />
          Force reduced motion
        </label>
      </section>

      <section className="mt-s5 space-y-s4">
        <h2 className="text-body-lg font-semibold text-foreground">Levels</h2>
        <div className="grid gap-s4 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map(({ id, label }) => (
            <DemoTile key={id} title={label}>
              <Surface level={id} className="p-s4">
                <p className="text-body text-foreground">Resting {label}</p>
                <p className="mt-s1 text-meta text-muted">
                  bg token + surfaces.css class
                </p>
              </Surface>
            </DemoTile>
          ))}
        </div>
      </section>

      <section className="mt-s6 space-y-s4">
        <h2 className="text-body-lg font-semibold text-foreground">
          Interactive raised
        </h2>
        <p className="text-meta text-muted">
          Tab to the surface, hover for lift. Focus uses the global outline with
          3px offset.
        </p>
        <Surface
          interactive
          className="max-w-md p-s4"
          onClick={() => undefined}
        >
          <p className="text-body text-foreground">Interactive card</p>
          <p className="mt-s1 text-meta text-muted">role=button, tabIndex=0</p>
        </Surface>
      </section>

      <section className="mt-s6 space-y-s4">
        <h2 className="text-body-lg font-semibold text-foreground">
          Delegates focus
        </h2>
        <p className="text-meta text-muted">
          Hover lift on the row; Tab stops on the nested control only.
        </p>
        <Surface interactive delegatesFocus className="max-w-md p-s4">
          <div className="flex items-center justify-between gap-s4">
            <p className="text-body text-foreground">Meal row with action</p>
            <Button size="compact" variant="quiet">
              Replace
            </Button>
          </div>
        </Surface>
      </section>

      <section className="mt-s6 space-y-s4">
        <h2 className="text-body-lg font-semibold text-foreground">
          Meal card variants
        </h2>
        <div className="meal-stack max-w-lg">
          <Surface
            interactive
            delegatesFocus
            className="meal-card"
          >
            <p className="text-label text-muted">Breakfast</p>
            <p className="mt-s1 text-body-lg text-foreground">Oats with berries</p>
          </Surface>
          <Surface
            interactive
            delegatesFocus
            className="meal-card meal-card--optional"
          >
            <p className="text-label text-faint">Optional</p>
            <p className="mt-s1 text-body-lg text-foreground">Protein shake</p>
          </Surface>
          <Surface
            interactive
            delegatesFocus
            className="meal-card meal-card--done bg-surface-inset"
          >
            <p className="text-label text-faint">Lunch</p>
            <p className="mt-s1 text-body-lg text-muted">Completed</p>
          </Surface>
        </div>
      </section>

      <section className="mt-s6 space-y-s4">
        <h2 className="text-body-lg font-semibold text-foreground">
          Scroll rails
        </h2>
        <div className="grid gap-s4 md:grid-cols-2">
          <DemoTile title="surface-rail">
            <label className="mb-s2 flex w-fit cursor-control items-center gap-s2 text-meta text-muted">
              <input
                type="checkbox"
                checked={railScrolled}
                onChange={(e) => setRailScrolled(e.target.checked)}
                className="size-4 accent-accent"
              />
              data-scrolled
            </label>
            <div
              className="surface-rail h-24 rounded-surface border border-hairline bg-surface-canvas px-s4 py-s3"
              data-scrolled={railScrolled ? "true" : undefined}
            >
              <p className="text-meta text-muted">Sidebar edge</p>
            </div>
          </DemoTile>
          <DemoTile title="surface-header">
            <label className="mb-s2 flex w-fit cursor-control items-center gap-s2 text-meta text-muted">
              <input
                type="checkbox"
                checked={headerScrolled}
                onChange={(e) => setHeaderScrolled(e.target.checked)}
                className="size-4 accent-accent"
              />
              data-scrolled
            </label>
            <div
              className="surface-header rounded-surface border border-hairline px-s4 py-s3"
              data-scrolled={headerScrolled ? "true" : undefined}
            >
              <p className="text-meta text-muted">Sticky header edge</p>
            </div>
          </DemoTile>
        </div>
      </section>

      <section className="mt-s6 space-y-s4">
        <h2 className="text-body-lg font-semibold text-foreground">
          Panel and modal stack
        </h2>
        <div className="relative max-w-lg rounded-surface bg-surface-canvas p-s6">
          <Surface level="panel" className="relative z-10 p-s4">
            <p className="text-body text-foreground">Floating panel</p>
          </Surface>
          <Surface level="modal" className="relative z-20 mt-s4 p-s4">
            <p className="text-body text-foreground">Modal surface</p>
          </Surface>
        </div>
      </section>
    </div>
  );
}
