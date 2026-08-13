import type { FoodSourceBundle } from "../schema";

export type FoodSourceAdaptor = {
  sourceKey: string;
  listVersions(): Promise<string[]>;
  fetch(version: string): Promise<FoodSourceBundle>;
};

export const ADAPTOR_NOT_IMPLEMENTED =
  "Source adaptor not implemented. Register dataset in FoodDataSource and complete professional review first.";

export function createUnimplementedAdaptor(sourceKey: string): FoodSourceAdaptor {
  return {
    sourceKey,
    async listVersions() {
      return [];
    },
    async fetch() {
      throw new Error(`${ADAPTOR_NOT_IMPLEMENTED} (${sourceKey})`);
    },
  };
}
