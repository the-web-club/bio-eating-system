"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { THEME_STORAGE_KEY, type Appearance } from "@/lib/theme";
import { IconMoon, IconSun } from "./icons";

/**
 * Compact appearance control. Both themes are designed, so this is a real
 * setting rather than a debug affordance. The class is already applied by the
 * boot script; this reads it after mount to avoid a hydration mismatch.
 */
export function ThemeControl({ className }: { className?: string }) {
  const [appearance, setAppearance] = useState<Appearance | null>(null);

  useEffect(() => {
    setAppearance(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  function select(next: Appearance) {
    setAppearance(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  const options: { value: Appearance; label: string; Icon: typeof IconSun }[] = [
    { value: "light", label: "Light", Icon: IconSun },
    { value: "dark", label: "Dark", Icon: IconMoon },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-pill bg-surface-inset p-0.5",
        className,
      )}
      role="group"
      aria-label="Appearance"
    >
      {options.map(({ value, label, Icon }) => {
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
