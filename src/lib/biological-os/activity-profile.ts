import { readFileSync } from "node:fs";
import path from "node:path";
import {
  metReferenceSchema,
  type MetReferenceContract,
} from "@/lib/biological-os/contracts";
import { MET_REFERENCE_VERSION } from "@/lib/biological-os/constants";
import { exerciseKcalPerWeek } from "@/lib/biological-os/energy";
import type { EngineActivityRowContract } from "@/lib/biological-os/contracts";

export type ResolvedActivityRow = EngineActivityRowContract & {
  metCode: string;
  metValue: number;
  resolution: "exact" | "category_match" | "unresolved_pending" | "fallback_explicit";
  weeklyKcal: number;
};

let cachedReference: MetReferenceContract | null = null;

export function loadMetReference(): MetReferenceContract {
  if (cachedReference) return cachedReference;

  const filePath = path.join(process.cwd(), "content/activity/met-reference-v1.json");
  const parsed = metReferenceSchema.parse(JSON.parse(readFileSync(filePath, "utf8")));
  if (parsed.version !== MET_REFERENCE_VERSION) {
    throw new Error(
      `MET reference version mismatch: expected ${MET_REFERENCE_VERSION}, got ${parsed.version}`,
    );
  }
  cachedReference = parsed;
  return parsed;
}

export function resetMetReferenceCacheForTests() {
  cachedReference = null;
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

export function resolveOccupationPal(occupationMovement: string): number {
  const reference = loadMetReference();
  const key = normalizeLabel(occupationMovement);
  const pal = reference.occupationPal[key];
  if (pal !== undefined) return pal;

  throw new Error(`Unknown occupation movement "${occupationMovement}" for MET reference ${MET_REFERENCE_VERSION}.`);
}

export function resolveActivityRow(args: {
  row: EngineActivityRowContract;
  weightKg: number;
}): ResolvedActivityRow {
  const reference = loadMetReference();
  const label = normalizeLabel(args.row.label);

  if (args.row.metCode && args.row.metValue) {
    return {
      ...args.row,
      metCode: args.row.metCode,
      metValue: args.row.metValue,
      resolution: args.row.resolution ?? "exact",
      weeklyKcal: exerciseKcalPerWeek({
        metValue: args.row.metValue,
        weightKg: args.weightKg,
        minutesPerSession: args.row.minutesPerSession,
        sessionsPerWeek: args.row.sessionsPerWeek,
      }),
    };
  }

  for (const activity of reference.activities) {
    if (normalizeLabel(activity.label) === label) {
      return {
        ...args.row,
        metCode: activity.metCode,
        metValue: activity.metValue,
        resolution: "exact",
        weeklyKcal: exerciseKcalPerWeek({
          metValue: activity.metValue,
          weightKg: args.weightKg,
          minutesPerSession: args.row.minutesPerSession,
          sessionsPerWeek: args.row.sessionsPerWeek,
        }),
      };
    }

    for (const alias of activity.aliases ?? []) {
      if (normalizeLabel(alias) === label) {
        return {
          ...args.row,
          metCode: activity.metCode,
          metValue: activity.metValue,
          resolution: "category_match",
          weeklyKcal: exerciseKcalPerWeek({
            metValue: activity.metValue,
            weightKg: args.weightKg,
            minutesPerSession: args.row.minutesPerSession,
            sessionsPerWeek: args.row.sessionsPerWeek,
          }),
        };
      }
    }
  }

  if (reference.fallbackMet) {
    return {
      ...args.row,
      metCode: reference.fallbackMet.metCode,
      metValue: reference.fallbackMet.metValue,
      resolution: "fallback_explicit",
      weeklyKcal: exerciseKcalPerWeek({
        metValue: reference.fallbackMet.metValue,
        weightKg: args.weightKg,
        minutesPerSession: args.row.minutesPerSession,
        sessionsPerWeek: args.row.sessionsPerWeek,
      }),
    };
  }

  return {
    ...args.row,
    metCode: "UNRESOLVED",
    metValue: 0,
    resolution: "unresolved_pending",
    weeklyKcal: 0,
  };
}

export function resolveActivityProfile(args: {
  weightKg: number;
  occupationMovement: string;
  activities: EngineActivityRowContract[];
}): {
  baselineOccupationPal: number;
  resolvedActivities: ResolvedActivityRow[];
  weeklyExerciseKcal: number;
  unresolvedActivityLabels: string[];
} {
  const baselineOccupationPal = resolveOccupationPal(args.occupationMovement);
  const resolvedActivities = args.activities.map((row) =>
    resolveActivityRow({ row, weightKg: args.weightKg }),
  );
  const weeklyExerciseKcal = resolvedActivities.reduce((sum, row) => sum + row.weeklyKcal, 0);
  const unresolvedActivityLabels = resolvedActivities
    .filter((row) => row.resolution === "unresolved_pending")
    .map((row) => row.label);

  return {
    baselineOccupationPal,
    resolvedActivities,
    weeklyExerciseKcal,
    unresolvedActivityLabels,
  };
}
