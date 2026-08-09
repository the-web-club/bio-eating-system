/**
 * Screening gate.
 *
 * This module decides whether an energy deficit may be generated at all.
 * Its result is not overridable by any route, component, admin flag, or
 * query parameter. See rules.md §4.2.
 *
 * The thresholds below are CONSERVATIVE PLACEHOLDERS. They must be reviewed
 * and signed off by a qualified clinician before launch, and the sign-off
 * recorded in POLICY_VERSION. Do not tune them to make the product feel
 * more responsive.
 */

export const POLICY_VERSION = "screening-0.1-UNREVIEWED";

export const SCREENING_FLAGS = [
  "under_18",
  "pregnant_or_breastfeeding",
  "eating_disorder_history",
  "medically_supervised_diet",
  "diabetes_or_metabolic_condition",
  "prefers_not_to_say",
] as const;

export type ScreeningFlag = (typeof SCREENING_FLAGS)[number];

export type ScreeningOutcome = "allowed" | "maintenance_only" | "refused";

export interface ScreeningInput {
  age: number;
  heightCm: number;
  weightKg: number;
  goal: "REDUCE" | "MAINTAIN" | "INCREASE";
  flags: ScreeningFlag[];
}

export interface ScreeningResult {
  outcome: ScreeningOutcome;
  /** Stable reason codes. Copy lives in the i18n catalogue, not here. */
  reasons: string[];
  /** Hard ceiling on any deficit, as a fraction of maintenance energy. */
  maxDeficitFraction: number;
  /** Absolute floor on generated energy, kcal/day. */
  energyFloorKcal: number;
  policyVersion: string;
}

/** Minimum age to receive any generated plan. */
const MINIMUM_AGE = 18;

/** Below this BMI no deficit is generated, regardless of stated goal. */
const NO_DEFICIT_BMI = 20;

/** Below this BMI the product does not generate a plan at all. */
const REFUSE_BMI = 18.5;

/** Deficits are capped well short of what a crash target would imply. */
const MAX_DEFICIT_FRACTION = 0.15;

/** Conservative absolute floor. Anything lower needs supervision. */
const ENERGY_FLOOR_KCAL = 1500;

/** Flags that block a deficit outright. */
const DEFICIT_BLOCKING_FLAGS: ScreeningFlag[] = [
  "pregnant_or_breastfeeding",
  "eating_disorder_history",
  "medically_supervised_diet",
  "diabetes_or_metabolic_condition",
  "prefers_not_to_say",
];

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function screen(input: ScreeningInput): ScreeningResult {
  const reasons: string[] = [];
  const base = {
    maxDeficitFraction: MAX_DEFICIT_FRACTION,
    energyFloorKcal: ENERGY_FLOOR_KCAL,
    policyVersion: POLICY_VERSION,
  };

  // Refusals. No plan is generated.
  if (!Number.isFinite(input.age) || input.age < MINIMUM_AGE) {
    return { outcome: "refused", reasons: ["age_below_minimum"], ...base };
  }
  if (input.flags.includes("under_18")) {
    return { outcome: "refused", reasons: ["age_below_minimum"], ...base };
  }

  const currentBmi = bmi(input.weightKg, input.heightCm);
  if (!Number.isFinite(currentBmi) || currentBmi <= 0) {
    return { outcome: "refused", reasons: ["measurements_invalid"], ...base };
  }
  if (currentBmi < REFUSE_BMI) {
    return { outcome: "refused", reasons: ["requires_professional_support"], ...base };
  }

  // Maintenance-only outcomes. A plan is generated, but never a deficit.
  const blocking = input.flags.filter((f) => DEFICIT_BLOCKING_FLAGS.includes(f));
  if (blocking.length > 0) {
    reasons.push(...blocking.map((f) => `deficit_blocked:${f}`));
  }
  if (currentBmi < NO_DEFICIT_BMI) {
    reasons.push("deficit_blocked:bmi_below_threshold");
  }

  if (reasons.length > 0 && input.goal === "REDUCE") {
    return { outcome: "maintenance_only", reasons, ...base };
  }
  if (reasons.length > 0) {
    // Goal is already maintain or increase, so nothing is being withheld,
    // but the reasons stay on the record for auditability.
    return { outcome: "allowed", reasons, ...base };
  }

  return { outcome: "allowed", reasons: [], ...base };
}

/**
 * True only when a deficit may be applied. Call this, never re-derive the
 * decision from raw flags at the call site.
 */
export function deficitPermitted(result: ScreeningResult): boolean {
  return result.outcome === "allowed";
}
