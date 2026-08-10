import { describe, expect, it } from "vitest";
import { isAdminEmail } from "@/lib/admin-allowlist";

describe("isAdminEmail", () => {
  it("allows the two staff addresses", () => {
    expect(isAdminEmail("contact@katarina2.com")).toBe(true);
    expect(isAdminEmail("info@rikderks.nl")).toBe(true);
    expect(isAdminEmail("  Info@RikDerks.nl ")).toBe(true);
  });

  it("rejects everyone else", () => {
    expect(isAdminEmail("member@example.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
