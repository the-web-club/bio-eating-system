import Link from "next/link";
import { cn } from "@/lib/cn";

export const BRAND_NAME = "Well with Katarina";

/**
 * The wordmark. Painted through an alpha mask so the artwork's indigo can be
 * replaced by an ink that survives dark mode - see .brand-mark in globals.css.
 * The height is set here; the artwork's ratio supplies the width, so the box is
 * reserved before the mask loads and nothing shifts.
 *
 * rail    product rail and the mobile menu
 * compact single-line bar
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
  const mark = (
    <>
      <span className={cn("brand-mark", size === "rail" ? "h-16" : "h-9")} aria-hidden />
      <span className="sr-only">{BRAND_NAME}</span>
    </>
  );

  if (!href) {
    return <span className={cn("block", className)}>{mark}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        "block w-fit cursor-[var(--cursor-link)] rounded-control transition-opacity [transition-duration:var(--duration-fast)] hover:opacity-70",
        className,
      )}
    >
      {mark}
    </Link>
  );
}
