/**
 * Email palette. Mail clients ignore CSS custom properties, so these are the
 * resolved light-theme values from globals.css / docs/brand.md. One constant
 * for every template - same canvas, ink, mineral accent and button radius.
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
  /** --mineral-700 - primary action fill */
  accentFill: "#2c5a86",
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

/** System stack closest to Inter in clients that lack webfonts. */
export const EMAIL_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
