import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  engineInputContractSchema,
  metReferenceSchema,
  phytonutrientCatalogSchema,
} from "@/lib/biological-os/contracts";

describe("biological os master contracts", () => {
  it("validates the pack example engine input", () => {
    const filePath = path.join(
      process.cwd(),
      "content/contracts/biological-os-master-cursor-pack/example-engine-input.json",
    );
    const parsed = engineInputContractSchema.parse(JSON.parse(readFileSync(filePath, "utf8")));
    expect(parsed.profile.sex).toBe("female");
    expect(parsed.activities).toHaveLength(2);
  });

  it("validates the MET reference file", () => {
    const filePath = path.join(process.cwd(), "content/activity/met-reference-v1.json");
    const parsed = metReferenceSchema.parse(JSON.parse(readFileSync(filePath, "utf8")));
    expect(parsed.version).toBe("met-reference-v1");
    expect(parsed.activities.length).toBeGreaterThan(0);
  });

  it("validates the phytonutrient catalog file", () => {
    const filePath = path.join(process.cwd(), "content/phytonutrients/phytonutrient-catalog-v2.json");
    const parsed = phytonutrientCatalogSchema.parse(JSON.parse(readFileSync(filePath, "utf8")));
    expect(parsed.compounds).toHaveLength(57);
  });
});
