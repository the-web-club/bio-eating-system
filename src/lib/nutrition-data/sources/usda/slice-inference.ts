import type { Allergen } from "@/lib/nutrition/plan-engine";
import type { FoodSourceRecord } from "../../schema";
import type { UsdaFoodRecord } from "./client";
import type { UsdaSliceEntry } from "./slice-config";

type FoundationFoodRecord = UsdaFoodRecord & {
  foodCategory?: { description?: string };
};

function normalizeDescription(description: string): string {
  return description.trim().toLowerCase();
}

export function inferPreparationState(description: string): UsdaSliceEntry["preparationState"] {
  const text = normalizeDescription(description);

  if (/\b(dry roasted|dry-roasted|roasted nuts|roasted seed)\b/.test(text)) {
    return "DRIED";
  }
  if (/\b(dried|dehydrated|dry\b|flour|rolled|instant oats)\b/.test(text)) {
    return "DRIED";
  }
  if (/\b(baked|bread|toast|cracker|cookie|cake|muffin)\b/.test(text)) {
    return "BAKED";
  }
  if (/\b(roasted|rotisserie|grilled)\b/.test(text)) {
    return "ROASTED";
  }
  if (/\b(boiled|cooked|steamed|poached|simmered)\b/.test(text)) {
    return "BOILED";
  }
  if (/\b(canned|tinned)\b/.test(text)) {
    return "CANNED";
  }
  if (/\b(fermented|yogurt|kefir|sauerkraut|kimchi|tempeh|miso)\b/.test(text)) {
    return "FERMENTED";
  }
  if (/\b(raw|fresh)\b/.test(text)) {
    return "RAW";
  }

  return "RAW";
}

function inferFoodCategories(args: {
  biologicalCategory: FoodSourceRecord["biologicalCategory"];
  usdaCategory: string;
}): string[] {
  switch (args.biologicalCategory) {
    case "eggs":
      return ["animal_protein"];
    case "organ_meat":
      return ["organ_meat"];
    case "small_fish":
    case "bivalves":
      return ["seafood"];
    case "muscle_meat":
      if (/poultry|chicken|turkey|duck/i.test(args.usdaCategory)) return ["poultry"];
      if (/lamb|veal|game/i.test(args.usdaCategory)) return ["game_meat"];
      return ["red_meat"];
    case "tubers":
      return ["tubers"];
    case "cruciferous":
    case "mushrooms":
      return ["vegetables"];
    case "berries":
    case "kiwi":
      return ["fruit"];
    case "olive_oil":
      if (/oil|fat/i.test(args.usdaCategory)) return ["oils"];
      if (/seed|nut/i.test(args.usdaCategory)) return ["seeds"];
      if (/baked|bread|pasta|cereal|grain/i.test(args.usdaCategory)) return ["grains"];
      return ["grains"];
    case "fermented":
      return ["dairy"];
    case "aromatics":
      return ["aromatics"];
    default:
      return ["other"];
  }
}

function inferAllergens(description: string, usdaCategory: string): Allergen[] {
  const text = normalizeDescription(description);
  const allergens = new Set<Allergen>();

  if (/\b(egg|eggs|albumen|omelet|omelette)\b/.test(text) || /egg products/i.test(usdaCategory)) {
    allergens.add("egg");
  }
  if (
    /\b(milk|yogurt|yoghurt|cheese|cream|butter|whey|casein|dairy)\b/.test(text) ||
    /dairy and egg products/i.test(usdaCategory)
  ) {
    allergens.add("milk");
  }
  if (/\b(fish|salmon|cod|tuna|sardine|trout|herring|mackerel|anchov)\b/.test(text)) {
    allergens.add("fish");
  }
  if (
    /\b(shrimp|prawn|crab|lobster|crayfish|crustacean)\b/.test(text) ||
    /\bcrustacean/i.test(text)
  ) {
    allergens.add("crustaceans");
  }
  if (/\b(mussel|oyster|clam|scallop|squid|octopus|mollusc|mollusk)\b/.test(text)) {
    allergens.add("molluscs");
  }
  if (/\b(wheat|bread|pasta|flour|oat|rye|barley|semolina|gluten|spelt)\b/.test(text)) {
    allergens.add("gluten");
  }
  if (/\b(soy|soya|tofu|tempeh|edamame)\b/.test(text) || /legumes and legume products/i.test(usdaCategory)) {
    allergens.add("soy");
  }
  if (/\b(almond|walnut|pecan|cashew|hazelnut|pistachio|macadamia)\b/.test(text)) {
    allergens.add("tree_nuts");
  }
  if (/\b(peanut|groundnut)\b/.test(text)) {
    allergens.add("peanuts");
  }
  if (/\b(sesame|tahini)\b/.test(text)) {
    allergens.add("sesame");
  }

  return [...allergens].sort();
}

