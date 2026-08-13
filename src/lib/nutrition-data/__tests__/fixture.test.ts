import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIXTURE_FOOD_SOURCE, FIXTURE_REQUIREMENT_SET_VERSION } from "@/lib/nutrition-data/constants";
import { assertBundleSourceMetadata, countImportRows } from "@/lib/nutrition-data/normalize";
import { parseFoodSourceBundle } from "@/lib/nutrition-data/schema";

const fixturePath = path.join(
  process.cwd(),
  "content/fixtures/food-source-fixture-v1.json",
);

function loadFixture() {
  return parseFoodSourceBundle(JSON.parse(readFileSync(fixturePath, "utf8")));
}

describe("food source fixture", () => {
  it("parses and validates the offline fixture bundle", () => {
    const bundle = loadFixture();
    expect(bundle.source).toBe(FIXTURE_FOOD_SOURCE);
    expect(bundle.devOnly).toBe(true);
    expect(bundle.requirementSet.devOnly).toBe(true);
    expect(bundle.foods.length).toBeGreaterThan(0);
    assertBundleSourceMetadata(bundle);
  });

  it("counts import rows deterministically", () => {
    const bundle = loadFixture();
    const first = countImportRows(bundle);
    const second = countImportRows(bundle);
    expect(first).toBe(second);
    expect(first).toBeGreaterThan(bundle.foods.length);
  });

  it("requires every food nutrient row to reference a declared nutrient code", () => {
    const bundle = loadFixture();
    const codes = new Set(bundle.nutrients.map((row) => row.code));
    for (const food of bundle.foods) {
      for (const nutrient of food.nutrients) {
        expect(codes.has(nutrient.code)).toBe(true);
      }
    }
  });
});
