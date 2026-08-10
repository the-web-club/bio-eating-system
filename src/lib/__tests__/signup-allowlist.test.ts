import { describe, expect, it } from "vitest";
import {
  displayNameFromEmail,
  isSignupAllowlisted,
  normalizeEmail,
} from "../signup-allowlist";

describe("signup allowlist", () => {
  it("accepts invited addresses case-insensitively", () => {
    expect(isSignupAllowlisted("contact@katarina2.com")).toBe(true);
    expect(isSignupAllowlisted("Contact@Katarina2.com")).toBe(true);
    expect(isSignupAllowlisted("info@rikderks.nl")).toBe(true);
    expect(isSignupAllowlisted("katarina.kakkonen@gmail.com")).toBe(true);
  });

  it("rejects other addresses", () => {
    expect(isSignupAllowlisted("stranger@example.com")).toBe(false);
    expect(isSignupAllowlisted("contact@katarina.com")).toBe(false);
  });

  it("normalises email for storage lookups", () => {
    expect(normalizeEmail("  Info@RikDerks.nl ")).toBe("info@rikderks.nl");
  });

  it("builds a readable display name from the local part", () => {
    expect(displayNameFromEmail("contact@katarina2.com")).toBe("Contact");
    expect(displayNameFromEmail("info@rikderks.nl")).toBe("Info");
  });
});
