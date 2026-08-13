import { loadAllFoundationFoods } from "./release";
import { USDA_SLICE_OVERRIDE_BY_FDC_ID } from "./slice-overrides";
import { inferUsdaSliceEntry } from "./slice-inference";
import type { UsdaSliceEntry } from "./slice-config";

export async function buildFoundationSliceV2(): Promise<UsdaSliceEntry[]> {
  const records = await loadAllFoundationFoods();
  const entries = records.map((record) => {
    const override = USDA_SLICE_OVERRIDE_BY_FDC_ID.get(record.fdcId);
    if (override) return override;
    return inferUsdaSliceEntry(record);
  });

  return entries.sort((a, b) => a.fdcId - b.fdcId);
}

export function mergeSliceEntries(args: {
  records: Array<{ fdcId: number; description: string; foodCategory?: { description?: string } }>;
  overrides?: Map<number, UsdaSliceEntry>;
}): UsdaSliceEntry[] {
  const overrides = args.overrides ?? USDA_SLICE_OVERRIDE_BY_FDC_ID;

  return args.records
    .map((record) => {
      const override = overrides.get(record.fdcId);
      if (override) return override;
      return inferUsdaSliceEntry(record);
    })
    .sort((a, b) => a.fdcId - b.fdcId);
}
