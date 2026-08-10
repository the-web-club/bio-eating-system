import Link from "next/link";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ghostLinkClassName({
  active = false,
  className,
}: {
  active?: boolean;
  className?: string;
} = {}) {
  return cn(
    "cursor-link bg-transparent p-0 text-control text-muted no-underline underline-offset-4",
    "transition-colors duration-fast ease-standard",
    "hover:text-foreground hover:underline hover:decoration-foreground",
    "focus-visible:text-foreground focus-visible:underline focus-visible:decoration-foreground",
    active && "text-foreground underline decoration-foreground",
    className,
  );
}

export function GhostLink({
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { children: ReactNode }) {
  return (
    <Link className={ghostLinkClassName({ className })} {...rest}>
      {children}
    </Link>
  );
}

export const GhostLinkButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & { active?: boolean }
>(function GhostLinkButton({ children, className, active, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={ghostLinkClassName({ active, className })}
      {...props}
    >
      {children}
    </button>
  );
});
