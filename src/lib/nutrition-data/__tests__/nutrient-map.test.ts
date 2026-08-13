import { describe, expect, it } from "vitest";
import {
  mapUsdaNutrientAmount,
  USDA_NUTRIENT_CATALOG,
  USDA_NUTRIENT_ID_TO_CODE,
} from "@/lib/nutrition-data/sources/usda/nutrient-map";

describe("USDA nutrient map", () => {
  it("defines the full micronutrient catalog", () => {
    expect(USDA_NUTRIENT_CATALOG).toHaveLength(34);
    expect(USDA_NUTRIENT_CATALOG.map((row) => row.code)).toEqual([
      "energy_kcal",
      "protein",
      "fat",
      "carbohydrate",
      "fiber",
      "omega3",
      "calcium",
      "phosphorus",
      "magnesium",
      "sodium",
      "potassium",
      "iron",
      "zinc",
      "copper",
      "manganese",
      "selenium",
      "iodine",
      "molybdenum",
      "fluoride",
      "chromium",
      "vitamin_a",
      "vitamin_c",
      "vitamin_d",
      "vitamin_e",
      "vitamin_k",
      "thiamin",
      "riboflavin",
      "niacin",
      "vitamin_b6",
      "folate",
      "vitamin_b12",
      "biotin",
      "pantothenic_acid",
      "choline",
    ]);
  });

  it("maps expanded Foundation nutrient ids", () => {
    expect(USDA_NUTRIENT_ID_TO_CODE[1109]).toBe("vitamin_e");
    expect(USDA_NUTRIENT_ID_TO_CODE[1165]).toBe("thiamin");
    expect(USDA_NUTRIENT_ID_TO_CODE[1091]).toBe("phosphorus");
    expect(USDA_NUTRIENT_ID_TO_CODE[1103]).toBe("selenium");
    expect(USDA_NUTRIENT_ID_TO_CODE[1180]).toBe("choline");
  });

  it("returns mapped amounts for known ids", () => {
    expect(mapUsdaNutrientAmount(1166, 0.4)).toEqual({ code: "riboflavin", amount: 0.4 });
    expect(mapUsdaNutrientAmount(1100, 12)).toEqual({ code: "iodine", amount: 12 });
    expect(mapUsdaNutrientAmount(9999, 1)).toBeNull();
  });
});
