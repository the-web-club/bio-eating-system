import { cn } from "@/lib/cn";

export type ButtonSize = "default" | "compact";

const BUTTON_SIZE: Record<ButtonSize, string> = {
  default: "min-h-11 px-4",
  compact: "min-h-9 px-3",
};

/** Editorial primary control: solid ink fill, control type role, seven states. */
export function buttonClassName({
  size = "default",
  disabled = false,
  error = false,
  className,
}: {
  size?: ButtonSize;
  disabled?: boolean;
  error?: boolean;
  className?: string;
} = {}) {
  return cn(
    "relative inline-grid place-items-center rounded-control text-control font-medium",
    "transition-[color,background-color,border-color,transform] duration-fast ease-state",
    "cursor-control",
    "hover:-translate-y-px active:translate-y-px",
    BUTTON_SIZE[size],
    disabled
      ? "pointer-events-none bg-surface-inset text-disabled"
      : error
        ? "bg-foreground text-on-fill outline outline-danger outline-offset-2"
        : "bg-foreground text-on-fill hover:bg-soft",
    className,
  );
}
