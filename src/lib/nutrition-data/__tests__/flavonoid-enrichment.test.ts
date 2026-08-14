import { describe, expect, it, vi, afterEach } from "vitest";
import {
  flavonoidAmountsForFdcId,
  resetFlavonoidEnrichmentCacheForTests,
} from "@/lib/nutrition-data/sources/usda/flavonoid-enrichment";
import { mapFnddsFlavonoidNutrientCode } from "@/lib/nutrition-data/sources/usda/flavonoid-nutrients";

describe("USDA flavonoid enrichment", () => {
  afterEach(() => {
    resetFlavonoidEnrichmentCacheForTests();
  });

  it("maps FNDDS nutrient codes to internal flavonoid codes", () => {
    expect(mapFnddsFlavonoidNutrientCode(789, 1.2)).toEqual({
      code: "flavonoid_quercetin",
      amount: 1.2,
    });
    expect(mapFnddsFlavonoidNutrientCode(749, 0)).toBeNull();
    expect(mapFnddsFlavonoidNutrientCode(999, 1)).toBeNull();
  });

  it("returns no flavonoid amounts when enrichment file has no records", () => {
    expect(flavonoidAmountsForFdcId(321358)).toEqual({});
  });
});
