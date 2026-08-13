import { env } from "@/lib/env";

/**
 * Engine and rollout flags. Safe defaults keep the shipped legacy slot engine
 * active until the Biological OS pipeline is explicitly enabled.
 */
export function legacySlotEngineEnabled(): boolean {
  return env.LEGACY_SLOT_ENGINE !== "false";
}

export function biologicalOsEngineEnabled(): boolean {
  return env.BIOLOGICAL_OS_ENGINE === "true";
}
