import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Reads the real token layer so the palette cannot drift out of WCAG AA. Values
 * are resolved through the var() chain exactly as the browser would, and
 * translucent tokens are composited over the surface they sit on.
 */

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

type Rgb = { r: number; g: number; b: number };

function parseBlock(selector: string): Map<string, string> {
  const vars = new Map<string, string>();
  const pattern = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, "g");
  for (const match of css.matchAll(pattern)) {
    for (const line of match[1].split("\n")) {
      const declaration = line.split("/*")[0];
      const [rawName, ...rest] = declaration.split(":");
      const name = rawName.trim();
      if (!name.startsWith("--") || rest.length === 0) continue;
      vars.set(name, rest.join(":").replace(";", "").trim());
    }
  }
  return vars;
}

const rootVars = parseBlock(":root");
const darkOverrides = parseBlock("\\.dark");

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function lookup(name: string, dark: boolean): string {
  const value = (dark ? darkOverrides.get(name) : undefined) ?? rootVars.get(name);
  if (!value) throw new Error(`Token ${name} is not defined`);
  return value;
}

/** Resolves a token to a colour, compositing alpha over `over` when present. */
function resolve(name: string, dark: boolean, over?: Rgb): Rgb {
  let value = lookup(name, dark);

  let guard = 0;
  while (value.startsWith("var(")) {
    value = lookup(value.slice(4, value.indexOf(")")).trim(), dark);
    if (++guard > 10) throw new Error(`Cyclic token reference at ${name}`);
  }

  if (value.startsWith("#")) return hexToRgb(value);

  const rgbMatch = value.match(
    /rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+))?\s*\)/,
  );
  if (!rgbMatch) throw new Error(`Cannot read colour from ${name}: ${value}`);

  const [, r, g, b, alpha] = rgbMatch;
  const colour = { r: Number(r), g: Number(g), b: Number(b) };
  if (alpha == null) return colour;
  if (!over) throw new Error(`${name} is translucent and needs a backdrop`);

  const a = Number(alpha);
  return {
    r: colour.r * a + over.r * (1 - a),
    g: colour.g * a + over.g * (1 - a),
    b: colour.b * a + over.b * (1 - a),
  };
}

function channel(value: number) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance({ r, g, b }: Rgb) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgb, b: Rgb) {
  const lighter = Math.max(luminance(a), luminance(b));
  const darker = Math.min(luminance(a), luminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

/** 4.5:1 for body text, 3:1 for large text and non-text UI. */
const TEXT_ON_SURFACE: [string, number][] = [
  ["--foreground", 4.5],
  ["--foreground-soft", 4.5],
  ["--foreground-muted", 4.5],
  ["--accent-text", 4.5],
  /* The mark is painted, not typed, but it carries the product name. */
  ["--brand-mark", 4.5],
  ["--confirm", 4.5],
  ["--danger", 4.5],
  ["--status-neutral-text", 4.5],
  ["--status-info-text", 4.5],
  ["--status-success-text", 4.5],
  ["--status-danger-text", 4.5],
  ["--foreground-faint", 3],
  ["--foreground-disabled", 3],
  ["--accent", 3],
  ["--focus-ring", 3],
  ["--confirm-icon", 3],
  ["--danger-icon", 3],
  ["--status-info-mark", 3],
  ["--status-success-mark", 3],
  ["--status-danger-mark", 3],
];

const SURFACES = ["--surface-canvas", "--surface", "--surface-inset"];

describe.each([
  { name: "light", dark: false },
  { name: "dark", dark: true },
])("$name palette", ({ dark }) => {
  it.each(SURFACES)("text tokens clear their minimum on %s", (surface) => {
    const background = resolve(surface, dark);
    for (const [token, minimum] of TEXT_ON_SURFACE) {
      const ratio = contrast(resolve(token, dark, background), background);
      expect
        .soft(
          ratio,
          `${token} on ${surface} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`,
        )
        .toBeGreaterThanOrEqual(minimum);
    }
  });

  it("filled actions clear 4.5:1 against their own fill", () => {
    const pairs: [string, string][] = [
      ["--on-accent", "--accent-fill"],
      ["--on-fill", "--confirm-fill"],
      ["--on-fill", "--danger-fill"],
      ["--on-feature", "--surface-feature"],
      ["--on-feature-fill", "--feature-fill"],
    ];
    for (const [fg, bg] of pairs) {
      const background = resolve(bg, dark);
      const ratio = contrast(resolve(fg, dark, background), background);
      expect
        .soft(ratio, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`)
        .toBeGreaterThanOrEqual(4.5);
    }
  });

  it("supporting text on the feature panel clears 4.5:1", () => {
    const background = resolve("--surface-feature", dark);
    const ratio = contrast(resolve("--on-feature-muted", dark, background), background);
    expect(ratio, `--on-feature-muted is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("selected and accent-subtle surfaces keep body text readable", () => {
    for (const surface of ["--surface-selected", "--accent-subtle"]) {
      const background = resolve(surface, dark);
      const ratio = contrast(resolve("--foreground", dark, background), background);
      expect(ratio, `--foreground on ${surface} is ${ratio.toFixed(2)}:1`)
        .toBeGreaterThanOrEqual(4.5);
    }
  });

  it("hairlines stay visible against the canvas", () => {
    const background = resolve("--surface-canvas", dark);
    const ratio = contrast(resolve("--hairline-strong", dark, background), background);
    expect(ratio, `--hairline-strong is ${ratio.toFixed(2)}:1`).toBeGreaterThan(1.1);
  });
});
