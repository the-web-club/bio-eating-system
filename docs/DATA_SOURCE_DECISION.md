# Data source decision record

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Status:** Final for Phase 2 finalization (legal gate + USDA production slice)  
**Date:** 2026-08-12  

This document records authoritative sources for food composition and nutrient requirements. **Only rows marked `APPROVED` with all compliance booleans true may power production imports.** The production importer enforces this in code via `src/lib/nutrition-data/compliance-gate.ts`.

---

## Final decision summary

| Area | Production decision today | Reason |
|------|---------------------------|--------|
| Food composition (primary) | **APPROVED + IMPORTED: USDA Foundation Foods** | Full Foundation release `2025-04-24` (340 foods) via slice `2025-04-24-production-slice-v2`; CC0 basis |
| Food composition (regional) | **REVIEW_REQUIRED: Fineli** | CC BY 4.0 terms appear permissive with attribution, but not imported in Phase 2 slice |
| EU harmonization | **FUTURE_OPTION: EuroFIR** | Membership/redistribution rights not verified |
| Nutrient requirements | **APPROVED + IMPORTED: EFSA DRV 2017** | 20 rows, adults 18-49, policy `efsa-drv-eu-v1` |
| Development/testing only | **REJECTED: fixture-v1** | Dev-only fixture; production gate blocks it |

---

## Source evaluation table

| Source | Dataset | Version | License | Commercial | Storage | Transform | Display | Redistribute | Official terms URL | Verified | Status | Reason |
|--------|---------|---------|---------|------------|---------|-----------|---------|--------------|-------------------|----------|--------|--------|
| **USDA FoodData Central** | Foundation Foods production slice | `2025-04-24` / slice `2025-04-24-production-slice-v2` | CC0 1.0 Universal (public domain) | yes | yes | yes | yes | yes | https://fdc.nal.usda.gov/api-guide.html | 2026-08-13 | **APPROVED — IMPORTED** | Official Foundation Foods release only; Branded/SR Legacy blocked in adaptor |
| **Fineli** | Fineli composition DB | Current release (not imported) | CC BY 4.0 | yes | yes | yes | yes | yes | https://fineli.fi/fineli/en/avoin-data | 2026-08-12 | **REVIEW_REQUIRED** | Terms appear permissive; THL endorsement clause requires product copy review; not used in Phase 2 |
| **EuroFIR / FoodEXplorer** | FoodEXplorer | Membership-dependent | Unverified membership terms | no | no | no | no | no | https://www.eurofir.org/ | — | **FUTURE_OPTION** | Commercial redistribution not confirmed |
| **NNR2023** | Nordic Nutrition Recommendations 2023 | 2023 | Publication copyright | no | no | no | no | no | https://nordicnutrition.org/ | — | **REVIEW_REQUIRED** | Numeric table commercial redistribution not verified |
| **EFSA DRVs** | DRV summary report | 2017-e15121 | Document copyright: reproduction authorised with acknowledgement | yes | yes | yes | yes | yes | https://www.efsa.europa.eu/en/legalnotice | 2026-08-12 | **APPROVED — IMPORTED** | Official summary report e15121 only |
| **fixture-v1** | `content/fixtures/food-source-fixture-v1.json` | `2026.08.12` | DEV_ONLY internal | no | no | no | no | no | n/a | — | **REJECTED** | Six-food test fixture only |

---

## USDA FoodData Central (APPROVED)

| Field | Value |
|-------|-------|
| Source | USDA FoodData Central |
| Provider | USDA ARS |
| Dataset | Foundation Foods (full release production slice) |
| Dataset version | `2025-04-24` |
| Slice version | `2025-04-24-production-slice-v2` (340 foods; v1 26-food slice retained for regression) |
| License | CC0 1.0 Universal (public domain) |
| License URL | https://creativecommons.org/publicdomain/zero/1.0/ |
| Terms URL | https://fdc.nal.usda.gov/api-guide.html |
| Source URL | https://fdc.nal.usda.gov/download-datasets.html |
| Attribution | U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2019. fdc.nal.usda.gov. |
| Verification method | Official terms review (`phase2-legal-review`) |
| Verification date | 2026-08-12 |

