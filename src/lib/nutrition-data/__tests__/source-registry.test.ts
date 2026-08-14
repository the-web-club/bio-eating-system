import { describe, expect, it } from "vitest";
import { SOURCE_REGISTRY, productionEligibleSourceKeys } from "@/lib/nutrition-data/source-registry";
import { PRODUCTION_APPROVED_SOURCE_KEYS } from "@/lib/nutrition-data/approved-sources";

describe("source registry", () => {
  it("keeps FooDB and PhytoHub as review-required, not hard rejected", () => {
    const phytohub = SOURCE_REGISTRY.find((row) => row.sourceKey === "phytohub");
    const foodb = SOURCE_REGISTRY.find((row) => row.sourceKey === "foodb");

    expect(phytohub?.licenseStatus).toBe("REVIEW_REQUIRED");
    expect(foodb?.licenseStatus).toBe("REVIEW_REQUIRED");
    expect(phytohub?.productionEligible).toBe(false);
    expect(foodb?.productionEligible).toBe(false);
  });

  it("lists only USDA as production eligible today", () => {
    expect(productionEligibleSourceKeys()).toEqual(["usda-fdc"]);
    expect(PRODUCTION_APPROVED_SOURCE_KEYS).toEqual(["usda-fdc"]);
  });
});
