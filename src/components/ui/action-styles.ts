import { cn } from "@/lib/cn";

/**
 * Shared shape for actions so a button and a link that do the same job look
 * identical. Radius is modest and one of fill or border carries the control,
 * never a fill plus a shadow, and never a pill for a primary action.
 */
export type ActionVariant =
  | "primary"
  | "secondary"
  | "quiet"
  | "feature"
  | "confirm"
  | "danger";
export type ActionSize = "default" | "compact";

export const ACTION_VARIANT: Record<ActionVariant, string> = {
  primary: "bg-foreground text-on-fill hover:bg-soft",
  secondary:
    "border border-hairline-strong text-foreground hover:bg-surface-inset",
  quiet: "text-muted hover:bg-surface-inset hover:text-foreground",
  /** Inverted, for use inside a high-contrast feature panel. */
  feature: "bg-feature-fill text-on-feature-fill hover:opacity-90",
  confirm: "bg-confirm-fill text-on-fill hover:opacity-90",
  danger: "bg-danger-fill text-on-fill hover:opacity-90",
};

export const ACTION_SIZE: Record<ActionSize, string> = {
  default: "min-h-11 rounded-control px-4 text-body",
  compact: "min-h-9 rounded-control px-3 text-meta",
};

export function actionClassName({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ActionVariant;
  size?: ActionSize;
  className?: string;
} = {}) {
  return cn(
    "relative inline-grid place-items-center font-medium",
    "transition-[color,background-color,border-color,transform] duration-fast ease-state",
    "hover:-translate-y-px active:translate-y-0",
    ACTION_SIZE[size],
    ACTION_VARIANT[variant],
    className,
  );
}
