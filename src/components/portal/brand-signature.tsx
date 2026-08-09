import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Typographic wordmark. One signature, not a stacked label pair: "Well" leads
 * and "with Katarina" signs it. Natural casing, no invented symbol.
 *
 * rail    stacked, for the product rail and the mobile menu
 * compact inline, for a single-line bar
 */
export function BrandSignature({
  href,
  size = "rail",
  className,
}: {
  href?: string;
  size?: "rail" | "compact";
  className?: string;
}) {
  const stacked = size === "rail";

  const mark = stacked ? (
    <span className="block">
      <span className="block text-display text-foreground">Well</span>
      <span className="mt-0.5 block text-small text-muted">with Katarina</span>
    </span>
  ) : (
    <span className="flex items-baseline gap-1.5">
      <span className="text-section text-foreground">Well</span>
      <span className="truncate text-meta text-muted">with Katarina</span>
    </span>
  );

  if (!href) {
    return <span className={className}>{mark}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        "block cursor-[var(--cursor-link)] rounded-control transition-opacity [transition-duration:var(--duration-fast)] hover:opacity-70",
        className,
      )}
    >
      {mark}
    </Link>
  );
}
