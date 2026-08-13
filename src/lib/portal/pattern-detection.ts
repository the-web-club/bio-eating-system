import type { AdaptationEvent } from "@/generated/prisma/client";

export type AdaptationPrompt = {
  key: string;
  message: string;
  preferenceKey: string;
  preferenceValue: unknown;
};

export function detectAdaptationPrompts(
  events: Pick<AdaptationEvent, "type" | "reason" | "createdAt">[],
): AdaptationPrompt[] {
  const prompts: AdaptationPrompt[] = [];
  const replaces = events.filter((e) => e.type === "replace");
  const fastReplaces = replaces.filter((e) => e.reason === "need_faster").length;
  if (fastReplaces >= 3) {
    prompts.push({
      key: "prioritize_fast_meals",
      message:
        "We noticed you frequently replace meals because of preparation time. Would you like us to prioritize meals under 15 minutes?",
      preferenceKey: "prioritize_fast_meals",
      preferenceValue: { enabled: true, maxMinutes: 15 },
    });
  }

  const fishReplaces = replaces.filter(
    (e) => e.reason === "dont_like" || e.reason === "dont_have",
  ).length;
  if (fishReplaces >= 4) {
    prompts.push({
      key: "reduce_fish",
      message: "You have replaced fish several times. Would you like fish reduced in your plan?",
      preferenceKey: "reduce_fish",
      preferenceValue: { enabled: true },
    });
  }

  const fridayRestaurant = events.filter(
    (e) =>
      e.type === "life_happened" &&
      e.reason === "restaurant" &&
      new Date(e.createdAt).getDay() === 5,
  ).length;
  if (fridayRestaurant >= 2) {
    prompts.push({
      key: "friday_restaurant",
      message:
        "You often eat at restaurants on Fridays. Would you like a Friday restaurant strategy?",
      preferenceKey: "friday_restaurant_mode",
      preferenceValue: { enabled: true },
    });
  }

  return prompts;
}
