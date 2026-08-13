import type { FoodSourceBundle } from "../../schema";
import { parseFoodSourceBundle } from "../../schema";
import type { FoodSourceAdaptor } from "../types";

export function createGenericJsonAdaptor(args: {
  sourceKey: string;
  loadJson(version: string): Promise<unknown>;
}): FoodSourceAdaptor {
  return {
    sourceKey: args.sourceKey,
    async listVersions() {
      return [];
    },
    async fetch(version: string): Promise<FoodSourceBundle> {
      const raw = await args.loadJson(version);
      const bundle = parseFoodSourceBundle(raw);
      if (bundle.source !== args.sourceKey) {
        throw new Error(`Bundle source ${bundle.source} does not match adaptor ${args.sourceKey}`);
      }
      if (bundle.sourceVersion !== version) {
        throw new Error(
          `Bundle version ${bundle.sourceVersion} does not match requested version ${version}`,
        );
      }
      return bundle;
    },
  };
}
