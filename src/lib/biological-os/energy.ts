import { ENERGY_CALCULATION_VERSION } from "@/lib/biological-os/constants";

export type EnergyEstimate = {
  calculationVersion: typeof ENERGY_CALCULATION_VERSION;
  bmrKcal: number;
  baselineOccupationPal: number;
  dailyExerciseKcal: number;
  tdeeKcal: number;
  weeklyExerciseKcal: number;
};

/** Mifflin-St Jeor resting energy expenditure (kcal/day). */
export function mifflinStJeorBmr(args: {
  sex: "female" | "male";
  ageYears: number;
  heightCm: number;
  weightKg: number;
}): number {
  const base = 10 * args.weightKg + 6.25 * args.heightCm - 5 * args.ageYears;
  return args.sex === "female" ? base - 161 : base + 5;
}

/** Weekly exercise energy from one resolved activity row (kcal/week). */
export function exerciseKcalPerWeek(args: {
  metValue: number;
  weightKg: number;
  minutesPerSession: number;
  sessionsPerWeek: number;
}): number {
  if (args.sessionsPerWeek <= 0 || args.minutesPerSession <= 0) {
    return 0;
  }
  return args.metValue * args.weightKg * (args.minutesPerSession / 60) * args.sessionsPerWeek;
}

export function computeEnergyEstimate(args: {
  sex: "female" | "male";
  ageYears: number;
  heightCm: number;
  weightKg: number;
  baselineOccupationPal: number;
  weeklyExerciseKcal: number;
}): EnergyEstimate {
  const bmrKcal = mifflinStJeorBmr(args);
  const dailyExerciseKcal = args.weeklyExerciseKcal / 7;
  const tdeeKcal = bmrKcal * args.baselineOccupationPal + dailyExerciseKcal;

  return {
    calculationVersion: ENERGY_CALCULATION_VERSION,
    bmrKcal,
    baselineOccupationPal: args.baselineOccupationPal,
    dailyExerciseKcal,
    tdeeKcal,
    weeklyExerciseKcal: args.weeklyExerciseKcal,
  };
}
