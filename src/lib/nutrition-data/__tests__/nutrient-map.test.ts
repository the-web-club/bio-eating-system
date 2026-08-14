import { describe, expect, it } from "vitest";
import {
  ALL_PHYTONUTRIENT_CODES,
  FLAVONOID_PHYTONUTRIENT_CODES,
  FOUNDATION_PHYTONUTRIENT_CODES,
  mapUsdaNutrientAmount,
  USDA_NUTRIENT_CATALOG,
  USDA_NUTRIENT_ID_TO_CODE,
} from "@/lib/nutrition-data/sources/usda/nutrient-map";

describe("USDA nutrient map", () => {
  it("defines the full nutrient catalog", () => {
    expect(USDA_NUTRIENT_CATALOG).toHaveLength(94);
    expect(FOUNDATION_PHYTONUTRIENT_CODES).toHaveLength(28);
    expect(FLAVONOID_PHYTONUTRIENT_CODES).toHaveLength(29);
    expect(ALL_PHYTONUTRIENT_CODES).toHaveLength(57);
  });

  it("maps expanded Foundation nutrient ids", () => {
    expect(USDA_NUTRIENT_ID_TO_CODE[1258]).toBe("saturated_fat");
    expect(USDA_NUTRIENT_ID_TO_CODE[1063]).toBe("sugar");
    expect(USDA_NUTRIENT_ID_TO_CODE[1009]).toBe("starch");
    expect(USDA_NUTRIENT_ID_TO_CODE[1107]).toBe("beta_carotene");
    expect(USDA_NUTRIENT_ID_TO_CODE[1108]).toBe("carotene_alpha");
    expect(USDA_NUTRIENT_ID_TO_CODE[1122]).toBe("lycopene");
    expect(USDA_NUTRIENT_ID_TO_CODE[1123]).toBe("lutein_zeaxanthin");
    expect(USDA_NUTRIENT_ID_TO_CODE[1198]).toBe("betaine");
    expect(USDA_NUTRIENT_ID_TO_CODE[1298]).toBe("phytosterols_other");
    expect(USDA_NUTRIENT_ID_TO_CODE[1109]).toBe("vitamin_e");
    expect(USDA_NUTRIENT_ID_TO_CODE[1180]).toBe("choline");
  });

  it("returns mapped amounts for known ids", () => {
    expect(mapUsdaNutrientAmount(1166, 0.4)).toEqual({ code: "riboflavin", amount: 0.4 });
    expect(mapUsdaNutrientAmount(1100, 12)).toEqual({ code: "iodine", amount: 12 });
    expect(mapUsdaNutrientAmount(9999, 1)).toBeNull();
  });
});
