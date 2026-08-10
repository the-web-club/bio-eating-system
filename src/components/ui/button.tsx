"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { buttonClassName, type ButtonSize } from "./button-styles";
import {
  actionClassName,
  type ActionVariant,
} from "./action-styles";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>;

export type ButtonProps = NativeButtonProps & {
  variant?: ActionVariant;
  size?: ButtonSize;
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  disabledReason?: string;
  error?: boolean;
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
  error = false,
  onClick,
  title,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isEditorialPrimary = variant === "primary";
  const filled =
    isEditorialPrimary ||
    variant === "confirm" ||
    variant === "danger";

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-invalid={error || undefined}
      title={isDisabled && disabledReason ? disabledReason : title}
      className={cn(
        isEditorialPrimary
          ? buttonClassName({ size, disabled: isDisabled, error })
          : actionClassName({ variant, size }),
        !isEditorialPrimary &&
          "cursor-control disabled:pointer-events-none",
        !isEditorialPrimary &&
          isDisabled &&
          filled &&
          "bg-surface-inset text-disabled",
        !isEditorialPrimary &&
          isDisabled &&
          variant === "secondary" &&
          "border-hairline text-disabled",
        !isEditorialPrimary &&
          isDisabled &&
          variant === "quiet" &&
          "text-disabled",
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      <span
        className={cn(
          "col-start-1 row-start-1 inline-flex items-center gap-s1",
          loading && "invisible",
        )}
      >
        {children}
      </span>
      {loading ? (
        <span
          className="col-start-1 row-start-1 inline-flex items-center gap-s1 opacity-0 [animation:fade-in_1ms_linear_forwards] [animation-delay:var(--loading-threshold)]"
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
