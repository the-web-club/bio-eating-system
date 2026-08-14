import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { UsdaFoodRecord } from "./client";

const execFileAsync = promisify(execFile);

export const FOUNDATION_RELEASES = {
  "2025-04-24": {
    version: "2025-04-24",
    url: "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_json_2025-04-24.zip",
    jsonFilename: "FoodData_Central_foundation_food_json_2025-04-24.json",
  },
  "2026-04-30": {
    version: "2026-04-30",
    url: "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_json_2026-04-30.zip",
    jsonFilename: "FoodData_Central_foundation_food_json_2026-04-30.json",
  },
} as const;

export type FoundationReleaseVersion = keyof typeof FOUNDATION_RELEASES;

export const DEFAULT_FOUNDATION_RELEASE_VERSION: FoundationReleaseVersion = "2026-04-30";

/** @deprecated Use DEFAULT_FOUNDATION_RELEASE_VERSION or sliceVersionToReleaseVersion. */
export const FOUNDATION_RELEASE_VERSION = DEFAULT_FOUNDATION_RELEASE_VERSION;

/** @deprecated Use FOUNDATION_RELEASES[version].url */
export const FOUNDATION_RELEASE_URL = FOUNDATION_RELEASES[DEFAULT_FOUNDATION_RELEASE_VERSION].url;

/** @deprecated Use FOUNDATION_RELEASES[version].jsonFilename */
export const FOUNDATION_JSON_FILENAME =
  FOUNDATION_RELEASES[DEFAULT_FOUNDATION_RELEASE_VERSION].jsonFilename;

const RELEASE_DIR = path.join(
  process.cwd(),
  "content/imports/usda-foundation-release",
);

type FoundationReleaseFile = {
  FoundationFoods: Array<UsdaFoodRecord | null>;
};

export function sliceVersionToReleaseVersion(sliceVersion: string): FoundationReleaseVersion {
  if (sliceVersion.startsWith("2026-04-30")) {
    return "2026-04-30";
  }
  return "2025-04-24";
}

export async function ensureFoundationReleaseJson(
  releaseVersion: FoundationReleaseVersion = DEFAULT_FOUNDATION_RELEASE_VERSION,
): Promise<string> {
  const release = FOUNDATION_RELEASES[releaseVersion];
  await mkdir(RELEASE_DIR, { recursive: true });
  const jsonPath = path.join(RELEASE_DIR, release.jsonFilename);

  try {
    await stat(jsonPath);
    return jsonPath;
  } catch {
    // Download official USDA Foundation Foods release when missing locally.
  }

  const zipPath = path.join(RELEASE_DIR, `foundation-${release.version}.zip`);
  const response = await fetch(release.url);
  if (!response.ok) {
    throw new Error(
      `Failed to download USDA Foundation Foods release ${release.version} (${response.status}) from ${release.url}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(zipPath, buffer);
  await execFileAsync("unzip", ["-o", zipPath, "-d", RELEASE_DIR]);

  await stat(jsonPath);
  return jsonPath;
}

export async function loadAllFoundationFoods(
  releaseVersion: FoundationReleaseVersion = DEFAULT_FOUNDATION_RELEASE_VERSION,
): Promise<UsdaFoodRecord[]> {
  const jsonPath = await ensureFoundationReleaseJson(releaseVersion);
  const raw = JSON.parse(await readFile(jsonPath, "utf8")) as FoundationReleaseFile;
  return raw.FoundationFoods.filter((food): food is UsdaFoodRecord => !!food);
}

export async function loadFoundationFoodsByIds(
  fdcIds: number[],
  releaseVersion: FoundationReleaseVersion = DEFAULT_FOUNDATION_RELEASE_VERSION,
): Promise<UsdaFoodRecord[]> {
  const byId = new Map((await loadAllFoundationFoods(releaseVersion)).map((food) => [food.fdcId, food]));
  return fdcIds.map((fdcId) => byId.get(fdcId)).filter((food): food is UsdaFoodRecord => !!food);
}
