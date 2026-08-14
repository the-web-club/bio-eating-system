import type { PreparationStateSlug } from "@/generated/prisma/client";

export type CanonicalFoodIdentityInput = {
  normalizedName: string;
  preparationState?: PreparationStateSlug | null;
  sourceCountry?: string | null;
  fortificationTag?: string | null;
};

export type CanonicalFoodIdentity = {
  canonicalFoodKey: string;
  normalizedName: string;
  preparationState: PreparationStateSlug | "UNKNOWN";
  sourceCountry: string | null;
  fortificationTag: string | null;
};

export type CanonicalDuplicateGroup = {
  canonicalFoodKey: string;
  records: Array<{
    source: string;
    sourceVersion: string;
    externalId: string;
    name: string;
  }>;
};

function normalizeFoodName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s,-]/gu, "");
}

export function buildCanonicalFoodIdentity(
  input: CanonicalFoodIdentityInput,
): CanonicalFoodIdentity {
  const normalizedName = normalizeFoodName(input.normalizedName);
  const preparationState = input.preparationState ?? "UNKNOWN";
  const sourceCountry = input.sourceCountry?.trim().toLowerCase() || null;
  const fortificationTag = input.fortificationTag?.trim().toLowerCase() || null;

  const canonicalFoodKey = [
    normalizedName,
    preparationState,
    sourceCountry ?? "-",
    fortificationTag ?? "-",
  ].join("|");

  return {
    canonicalFoodKey,
    normalizedName,
    preparationState,
    sourceCountry,
    fortificationTag,
  };
}

export function groupRecordsByCanonicalIdentity<
  T extends { source: string; sourceVersion: string; externalId: string; name: string },
>(records: T[], identityFor: (record: T) => CanonicalFoodIdentityInput): CanonicalDuplicateGroup[] {
  const groups = new Map<string, CanonicalDuplicateGroup>();

  for (const record of records) {
    const identity = buildCanonicalFoodIdentity(identityFor(record));
    const existing = groups.get(identity.canonicalFoodKey);
    if (existing) {
      existing.records.push({
        source: record.source,
        sourceVersion: record.sourceVersion,
        externalId: record.externalId,
        name: record.name,
      });
      continue;
    }

    groups.set(identity.canonicalFoodKey, {
      canonicalFoodKey: identity.canonicalFoodKey,
      records: [
        {
          source: record.source,
          sourceVersion: record.sourceVersion,
          externalId: record.externalId,
          name: record.name,
        },
      ],
    });
  }

  return [...groups.values()].sort((a, b) =>
    a.canonicalFoodKey.localeCompare(b.canonicalFoodKey),
  );
}

export function detectCanonicalDuplicateGroups<
  T extends { source: string; sourceVersion: string; externalId: string; name: string },
>(records: T[], identityFor: (record: T) => CanonicalFoodIdentityInput): CanonicalDuplicateGroup[] {
  return groupRecordsByCanonicalIdentity(records, identityFor).filter(
    (group) => group.records.length > 1,
  );
}
