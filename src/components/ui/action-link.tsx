import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  actionClassName,
  type ActionSize,
  type ActionVariant,
} from "./action-styles";

/**
 * A navigation action that carries the same shape as Button, so "View today's
 * plan" and a submit control never look like different species of control.
 */
export function ActionLink({
  variant = "primary",
  size = "default",
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & {
  variant?: ActionVariant;
  size?: ActionSize;
  children: ReactNode;
}) {
  return (
    <Link
      className={cn(
        actionClassName({ variant, size }),
        "cursor-link",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
