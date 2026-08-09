import { describe, expect, it } from "vitest";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function channel(c: number) {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg: string, bg: string) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const lightBg = "#FFFFFF";
const darkBg = "#0A0A0A";

describe("status contrast", () => {
  it("light text clears 4.5:1 and marks clear 3:1", () => {
    expect(contrast("#A62B21", lightBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#D93B2E", lightBg)).toBeGreaterThanOrEqual(3);
    expect(contrast("#1D6F3F", lightBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#2E9B57", lightBg)).toBeGreaterThanOrEqual(3);
    expect(contrast("#0066CC", lightBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#007AFF", lightBg)).toBeGreaterThanOrEqual(3);
  });

  it("dark text clears 4.5:1 and marks clear 3:1", () => {
    expect(contrast("#E07A72", darkBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FF6B61", darkBg)).toBeGreaterThanOrEqual(3);
    expect(contrast("#5DCAA0", darkBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#6BCB95", darkBg)).toBeGreaterThanOrEqual(3);
    expect(contrast("#8AB4E8", darkBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#6BB3FF", darkBg)).toBeGreaterThanOrEqual(3);
  });
});
