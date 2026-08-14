export const OPTIMIZER_POLICY_VERSION = "optimizer-policy-v1" as const;

export const optimizerPolicy = {
  version: OPTIMIZER_POLICY_VERSION,
  /** Level 1-2: requirement coverage dominates candidate ranking. */
  nutrientCoverageWeight: 1,
  /** Level 4-5: phytonutrient diversity is secondary to adequacy. */
  phytonutrientBoostWeight: 0.01,
  /** New phytonutrient class not yet represented in the draft. */
  newPhytoClassBoost: 2,
  /** Each tracked compound present in a candidate. */
  presentCompoundBoost: 1,
  /** Pair overlap threshold for redundancy assessment. */
  overlapThreshold: 0.1,
  /** Default edible portion grams when none supplied. */
  defaultPortionGrams: 100,
} as const;

export type OptimizerPolicy = typeof optimizerPolicy;