export function inferBiologicalCategory(args: {
  description: string;
  usdaCategory: string;
}): FoodSourceRecord["biologicalCategory"] {
  const text = normalizeDescription(args.description);
  const category = args.usdaCategory.toLowerCase();

  if (/\b(liver|kidney|heart|tongue|organ meat|offal)\b/.test(text)) {
    return "organ_meat";
  }

  if (/\bkiwi(?:fruit)?\b/.test(text)) {
    return "kiwi";
  }

  if (/\bmushrooms?\b/.test(text)) {
    return "mushrooms";
  }

  if (/\b(shrimp|prawn|crab|lobster|mussel|clam|scallop|oyster|squid|octopus)\b/.test(text)) {
    return "bivalves";
  }

  if (/\b(fish|salmon|cod|tuna|sardine|trout|herring|mackerel|anchov)\b/.test(text)) {
    return "small_fish";
  }

  if (/\b(egg|eggs)\b/.test(text) || (category.includes("egg") && !category.includes("legume"))) {
    return "eggs";
  }

  if (/\b(yogurt|yoghurt|kefir|sauerkraut|kimchi|tempeh)\b/.test(text)) {
    return "fermented";
  }

  if (/\b(garlic|onion|shallot|ginger|turmeric|basil|oregano|thyme|parsley|cilantro|spice)\b/.test(text)) {
    return "aromatics";
  }

  if (/\b(potato|sweet potato|yam)\b/.test(text)) {
    return "tubers";
  }

  if (/\b(broccoli|kale|cabbage|cauliflower|brussels|collard|arugula|spinach|lettuce|pepper|carrot|celery|cucumber|zucchini|asparagus)\b/.test(text)) {
    return "cruciferous";
  }

  if (/\b(blueberr|blackberr|raspberr|strawberr|apple|banana|orange|grape|melon|fruit|mango|pineapple|peach|pear|plum|cherry)\b/.test(text)) {
    return "berries";
  }

  if (
    category.includes("beef") ||
    category.includes("pork") ||
    category.includes("lamb") ||
    category.includes("veal") ||
    category.includes("game") ||
    category.includes("poultry") ||
    category.includes("sausages") ||
    /\b(chicken|turkey|beef|pork|lamb|bison|venison|meat|sausage|ham|bacon)\b/.test(text)
  ) {
    return "muscle_meat";
  }

  if (category.includes("finfish")) {
    return "small_fish";
  }

  if (category.includes("shellfish")) {
    return "bivalves";
  }

  if (category.includes("vegetable")) {
    return "cruciferous";
  }

  if (category.includes("fruit")) {
    return "berries";
  }

  if (category.includes("dairy")) {
    return "fermented";
  }

  if (
    category.includes("cereal") ||
    category.includes("pasta") ||
    category.includes("baked") ||
    category.includes("nut and seed") ||
    category.includes("fats and oils") ||
    category.includes("legume")
  ) {
    return "olive_oil";
  }

  if (category.includes("spices")) {
    return "aromatics";
  }

  if (category.includes("soup") || category.includes("sauce")) {
    return "fermented";
  }

  if (category.includes("restaurant") || category.includes("sweets") || category.includes("beverage")) {
    return "olive_oil";
  }

  return "cruciferous";
}

export function inferUsdaSliceEntry(record: FoundationFoodRecord): UsdaSliceEntry {
  const description = record.description;
  const usdaCategory = record.foodCategory?.description ?? "Unknown";
  const biologicalCategory = inferBiologicalCategory({ description, usdaCategory });

  return {
    fdcId: record.fdcId,
    biologicalCategory,
    preparationState: inferPreparationState(description),
    displayName: description,
    allergens: inferAllergens(description, usdaCategory),
    foodCategories: inferFoodCategories({ biologicalCategory, usdaCategory }),
  };
}
