# Food data expansion

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Status:** USDA Foundation slice v3 implemented in code; DB import is a separate step  
**Last updated:** 2026-08-13  

This document records how the Biological OS food matrix grows beyond the original 26-food production slice, and which external databases are explicitly excluded.

---

## Production slice versions

| Slice version | Foods | Scope | Engine default |
|---------------|-------|-------|----------------|
| `2025-04-24-production-slice-v1` | 26 | Hand-reviewed Foundation subset | Retained for regression imports |
| `2025-04-24-production-slice-v2` | 340 | Full USDA Foundation Foods release `2025-04-24` | Retained for regression imports |
| `2026-04-30-production-slice-v3` | 363 | Full USDA Foundation Foods release `2026-04-30` | **Yes** (`APPROVED_FOOD_SOURCE_VERSION`) |

Official release files (local copies):

- `content/imports/usda-foundation-release/FoodData_Central_foundation_food_json_2025-04-24.json`
- `content/imports/usda-foundation-release/FoodData_Central_foundation_food_json_2026-04-30.json`

Import:

```bash
pnpm import:usda
# or explicitly:
pnpm import:usda 2026-04-30-production-slice-v3
```

Older slices remain importable for comparison:

```bash
pnpm import:usda 2025-04-24-production-slice-v2
pnpm import:usda 2025-04-24-production-slice-v1
```

---

## v2 and v3 mapping strategy

1. **Hand-reviewed overrides** from v1 (`slice-overrides.ts`) always win for their `fdcId`.
2. **Automatic inference** (`slice-inference.ts`) maps USDA `foodCategory` + description to:
   - `biologicalCategory` (internal slot)
   - `preparationState`
   - EU-14 allergen flags (structured only, no free-text parsing at runtime)
   - coarse `foodCategories` tags
3. Foods without a v1 override are inferred at import time. Review uncertain mappings in admin before customer rollout.

**2026 release change:** `Bread, whole-wheat, commercially prepared` (fdcId 335240) was removed. The v1 grain override now points to `Flour, whole wheat, unenriched` (fdcId 790085), present in both releases.

Hand-reviewed seafood overrides cover scallops, squid, shrimp, lobster, cod, and anchovies for the `bivalves` and `small_fish` slots.

---

## Approved sources (production)

| Source | Dataset | License | Status |
|--------|---------|---------|--------|
| USDA FoodData Central | Foundation Foods only | CC0 1.0 | **APPROVED, imported** |
| EFSA | DRV 2017 summary report | Reproduction authorised with acknowledgement | **APPROVED, imported** (`efsa-drv-eu-2017-v2`, 29 nutrients) |

Only `dataType: Foundation` records pass the USDA adaptor. Branded Foods, SR Legacy, FNDDS, and Survey paths remain blocked in code.

**Nutrient catalog:** 94 fields per food (9 energy/macros + 28 micronutrients + 28 Foundation phytonutrients + 29 FNDDS flavonoids). Sodium, chromium, and phytonutrients are monitor-only until EFSA scalar rows exist. Foundation phytonutrients import from the 2026 JSON. Flavonoids merge from `foundation-flavonoid-enrichment-v1.json` after you run `pnpm build:fndds-flavonoids` with a USDA FNDDS flavonoid export. PhytoHub and FooDB remain rejected.

---

## Remaining Foundation gaps

| Gap | Status | Mitigation |
|-----|--------|------------|
| Liver and other organ meats | Not in Foundation Foods | Engine borrows `bivalves` candidates for the `organ_meat` slot via `SWAP_TARGET` until SR Legacy organ meats pass a separate audit |
| Mussels and oysters (shellfish) | Not in Foundation Foods | Scallops, squid, shrimp, and lobster are imported and mapped to `bivalves` |
| Flavonoids | Not in Foundation JSON | Merge via `pnpm build:fndds-flavonoids` from USDA FNDDS 2017-2018 flavonoid export (NDB crosswalk). Until enrichment is built, composition is UNKNOWN |
| AMDR macro ranges | Not in EFSA v2 slice | Energy and macros use scalar rows only |

---

## Rejected sources (do not import)

These databases are **not legally usable** for this product and must not be added to `FoodDataSource`, import scripts, or engine loaders.

| Source | Status | Reason |
|--------|--------|--------|
| PhytoHub | REVIEW_REQUIRED | Commercial reuse terms not verified; adapter reserved |
| FooDB | REVIEW_REQUIRED | Commercial reuse terms not verified; adapter reserved |
| `fixture-v1` | REJECTED | Dev-only test fixture |
| LLM-generated nutrient tables | REJECTED | Prohibited by project rules |
| Blogs, Cronometer, MyFitnessPal, etc. | REJECTED | Not authoritative |

Do not substitute PhytoHub or FooDB with unofficial scrapes or mirrors. If phytonutrient coverage is needed later, evaluate **USDA Special Interest** releases under a separate legal audit, not third-party aggregators.

---

## Future candidates (not in v3)

| Source | Status | Notes |
|--------|--------|-------|
| Fineli | REVIEW_REQUIRED | CC BY 4.0 appears permissive; THL endorsement copy needs review |
| EuroFIR / FoodEXplorer | FUTURE_OPTION | Membership terms unverified |
| NNR2023 numeric tables | REVIEW_REQUIRED | Commercial numeric reuse unverified |
| USDA Special Interest phytonutrient DBs | FUTURE_OPTION | Separate compliance audit required |

---

## Code map

| Module | Role |
|--------|------|
| `src/lib/nutrition-data/sources/usda/release.ts` | Multi-release loader (`2025-04-24`, `2026-04-30`) |
| `src/lib/nutrition-data/sources/usda/slice-overrides.ts` | v1 hand-reviewed entries |
| `src/lib/nutrition-data/sources/usda/slice-inference.ts` | Category and allergen inference |
| `src/lib/nutrition-data/sources/usda/slice-builder.ts` | Merge overrides + full release |
| `src/lib/nutrition-data/sources/usda/adaptor.ts` | v1, v2, and v3 import bundles |
| `src/lib/biological-os/candidate-set.ts` | Foundation slot proxies when a slot has no foods |

---

## After import checklist

1. `pnpm validate:requirements` reports eligible.
2. Re-run engine against DB with allowlisted account (`docs/INTERNAL_ENGINE_TEST.md`).
3. Spot-check inferred categories for high-risk allergens (fish, milk, gluten, nuts).
4. Confirm matrix snapshot shows `foodDatasetVersion = 2026-04-30-production-slice-v3`.
