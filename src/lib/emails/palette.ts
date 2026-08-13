/**
 * Email palette. Mail clients ignore CSS custom properties, so these are the
 * resolved light-theme values from globals.css / docs/brand.md. One constant
 * for every template - same canvas, ink, editorial accent and button radius.
 */
export const EMAIL_PALETTE = {
  /** --paper-050 */
  canvas: "#fbfaf8",
  /** --paper-000 */
  surface: "#ffffff",
  /** --ink-900 */
  foreground: "#1b1a18",
  /** --ink-700 */
  soft: "#3a3833",
  /** --ink-500 */
  muted: "#6a665e",
  /** --ink-400 */
  faint: "#8f8a80",
  /** --stone-200 */
  hairline: "#eae6df",
  /** --editorial-ink-950 - primary action fill */
  accentFill: "#2a2248",
  /** --paper-000 on accent */
  onAccent: "#ffffff",
  /** --indigo-900 - wordmark ink when the PNG cannot load */
  brandMark: "#1a0e64",
} as const;

export const EMAIL_RADIUS = {
  /** --radius-button */
  button: "9px",
  /** --radius-panel */
  panel: "11px",
} as const;

/** Resolved from Button default size in action-styles.ts (min-h-11, px-4, text-body). */
export const EMAIL_BUTTON = {
  /** min-h-11 */
  height: "44px",
  /** px-4 */
  paddingX: "16px",
  /** (height - fontSize) / 2 */
  paddingY: "15px",
  /** text-body */
  fontSize: "14px",
  /** font-medium */
  fontWeight: "500",
} as const;

/** System stack closest to Inter in clients that lack webfonts. */
export const EMAIL_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
