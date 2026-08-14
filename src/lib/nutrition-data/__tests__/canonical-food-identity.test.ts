import { describe, expect, it } from "vitest";
import {
  buildCanonicalFoodIdentity,
  detectCanonicalDuplicateGroups,
} from "@/lib/nutrition-data/canonical-food-identity";

describe("canonical food identity", () => {
  it("normalizes names and builds stable keys", () => {
    const identity = buildCanonicalFoodIdentity({
      normalizedName: "  Apple, Raw  ",
      preparationState: "RAW",
    });

    expect(identity.normalizedName).toBe("apple, raw");
    expect(identity.preparationState).toBe("RAW");
    expect(identity.canonicalFoodKey).toContain("apple, raw");
  });

  it("detects duplicate groups across sources without merging values", () => {
    const groups = detectCanonicalDuplicateGroups(
      [
        {
          source: "usda-fdc",
          sourceVersion: "2026-04-30-production-slice-v3",
          externalId: "fdc-1",
          name: "Apple, raw",
        },
        {
          source: "fineli",
          sourceVersion: "2026-01-01",
          externalId: "fineli-1",
          name: "Apple, raw",
        },
      ],
      (record) => ({
        normalizedName: record.name,
        preparationState: "RAW",
      }),
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.records).toHaveLength(2);
  });
});
