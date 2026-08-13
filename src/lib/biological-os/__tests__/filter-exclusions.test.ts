import { describe, expect, it } from "vitest";
import {
  assertApprovedFoodCandidate,
  buildFilteredCandidateSet,
  filterExcludedCandidates,
} from "@/lib/biological-os";
import {
  ALL_TEST_FOODS,
  FOOD_EGGS,
  FOOD_FIXTURE_DEV,
  buildCategoryCandidates,
} from "./fixtures";

describe("filter exclusions and candidate set", () => {
  it("hard excludes foods by allergen", () => {
    const filtered = filterExcludedCandidates({
      candidates: ALL_TEST_FOODS,
      excludedAllergens: ["egg"],
    });

    expect(filtered.some((row) => row.foodId === FOOD_EGGS.foodId)).toBe(false);
  });

  it("rejects dev-only foods from approved universe", () => {
    expect(() => assertApprovedFoodCandidate(FOOD_FIXTURE_DEV)).toThrow(/devOnly/i);
  });

  it("reports missing categories after allergen filtering removes entire slots", () => {
    const result = buildFilteredCandidateSet({
      categoryCandidates: buildCategoryCandidates([FOOD_EGGS]),
      excludedAllergens: ["egg"],
    });

    expect(result.candidates).toHaveLength(0);
  });

  it("keeps approved foods when exclusions do not apply", () => {
    const result = buildFilteredCandidateSet({
      categoryCandidates: buildCategoryCandidates(),
    });

    expect(result.candidates.length).toBeGreaterThan(10);
    expect(result.candidates.every((row) => row.devOnly === false)).toBe(true);
  });
});
