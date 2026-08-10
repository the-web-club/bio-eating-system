import type {
  foodPreferencesSchema,
  householdSchema,
  lifestyleSchema,
  practicalSchema,
} from "@/lib/intake/schema";
import type { z } from "zod";

export type ProfileLifestyle = z.infer<typeof lifestyleSchema>;
export type ProfileFoodPreferences = z.infer<typeof foodPreferencesSchema>;
export type ProfilePractical = z.infer<typeof practicalSchema>;
export type ProfileHousehold = z.infer<typeof householdSchema>;

export type PortalProfileSummary = {
  age: number;
  weightKg: number;
  goal: string;
  lifestyle: ProfileLifestyle;
  foodPreferences: ProfileFoodPreferences;
  practical: ProfilePractical;
  household: ProfileHousehold;
  weeklyBudgetEur: number | null;
  allergenCount: number;
};

export function parseProfileJson<T>(value: unknown, fallback: T): T {
  if (value && typeof value === "object") return value as T;
  return fallback;
}

export function builtAroundBullets(profile: PortalProfileSummary): string[] {
  const bullets: string[] = [];
  if (profile.allergenCount > 0 || profile.foodPreferences.dietaryPattern !== "omnivore") {
    bullets.push("your dietary restrictions");
  }
  if (profile.foodPreferences.likes?.trim()) {
    bullets.push("foods you enjoy");
  }
  if (profile.practical.weeklyBudgetEur) {
    bullets.push("your budget");
  }
  bullets.push("your cooking situation");
  bullets.push("your activity");
  return bullets;
}
