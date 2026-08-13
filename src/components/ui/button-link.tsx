import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { buttonClassName, type ButtonSize } from "./button-styles";

/** Navigation control with the same surface as Button. */
export function ButtonLink({
  size = "default",
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & {
  size?: ButtonSize;
  children: ReactNode;
}) {
  return (
    <Link className={cn(buttonClassName({ size }), className)} {...rest}>
      {children}
    </Link>
  );
}
