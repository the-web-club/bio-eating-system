import type { Placement } from "@floating-ui/react";

/**
 * Derives a CSS transform-origin from Floating UI placement so the panel grows
 * from the corner nearest the Replace control. Required after flip.
 */
export function transformOriginFromPlacement(placement: Placement): string {
  const [side, alignment] = placement.split("-") as [string, string | undefined];

  const vertical =
    side === "top" ? "bottom" : side === "bottom" ? "top" : "center";

  let horizontal = "center";
  if (alignment === "start") horizontal = "left";
  if (alignment === "end") horizontal = "right";
  if (side === "left") horizontal = "right";
  if (side === "right") horizontal = "left";

  if (vertical === "center" && horizontal === "center") {
    return "center center";
  }
  if (vertical === "center") {
    return `${horizontal} center`;
  }
  if (horizontal === "center") {
    return `center ${vertical}`;
  }
  return `${horizontal} ${vertical}`;
}
