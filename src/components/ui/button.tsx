"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  actionClassName,
  type ActionSize,
  type ActionVariant,
} from "./action-styles";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>;

export type ButtonProps = NativeButtonProps & {
  variant?: ActionVariant;
  size?: ActionSize;
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  disabledReason?: string;
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  disabled,
  children,
  type = "button",
  loading = false,
  loadingLabel = "Working…",
  disabledReason,
  onClick,
  title,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const filled = variant === "primary" || variant === "confirm" || variant === "danger";

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      title={isDisabled && disabledReason ? disabledReason : title}
      className={cn(
        actionClassName({ variant, size }),
        "cursor-[var(--cursor-control)] disabled:pointer-events-none",
        // Disabled drops the fill rather than the text, so the label stays readable.
        isDisabled && filled && "bg-surface-inset text-disabled",
        isDisabled && variant === "secondary" && "border-hairline text-disabled",
        isDisabled && variant === "quiet" && "text-disabled",
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      <span
        className={cn(
          "col-start-1 row-start-1 inline-flex items-center gap-2",
          loading && "invisible",
        )}
      >
        {children}
      </span>
      {loading ? (
        <span
          className="col-start-1 row-start-1 inline-flex items-center gap-2 opacity-0 [animation:fade-in_1ms_linear_forwards] [animation-delay:var(--loading-threshold)]"
          aria-live="polite"
        >
          <span
            className="size-3.5 animate-spin rounded-pill border border-current border-r-transparent"
            aria-hidden
          />
          <span className="sr-only">{loadingLabel}</span>
        </span>
      ) : null}
    </button>
  );
}
