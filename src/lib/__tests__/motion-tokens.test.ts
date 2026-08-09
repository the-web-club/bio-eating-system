import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { durationCss, easeCss, loadingThresholdCss, travelCss } from "@/lib/motion";

const css = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

describe("motion tokens CSS sync", () => {
  it("matches duration values from motion.ts", () => {
    expect(css).toContain(`--duration-instant: ${durationCss.instant}`);
    expect(css).toContain(`--duration-press: ${durationCss.press}`);
    expect(css).toContain(`--duration-fast: ${durationCss.fast}`);
    expect(css).toContain(`--duration-exit: ${durationCss.exit}`);
    expect(css).toContain(`--duration-selection: ${durationCss.selection}`);
    expect(css).toContain(`--duration-disclosure: ${durationCss.disclosure}`);
    expect(css).toContain(`--duration-moderate: ${durationCss.moderate}`);
    expect(css).toContain(`--duration-slow: ${durationCss.slow}`);
  });

  it("matches easing curves from motion.ts", () => {
    expect(css).toContain(`--ease-out: ${easeCss.out}`);
    expect(css).toContain(`--ease-in: ${easeCss.in}`);
    expect(css).toContain(`--ease-in-out: ${easeCss.inOut}`);
    expect(css).toContain(`--ease-exit: ${easeCss.exit}`);
    expect(css).toContain(`--ease-state: ${easeCss.state}`);
    expect(css).toContain(`--ease-linear: ${easeCss.linear}`);
  });

  it("keeps the brief's timing bands", () => {
    expect(durationCss.press).toBe("110ms");
    expect(durationCss.fast).toBe("140ms");
    expect(durationCss.selection).toBe("170ms");
    expect(durationCss.disclosure).toBe("200ms");
    expect(durationCss.moderate).toBe("240ms");
  });

  it("matches travel distances from motion.ts", () => {
    expect(css).toContain(`--travel-hair: ${travelCss.hair}`);
    expect(css).toContain(`--travel-close: ${travelCss.close}`);
    expect(css).toContain(`--travel-near: ${travelCss.near}`);
    expect(css).toContain(`--travel-far: ${travelCss.far}`);
  });

  it("matches loading threshold from motion.ts", () => {
    expect(css).toContain(`--loading-threshold: ${loadingThresholdCss}`);
  });
});