**Important:** Only FDC records covered by the FDC licensing statement are imported. Linked third-party pages do not inherit CC0 automatically.

---

## Rejected / not imported sources

| Source | Status | Reason |
|--------|--------|--------|
| **PhytoHub** | **REJECTED** | Not legally usable for commercial storage, transformation, or display in this product |
| **FooDB** | **REJECTED** | Same as PhytoHub; no verified commercial reuse path |
| `fixture-v1` | REJECTED | Dev-only; cannot pass production compliance gate |
| EuroFIR | FUTURE_OPTION | No verified commercial redistribution |
| NNR2023 numeric tables | REVIEW_REQUIRED | No verified commercial numeric reuse |
| Unofficial EFSA table scrape (non-summary sources) | REJECTED | Only official e15121 summary report approved for production import |
| Blogs, MyFitnessPal, Cronometer, commercial websites | REJECTED | Not authoritative; licensing unknown |
| LLM-generated nutrient tables | REJECTED | Prohibited by project rules |

---

## Requirement architecture (Phase 2)

- Food composition and nutrient requirements remain **separate**.
- `RequirementSet` is versioned per jurisdiction/source with provenance fields (`source`, `sourceVersion`, `sourceUrl`, `termsUrl`, `reviewStatus`, `devOnly`).
- `RequirementSourcePolicy` registers EFSA EU (V1 candidate), NNR2023, and US DRI as separate policies.
- **Production requirement set imported:** `efsa-drv-eu-2017-v1` (EFSA 2017 summary report, adults 18-49).
- Conflicting frameworks must never be averaged; conflicts are stored in `RequirementConflict`.
- See `docs/REQUIREMENT_SOURCE_POLICY.md` and `docs/REQUIREMENT_DATA_VALIDATION.md`.

---

## Requirement import enforcement

Requirement import fails for production unless all are true on `RequirementSourcePolicy`:

- `reviewStatus = APPROVED`
- `devOnly = false`
- `licenseVerified = true`
- all five reuse permission booleans true
- `termsVerifiedAt` and `termsUrl` present
- `sourceUrl` present

Implemented in:

- `src/lib/nutrition-data/requirements/compliance-gate.ts`
- `src/lib/nutrition-data/requirements/importer.ts`

---

## Production import enforcement

Import fails unless all are true on `FoodDataSource`:

- `status = APPROVED`
- `devOnly = false`
- `licenseVerified = true`
- `commercialUseAllowed = true`
- `storageAllowed = true`
- `transformationAllowed = true`
- `customerDisplayAllowed = true`
- `redistributionAllowed = true`
- `termsVerifiedAt` present
- `termsUrl` present

Implemented in:

- `src/lib/nutrition-data/compliance-gate.ts`
- `src/lib/nutrition-data/import-pipeline.ts`

---

## Implementation status

| Component | Status |
|-----------|--------|
| Compliance gate (code) | Implemented |
| `FoodDataSource` registry with compliance fields | Implemented |
| `/admin/data-sources` compliance table | Implemented |
| USDA adaptor + Foundation slice import | **Implemented and imported (26 foods)** |
| Fineli adaptor | Stub only (not imported) |
| EuroFIR adaptor | Stub only |
| Requirement production import | **Imported** — `efsa-drv-eu-2017-v1` (20 rows) |
| Requirement validation script | **`pnpm validate:requirements`** |
| Phase 3 engine spike (`src/lib/biological-os/`) | **Complete** — pure library, 31 tests, not wired to customer paths |
| `BIOLOGICAL_OS_ENGINE` | Remains **false** |
| Legacy slot calculator (`plan-engine.ts`) | **Still active** for customers |

---

## Related documents

- `docs/DATA_PROVENANCE_AND_NUTRIENT_MODEL.md`
- `docs/BIOLOGICAL_OS_DATA_SPEC.md`
- `docs/PHASE_2_REVIEW.md`
