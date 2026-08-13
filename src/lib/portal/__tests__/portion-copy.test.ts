import { describe, expect, it } from "vitest";
import {
  personalSubstitutionDetail,
  personalSubstitutionNote,
} from "@/lib/portal/portion-copy";

describe("personalSubstitutionNote", () => {
  it("is undefined when nothing was absorbed", () => {
    expect(personalSubstitutionNote([])).toBeUndefined();
  });

  it("names a personal substitution when sources exist", () => {
    expect(personalSubstitutionNote(["organ_meat"])).toBe(
      "Personal substitution applied",
    );
  });
});

describe("personalSubstitutionDetail", () => {
  it("explains a single redirected allocation", () => {
    expect(personalSubstitutionDetail(["organ_meat"])).toBe(
      "Your usual organ meat allocation was directed here based on your preferences.",
    );
  });

  it("lists multiple sources", () => {
    expect(personalSubstitutionDetail(["organ_meat", "eggs"])).toBe(
      "Your usual organ meat and eggs allocations were directed here based on your preferences.",
    );
  });
});
