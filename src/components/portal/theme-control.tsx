"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { THEME_STORAGE_KEY, type Appearance } from "@/lib/theme";
import { IconMoon, IconSun } from "./icons";

/**
 * The applied theme is external state: the boot script sets the class on
 * <html> before React runs. Reading it through a store keeps the control in
 * sync with the DOM without a render-triggering effect.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Appearance {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

const OPTIONS: { value: Appearance; label: string; Icon: typeof IconSun }[] = [
  { value: "light", label: "Light", Icon: IconSun },
  { value: "dark", label: "Dark", Icon: IconMoon },
];

/**
 * Compact appearance control. Both themes are designed, so this is a real
 * setting rather than a debug affordance.
 */
export function ThemeControl({ className }: { className?: string }) {
  const appearance = useSyncExternalStore(subscribe, getSnapshot, () => null);

  function select(next: Appearance) {
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-pill bg-surface-inset p-0.5",
        className,
      )}
      role="group"
      aria-label="Appearance"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = appearance === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => select(value)}
            title={label}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-pill",
              "cursor-[var(--cursor-control)] transition-colors [transition-duration:var(--duration-selection)] [transition-timing-function:var(--ease-state)]",
              selected ? "bg-surface text-foreground" : "text-faint hover:text-muted",
            )}
          >
            <Icon className="size-4" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
