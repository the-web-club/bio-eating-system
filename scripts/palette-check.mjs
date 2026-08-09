/**
 * Ad-hoc palette contrast probe. Not part of the build.
 * Run: node scripts/palette-check.mjs
 */

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}
function ch(c) {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function lum(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
function contrast(fg, bg) {
  const a = lum(fg);
  const b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const L = {
  paper: "#ffffff",
  canvas: "#fbfaf8",
  inset: "#f4f2ed",
  stone: "#eae6df",
  ink: "#1b1a18",
  inkSoft: "#3a3833",
  muted: "#6a665e",
  faint: "#8f8a80",
  accent: "#2c5a86",
  accentStrong: "#24486b",
  accentSoft: "#5c86ab",
  accentWash: "#eef2f6",
  feature: "#1b1a18",
  onFeature: "#f7f5f1",
  onFeatureMuted: "#a8a29a",
};

const D = {
  canvas: "#111111",
  surface: "#161615",
  inset: "#1e1d1c",
  stone: "#2a2926",
  ink: "#f4f2ee",
  muted: "#a6a19a",
  faint: "#7d7871",
  accent: "#8fb3d4",
  accentSoft: "#6d97bd",
  accentWash: "#1a2530",
  onAccent: "#111111",
};

const pairs = [
  ["light: ink on canvas", L.ink, L.canvas, 4.5],
  ["light: ink on paper", L.ink, L.paper, 4.5],
  ["light: ink on inset", L.ink, L.inset, 4.5],
  ["light: inkSoft on canvas", L.inkSoft, L.canvas, 4.5],
  ["light: muted on canvas", L.muted, L.canvas, 4.5],
  ["light: muted on paper", L.muted, L.paper, 4.5],
  ["light: muted on inset", L.muted, L.inset, 4.5],
  ["light: faint on canvas (UI only)", L.faint, L.canvas, 3],
  ["light: accent text on canvas", L.accent, L.canvas, 4.5],
  ["light: accent text on paper", L.accent, L.paper, 4.5],
  ["light: accent text on inset", L.accent, L.inset, 4.5],
  ["light: accent text on wash", L.accent, L.accentWash, 4.5],
  ["light: white on accent fill", "#ffffff", L.accent, 4.5],
  ["light: white on accentStrong", "#ffffff", L.accentStrong, 4.5],
  ["light: accentSoft graphic on canvas", L.accentSoft, L.canvas, 3],
  ["light: onFeature on feature", L.onFeature, L.feature, 4.5],
  ["light: onFeatureMuted on feature", L.onFeatureMuted, L.feature, 4.5],
  ["light: accentSoft on feature", L.accentSoft, L.feature, 3],
  ["dark: ink on canvas", D.ink, D.canvas, 4.5],
  ["dark: ink on surface", D.ink, D.surface, 4.5],
  ["dark: ink on inset", D.ink, D.inset, 4.5],
  ["dark: muted on canvas", D.muted, D.canvas, 4.5],
  ["dark: muted on surface", D.muted, D.surface, 4.5],
  ["dark: muted on inset", D.muted, D.inset, 4.5],
  ["dark: faint on canvas (UI only)", D.faint, D.canvas, 3],
  ["dark: accent on canvas", D.accent, D.canvas, 4.5],
  ["dark: accent on surface", D.accent, D.surface, 4.5],
  ["dark: accent on inset", D.accent, D.inset, 4.5],
  ["dark: accent on wash", D.accent, D.accentWash, 4.5],
  ["dark: onAccent on accent fill", D.onAccent, D.accent, 4.5],
  ["dark: accentSoft graphic on canvas", D.accentSoft, D.canvas, 3],
];

let fails = 0;
for (const [label, fg, bg, min] of pairs) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= min;
  if (!ok) fails += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${ratio.toFixed(2)}:1  (min ${min})  ${label}`,
  );
}
console.log(fails === 0 ? "\nAll pairs pass." : `\n${fails} pair(s) fail.`);
