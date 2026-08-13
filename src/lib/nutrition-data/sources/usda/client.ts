export type UsdaFoodNutrient = {
  nutrient?: {
    id?: number;
    number?: string;
    name?: string;
    unitName?: string;
  };
  amount?: number | null;
};

export type UsdaFoodRecord = {
  fdcId: number;
  description: string;
  dataType?: string;
  foodNutrients?: UsdaFoodNutrient[];
};

/** Only Foundation Foods are in scope for the approved production slice. */
export const APPROVED_USDA_DATA_TYPE = "Foundation" as const;

const FDC_API_BASE = "https://api.nal.usda.gov/fdc/v1";

export function resolveUsdaApiKey(): string {
  return process.env.USDA_FDC_API_KEY?.trim() || "DEMO_KEY";
}

export async function fetchUsdaFoodsByIds(
  fdcIds: number[],
  apiKey = resolveUsdaApiKey(),
): Promise<UsdaFoodRecord[]> {
  if (fdcIds.length === 0) return [];

  const response = await fetch(`${FDC_API_BASE}/foods?api_key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ fdcIds, format: "full" }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`USDA FDC API request failed (${response.status}): ${body.slice(0, 240)}`);
  }

  const payload = (await response.json()) as UsdaFoodRecord[] | { foods?: UsdaFoodRecord[] };
  if (Array.isArray(payload)) return payload;
  return payload.foods ?? [];
}

export async function fetchUsdaFoodById(
  fdcId: number,
  apiKey = resolveUsdaApiKey(),
): Promise<UsdaFoodRecord> {
  const response = await fetch(
    `${FDC_API_BASE}/food/${fdcId}?api_key=${encodeURIComponent(apiKey)}&format=full`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`USDA FDC food/${fdcId} failed (${response.status}): ${body.slice(0, 240)}`);
  }

  return (await response.json()) as UsdaFoodRecord;
}
