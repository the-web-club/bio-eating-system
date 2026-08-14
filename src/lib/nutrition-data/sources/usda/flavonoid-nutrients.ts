import type { NutrientDefRecord } from "../../schema";

/** USDA FNDDS / FDB-EXP flavonoid nutrient codes (Nutr_No). */
export const FNDDS_FLAVONOID_NUTRIENT_CODES = {
  daidzein: 710,
  genistein: 711,
  glycitein: 712,
  cyanidin: 731,
  petunidin: 740,
  delphinidin: 741,
  malvidin: 742,
  pelargonidin: 743,
  peonidin: 745,
  catechin: 749,
  epigallocatechin: 750,
  epicatechin: 751,
  epicatechin_gallate: 752,
  epigallocatechin_gallate: 753,
  theaflavin: 755,
  thearubigins: 756,
  eriodictyol: 758,
  hesperetin: 759,
  naringenin: 762,
  apigenin: 770,
  luteolin: 773,
  isorhamnetin: 785,
  kaempferol: 786,
  myricetin: 788,
  quercetin: 789,
  theaflavin_3_3_digallate: 791,
  theaflavin_3_gallate: 792,
  theaflavin_3_prime_gallate: 793,
  gallocatechin: 794,
} as const;

export type FlavonoidNutrientCode =
  (typeof FLAVONOID_NUTRIENT_DEFINITIONS)[number]["code"];

export const FLAVONOID_NUTRIENT_DEFINITIONS: NutrientDefRecord[] = [
  {
    code: "flavonoid_daidzein",
    name: "Daidzein",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_genistein",
    name: "Genistein",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_glycitein",
    name: "Glycitein",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_cyanidin",
    name: "Cyanidin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_petunidin",
    name: "Petunidin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_delphinidin",
    name: "Delphinidin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_malvidin",
    name: "Malvidin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_pelargonidin",
    name: "Pelargonidin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_peonidin",
    name: "Peonidin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_catechin",
    name: "(+)-Catechin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_epigallocatechin",
    name: "(-)-Epigallocatechin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_epicatechin",
    name: "(-)-Epicatechin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_epicatechin_gallate",
    name: "(-)-Epicatechin 3-gallate",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_epigallocatechin_gallate",
    name: "(-)-Epigallocatechin 3-gallate",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_theaflavin",
    name: "Theaflavin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_thearubigins",
    name: "Thearubigins",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_eriodictyol",
    name: "Eriodictyol",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_hesperetin",
    name: "Hesperetin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_naringenin",
    name: "Naringenin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_apigenin",
    name: "Apigenin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_luteolin",
    name: "Luteolin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_isorhamnetin",
    name: "Isorhamnetin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_kaempferol",
    name: "Kaempferol",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_myricetin",
    name: "Myricetin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_quercetin",
    name: "Quercetin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_theaflavin_3_3_digallate",
    name: "Theaflavin-3,3'-digallate",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_theaflavin_3_gallate",
    name: "Theaflavin-3-gallate",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_theaflavin_3_prime_gallate",
    name: "Theaflavin-3'-gallate",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "flavonoid_gallocatechin",
    name: "(+)-Gallocatechin",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
];

const FNDDS_CODE_TO_NUTRIENT_CODE = Object.fromEntries(
  Object.entries(FNDDS_FLAVONOID_NUTRIENT_CODES).map(([key, code]) => {
    const nutrientCode = `flavonoid_${key}` as const;
    return [code, nutrientCode];
  }),
) as Record<number, string>;

export function mapFnddsFlavonoidNutrientCode(
  nutrientCode: number,
  amountMg: number | null | undefined,
): { code: string; amount: number } | null {
  const internalCode = FNDDS_CODE_TO_NUTRIENT_CODE[nutrientCode];
  if (!internalCode || amountMg === null || amountMg === undefined || !Number.isFinite(amountMg)) {
    return null;
  }
  if (amountMg <= 0) return null;
  return { code: internalCode, amount: amountMg };
}

export const FNDDS_FLAVONOID_SOURCE_VERSION = "fndds-flavonoid-2017-2018" as const;
