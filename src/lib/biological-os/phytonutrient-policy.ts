export const PHYTONUTRIENT_POLICY_VERSION = "phytonutrient-policy-v1" as const;

export const phytonutrientPolicy = {
  version: PHYTONUTRIENT_POLICY_VERSION,
  /** Class diversity weight in the aggregate diversity score. */
  classWeight: 10,
  /** Compound count weight in the aggregate diversity score. */
  compoundWeight: 1,
  /** Optimizer boost when a candidate adds a new phytonutrient class. */
  newPhytoClassBoost: 2,
  /** Optimizer boost per present compound in a candidate. */
  presentCompoundBoost: 1,
  /** No invented daily requirement targets for bioactives. */
  inventDailyRequirement: false,
  /** Missing composition must remain UNKNOWN, never zero. */
  missingDataIsUnknown: true,
  trackedObjectives: [
    "compound_class_diversity",
    "compound_diversity",
    "plant_food_diversity",
    "food_family_diversity",
    "color_group_diversity",
  ] as const,
} as const;

export type PhytonutrientPolicy = typeof phytonutrientPolicy;
