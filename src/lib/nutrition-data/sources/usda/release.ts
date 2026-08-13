import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { UsdaFoodRecord } from "./client";

const execFileAsync = promisify(execFile);

export const FOUNDATION_RELEASE_VERSION = "2025-04-24";
export const FOUNDATION_RELEASE_URL = `https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_json_${FOUNDATION_RELEASE_VERSION}.zip`;
export const FOUNDATION_JSON_FILENAME = `FoodData_Central_foundation_food_json_${FOUNDATION_RELEASE_VERSION}.json`;

const RELEASE_DIR = path.join(
  process.cwd(),
  "content/imports/usda-foundation-release",
);

type FoundationReleaseFile = {
  FoundationFoods: UsdaFoodRecord[];
};

export async function ensureFoundationReleaseJson(): Promise<string> {
  await mkdir(RELEASE_DIR, { recursive: true });
  const jsonPath = path.join(RELEASE_DIR, FOUNDATION_JSON_FILENAME);

  try {
    await stat(jsonPath);
    return jsonPath;
  } catch {
    // Download official USDA Foundation Foods release when missing locally.
  }

  const zipPath = path.join(RELEASE_DIR, `foundation-${FOUNDATION_RELEASE_VERSION}.zip`);
  const response = await fetch(FOUNDATION_RELEASE_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to download USDA Foundation Foods release (${response.status}) from ${FOUNDATION_RELEASE_URL}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(zipPath, buffer);
  await execFileAsync("unzip", ["-o", zipPath, "-d", RELEASE_DIR]);

  await stat(jsonPath);
  return jsonPath;
}

export async function loadAllFoundationFoods(): Promise<UsdaFoodRecord[]> {
  const jsonPath = await ensureFoundationReleaseJson();
  const raw = JSON.parse(await readFile(jsonPath, "utf8")) as FoundationReleaseFile;
  return raw.FoundationFoods;
}

export async function loadFoundationFoodsByIds(fdcIds: number[]): Promise<UsdaFoodRecord[]> {
  const byId = new Map((await loadAllFoundationFoods()).map((food) => [food.fdcId, food]));
  return fdcIds.map((fdcId) => byId.get(fdcId)).filter((food): food is UsdaFoodRecord => !!food);
}
