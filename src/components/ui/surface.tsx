import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SurfaceLevel = "flat" | "raised" | "sunken" | "panel" | "modal";

type SurfaceOwnProps = {
  level?: SurfaceLevel;
  /** Hover, active and focus-offset styles from surfaces.css. */
  interactive?: boolean;
  /**
   * Skip tabIndex on the surface when a nested button or link is the focus
   * target. Use on rows that stay interactive for hover but delegate action.
   */
  delegatesFocus?: boolean;
  className?: string;
  children?: ReactNode;
};

type SurfaceProps<T extends ElementType> = SurfaceOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof SurfaceOwnProps | "as">;

const NATIVE_FOCUSABLE = new Set(["a", "button", "summary"]);

const LEVEL_CLASS: Record<
  SurfaceLevel,
  { surface: string[]; interactive: boolean }
> = {
  flat: {
    surface: ["surface", "surface--flat", "bg-surface-canvas"],
    interactive: true,
  },
  raised: {
    surface: ["surface", "bg-surface"],
    interactive: true,
  },
  sunken: {
    surface: ["surface", "surface--sunken", "bg-surface-inset"],
    interactive: true,
  },
  panel: {
    surface: ["surface-panel", "bg-surface"],
    interactive: false,
  },
  modal: {
    surface: ["surface-modal", "bg-surface"],
    interactive: false,
  },
};

function surfaceClassName(level: SurfaceLevel, interactive: boolean) {
  const config = LEVEL_CLASS[level];
  return cn(
    ...config.surface,
    interactive && config.interactive && "surface--interactive",
  );
}

function isNativeFocusableTag(tag: ElementType): boolean {
  return typeof tag === "string" && NATIVE_FOCUSABLE.has(tag);
}

/**
 * Presentational elevation wrapper. Shadow, border and motion come from
 * surfaces.css only. Background roles use existing Tailwind surface tokens.
 */
export function Surface<T extends ElementType = "div">({
  as,
  level = "raised",
  interactive = false,
  delegatesFocus = false,
  className,
  children,
  tabIndex,
  role,
  ...rest
}: SurfaceProps<T>) {
  const Tag = as ?? "div";
  const needsSurfaceFocus =
    interactive &&
    LEVEL_CLASS[level].interactive &&
    !delegatesFocus &&
    !isNativeFocusableTag(Tag) &&
    tabIndex === undefined;

  const resolvedTabIndex = needsSurfaceFocus ? 0 : tabIndex;
  const resolvedRole =
    role ??
    (needsSurfaceFocus && typeof rest.onClick === "function"
      ? "button"
      : undefined);

  return (
    <Tag
      className={cn(surfaceClassName(level, interactive), className)}
      tabIndex={resolvedTabIndex}
      role={resolvedRole}
      {...rest}
    >
      {children}
    </Tag>
  );
}
