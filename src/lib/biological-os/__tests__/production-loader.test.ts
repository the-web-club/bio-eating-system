import { describe, expect, it } from "vitest";
import {
  APPROVED_FOOD_SOURCE,
  APPROVED_FOOD_SOURCE_VERSION,
  APPROVED_REQUIREMENT_SET_VERSION,
} from "@/lib/biological-os/constants";
import {
  buildProductionEngineDataset,
  mapDbFoodToEngineCandidate,
} from "@/lib/biological-os/production-loader";

const approvedRequirementSet = {
  version: APPROVED_REQUIREMENT_SET_VERSION,
  devOnly: false,
  reviewStatus: "APPROVED" as const,
  source: "EFSA",
  sourceVersion: "2017-e15121",
  sourceUrl: "https://www.efsa.europa.eu/",
  termsUrl: "https://www.efsa.europa.eu/en/legalnotice",
  jurisdiction: "EU" as const,
  requirements: [
    {
      nutrient: { code: "protein" },
      ageMin: 18,
      ageMax: 49,
      sex: "female" as const,
      referenceType: "PRI",
      value: 48.6,
      valueMin: null,
      valueMax: null,
      unit: "g" as const,
      reviewStatus: "APPROVED" as const,
      devOnly: false,
    },
  ],
};

describe("production loader", () => {
  it("maps approved db foods into engine candidates", () => {
    const candidate = mapDbFoodToEngineCandidate({
      id: "food-1",
      externalId: "fdc-748967",
      name: "Eggs, whole",
      displayName: "Eggs, whole",
      source: APPROVED_FOOD_SOURCE,
      sourceVersion: APPROVED_FOOD_SOURCE_VERSION,
      devOnly: false,
      biologicalCategory: { slug: "eggs" },
      nutrients: [
        {
          amount: 12.6,
          unit: "g",
          perAmountG: 100,
          source: APPROVED_FOOD_SOURCE,
          sourceVersion: APPROVED_FOOD_SOURCE_VERSION,
          nutrient: { code: "protein" },
        },
      ],
      allergens: [{ allergen: "egg" }],
      categoryCandidates: [],
    });

    expect(candidate).toMatchObject({
      foodId: "food-1",
      biologicalCategory: "eggs",
      allergens: ["egg"],
      devOnly: false,
    });
  });

  it("rejects dev-only foods", () => {
    const candidate = mapDbFoodToEngineCandidate({
      id: "food-dev",
      externalId: "fixture-dev",
      name: "Fixture",
      displayName: null,
      source: APPROVED_FOOD_SOURCE,
      sourceVersion: APPROVED_FOOD_SOURCE_VERSION,
      devOnly: true,
      biologicalCategory: { slug: "eggs" },
      nutrients: [],
      allergens: [],
      categoryCandidates: [],
    });

    expect(candidate).toBeNull();
  });

  it("builds a category candidate map from approved foods", () => {
    const dataset = buildProductionEngineDataset({
      foods: [
        {
          id: "food-1",
          externalId: "fdc-748967",
          name: "Eggs, whole",
          displayName: null,
          source: APPROVED_FOOD_SOURCE,
          sourceVersion: APPROVED_FOOD_SOURCE_VERSION,
          devOnly: false,
          biologicalCategory: { slug: "eggs" },
          nutrients: [
            {
              amount: 12.6,
              unit: "g",
              perAmountG: 100,
              source: APPROVED_FOOD_SOURCE,
              sourceVersion: APPROVED_FOOD_SOURCE_VERSION,
              nutrient: { code: "protein" },
            },
          ],
          allergens: [],
          categoryCandidates: [],
        },
      ],
      requirementSet: approvedRequirementSet,
    });

    expect(dataset.requirementRows).toHaveLength(1);
    expect(dataset.categoryCandidates.eggs).toHaveLength(1);
  });
});
