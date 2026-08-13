# Food data expansion

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Status:** USDA Foundation slice v2 implemented in code; DB import is a separate step  
**Last updated:** 2026-08-13  

This document records how the Biological OS food matrix grows beyond the original 26-food production slice, and which external databases are explicitly excluded.

---

## Production slice versions

| Slice version | Foods | Scope | Engine default |
|---------------|-------|-------|----------------|
| `2025-04-24-production-slice-v1` | 26 | Hand-reviewed Foundation subset | Retained for regression imports |
| `2025-04-24-production-slice-v2` | 340 | Full USDA Foundation Foods release `2025-04-24` | **Yes** (`APPROVED_FOOD_SOURCE_VERSION`) |

Official release file (local copy):

`content/imports/usda-foundation-release/FoodData_Central_foundation_food_json_2025-04-24.json`

Import:

```bash
pnpm import:usda
# or explicitly:
pnpm import:usda 2025-04-24-production-slice-v2
```

v1 remains importable for comparison:

```bash
pnpm import:usda 2025-04-24-production-slice-v1
```

---

## v2 mapping strategy

1. **Hand-reviewed overrides** from v1 (`slice-overrides.ts`) always win for their `fdcId`.
2. **Automatic inference** (`slice-inference.ts`) maps USDA `foodCategory` + description to:
   - `biologicalCategory` (internal slot)
   - `preparationState`
   - EU-14 allergen flags (structured only, no free-text parsing at runtime)
   - coarse `foodCategories` tags
3. Foods without a v1 override are inferred at import time. Review uncertain mappings in admin before customer rollout.

Known Foundation gaps (unchanged from v1 analysis): no liver, mussels, or real oysters in this release. Cod and salmon are present.

---

## Approved sources (production)

| Source | Dataset | License | Status |
|--------|---------|---------|--------|
| USDA FoodData Central | Foundation Foods only | CC0 1.0 | **APPROVED, imported** |
| EFSA | DRV 2017 summary report | Reproduction authorised with acknowledgement | **APPROVED, imported** (`efsa-drv-eu-2017-v2`, 29 nutrients) |

Only `dataType: Foundation` records pass the USDA adaptor. Branded Foods, SR Legacy, FNDDS, and Survey paths remain blocked in code.

**Nutrient catalog:** 34 fields per food (6 energy/macros + 28 micronutrients). Sodium and chromium are monitor-only until EFSA scalar rows exist.

---

## Rejected sources (do not import)

These databases are **not legally usable** for this product and must not be added to `FoodDataSource`, import scripts, or engine loaders.

| Source | Status | Reason |
|--------|--------|--------|
| **PhytoHub** | **REJECTED** | Licensing and redistribution terms are not compatible with commercial storage and display in this app |
| **FooDB** | **REJECTED** | Same as PhytoHub; no verified commercial reuse path |
| `fixture-v1` | REJECTED | Dev-only test fixture |
| LLM-generated nutrient tables | REJECTED | Prohibited by project rules |
| Blogs, Cronometer, MyFitnessPal, etc. | REJECTED | Not authoritative |

Do not substitute PhytoHub or FooDB with unofficial scrapes or mirrors. If phytonutrient coverage is needed later, evaluate **USDA Special Interest** releases under a separate legal audit, not third-party aggregators.

---

## Future candidates (not in v2)

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
| `src/lib/nutrition-data/sources/usda/slice-overrides.ts` | v1 hand-reviewed entries |
| `src/lib/nutrition-data/sources/usda/slice-inference.ts` | Category and allergen inference |
| `src/lib/nutrition-data/sources/usda/slice-builder.ts` | Merge overrides + full release |
| `src/lib/nutrition-data/sources/usda/adaptor.ts` | v1 and v2 import bundles |
| `src/lib/biological-os/constants.ts` | `APPROVED_FOOD_SOURCE_VERSION` |

---

## After import checklist

1. `pnpm validate:requirements` reports eligible.
2. Re-run engine against DB with allowlisted account (`docs/INTERNAL_ENGINE_TEST.md`).
3. Spot-check inferred categories for high-risk allergens (fish, milk, gluten, nuts).
4. Confirm matrix snapshot shows `foodDatasetVersion = 2025-04-24-production-slice-v2`.
