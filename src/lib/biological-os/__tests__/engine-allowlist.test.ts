import { describe, expect, it } from "vitest";
import { isBiologicalOsEngineAllowlisted } from "@/lib/biological-os/engine-allowlist";

describe("biological os engine allowlist", () => {
  it("allows signup allowlist emails", () => {
    expect(isBiologicalOsEngineAllowlisted("katarina.kakkonen@gmail.com")).toBe(true);
  });

  it("rejects unknown emails", () => {
    expect(isBiologicalOsEngineAllowlisted("unknown@example.com")).toBe(false);
  });
});
