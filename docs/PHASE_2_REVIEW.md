# Phase 2 review — Biological OS data foundation

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Review date:** 2026-08-12 (updated after USDA Foundation Foods import)  
**Migrations:** `20260812160000_phase2_data_foundation_complete`, `20260812180000_phase2_legal_compliance_gate`, `20260812200000_requirement_data_foundation`  

---

## Requirement data foundation (2026-08-12)

| Component | Status |
|-----------|--------|
| `RequirementSet` provenance fields | Implemented |
| `RequirementSourcePolicy` compliance gate | Implemented |
| EFSA EU production policy (`efsa-drv-eu-v1`) | **APPROVED** |
| Production requirement set (`efsa-drv-eu-2017-v1`) | **APPROVED** — 20 rows, 13 nutrients |
| NNR2023 / US DRI reference policies | Registered, not imported |
| Requirement importer | `src/lib/nutrition-data/requirements/importer.ts` |
| Import command | `pnpm import:efsa-requirements` |
| Age/sex/reference-type lookup | `src/lib/nutrition-data/requirements/lookup.ts` |
| EnergyMethod placeholder | `pending-energy-method`, `REVIEW_REQUIRED` |
| Dev fixture requirement set | `fixture-v1`, dev-only architecture validation |
| Approved production requirement set | **Yes** — EFSA 2017 summary report slice |

**Legal basis:** EFSA 2017 DRV Summary Report (e15121): "Reproduction is authorised provided the source is acknowledged." See `docs/REQUIREMENT_SOURCE_POLICY.md`.

**Validation:** `pnpm validate:requirements`

---

## Verdict: **Phase 2 COMPLETE**

Phase 2 data foundation is **complete** for food composition and requirement reference data.

**Phase 3 engine spike:** **COMPLETE.** The pure Biological OS optimizer pipeline exists in `src/lib/biological-os/`, is tested (31 engine tests, deterministic), and remains behind the feature flag.

**Phase 3 customer rollout:** **NOT READY.** DB persistence, API integration, remaining engine modules, broader food coverage, portal integration, and customer UX are still outstanding.

Customers still use the **legacy slot calculator** (`plan-engine.ts`). It is not removed or replaced in production paths.

Production gates pass for both USDA food data and EFSA requirement data. `BIOLOGICAL_OS_ENGINE` remains **`false`**.

---

## Final source decisions

| Source | Status | Production use |
|--------|--------|----------------|
| **USDA FoodData Central (Foundation Foods)** | **APPROVED** | **Imported** — slice `2025-04-24-production-slice-v2` (340 foods; see `docs/FOOD_DATA_EXPANSION.md`) |
| Fineli (CC BY 4.0) | REVIEW_REQUIRED | Not imported this phase |
| EuroFIR | FUTURE_OPTION | Not imported |
| NNR2023 numeric tables | REVIEW_REQUIRED | Not imported |
| EFSA DRV summary report (e15121) | **APPROVED** | **Imported** — 20 production requirement rows (`efsa-drv-eu-2017-v1`) |
| `fixture-v1` | REJECTED | Dev/test only (`devOnly=true`) |

**License basis (USDA):** CC0 1.0 Universal / public domain per [USDA FDC API guide](https://fdc.nal.usda.gov/api-guide.html). Import uses the official Foundation Foods release file only (`FoodData_Central_foundation_food_json_2025-04-24.json`). **Branded Foods, SR Legacy, Survey (FNDDS), and Experimental** records are blocked by the adaptor (`dataType` must be `Foundation`).

---

## Production import results (USDA Foundation Foods slice)

**Command:** `pnpm import:usda` (via `scripts/import-usda-slice.ts`)

| Metric | Value |
|--------|-------|
| **Source key** | `usda-fdc` |
| **Slice version** | `2025-04-24-production-slice-v1` |
| **Official release** | `FoodData_Central_foundation_food_json_2025-04-24.json` |
| **Release URL** | https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_json_2025-04-24.zip |
| **Registry dataset version** | `2025-04-24` |
| **Foods imported** | **26** |
| **Nutrient definitions** | **17** |
| **Import row count** | **348** |
| **Rows received** | 322 |
| **Rows imported** | 348 |
| **Rows rejected** | **0** |
| **Rows warning** | **0** |
| **Requirement records imported** | **20** (`efsa-drv-eu-2017-v1`, adults 18-49) |
| **`devOnly` on production foods** | `false` |

### Preparation-state coverage (26 production foods)

| State | Count (approx.) | Examples |
|-------|-----------------|----------|
| RAW | 18 | Eggs, salmon, broccoli, olive oil, garlic |
| DRIED | 3 | Oats, sunflower seeds, pumpkin seeds |
| BAKED | 1 | Whole wheat bread |
| ROASTED | 1 | Chicken breast, cooked |
| OTHER | 1 | Yogurt, plain whole milk |
| CANNED / FERMENTED / BOILED | 0 in slice | Not present in selected Foundation records |

### Allergen tagging (production USDA foods)

Structured tags applied where declared in slice config: **egg**, **fish**, **milk**, **gluten** (7 allergen rows across 6 foods). Shellfish/mollusc tags not used because **no bivalve Foundation records** exist in this release slice.

### Provenance coverage

Each imported food retains:

- `source=usda-fdc`
- `sourceVersion=2025-04-24-production-slice-v1`
- `externalId=fdc-{fdcId}` (USDA FDC ID)
- `foodDataSourceId` → APPROVED registry row
- `sourceImportId` → import audit row
- `reviewStatus=REVIEW_REQUIRED` (dietitian review of catalog, not license)

---

## Foundation Foods slice contents (26 foods)

Eggs, beef ground, lamb ground, bison ground, salmon (wild + farmed), sweet potato, potato, broccoli, kale, blueberries, blackberries, oats, whole wheat bread, apple, yogurt, olive oil, kiwi, mushrooms, tomato, garlic, sunflower seeds, pumpkin seeds, chicken breast (raw + cooked), turkey ground.

### Categories not in Foundation release (documented gaps)

The April 2025 Foundation Foods release does **not** include Foundation records for:

- Organ meats (e.g. liver)
- Sardines, mackerel
- Bivalves (oysters, mussels, clams)
- Sauerkraut, tomato paste, dried basil, black pepper
- Venison

These remain **out of scope** until Foundation records exist or a separate **legally approved** source is registered. SR Legacy / Branded substitutes were **not** imported.

---

## Verification results (2026-08-12)

| Check | Result |
|-------|--------|
| `pnpm typecheck` | **Pass** |
| `pnpm test` | **Pass** — 123 tests |
| `pnpm lint` | **Pre-existing errors** (portal hooks, unrelated to Phase 2 import) |
| `pnpm build` | **Pass** (local) |
| Compliance gate tests | **Pass** |
| USDA adaptor test | **Pass** |
| Production import | **Pass** — 0 rejected rows |
| `BIOLOGICAL_OS_ENGINE` | **Unchanged — false** |

---

## Product philosophy check

The Biological OS customer experience is **not** the legacy 13-slot output. The intended flow is:

**person → requirements → approved actual foods → minimal purposeful food set → nutrient coverage → add/remove food → redundancy assessment → KEEP BOTH / REMOVE / REVIEW → recalculation**

The 13 biological categories are **internal candidate scaffolding only**. Customers should ultimately see actual foods (eggs, oats, salmon, broccoli), not slot labels ("slot 1", "tubers", "category 7").

| Requirement | Status |
|-------------|--------|
| Actual foods in database (not only 13 categories) | **Yes** — 26 named Foundation foods |
| 13 categories as internal scaffold | **Yes** — `BiologicalCategoryFood` links |
| Source compliance gate in code | **Yes** — `compliance-gate.ts` |
| Dev fixture blocked from production | **Yes** — `fixture-v1` REJECTED + `devOnly` |
| Approved requirement set | **Yes** — `efsa-drv-eu-2017-v1` |
| Engine spike (pure library) | **Yes** — `src/lib/biological-os/` (31 tests, deterministic) |
| Customer Biological OS product | **No** — portal still uses legacy slot calculator |
| Legacy slot calculator for customers | **Still active** — not removed |

The current USDA production slice is real and approved, but intentionally limited. Some biological categories and foods are not represented (organ meat, bivalves, and others documented below). The engine must report infeasible or missing-category conditions rather than inventing coverage.

---

## Phase 3 entry criteria

### Data foundation (Phase 2 — complete)

- [x] At least one `FoodDataSource` `APPROVED`, not dev-only
- [x] At least one `RequirementSet` `APPROVED`, not dev-only (`efsa-drv-eu-2017-v1`)
- [x] Implemented adaptor imports real Foundation Foods catalog slice
- [x] Legal basis documented for USDA Foundation Foods (CC0)
- [x] Legal basis documented for EFSA 2017 summary report (e15121 reuse terms)
- [x] Production gate / compliance tests pass
- [x] `pnpm validate:requirements` passes

### Engine spike (Phase 3 library — complete)

- [x] Pure-library optimizer pipeline in `src/lib/biological-os/`
- [x] Requirement resolution, contribution/coverage, minimal set optimizer, add/remove recalculation, redundancy handling, versioned matrix snapshot (in memory)
- [x] Deterministic engine tests (31 tests in `src/lib/biological-os/__tests__/`)

### Customer rollout (Phase 3 product — not ready)

- [ ] DB persistence of `FoodMatrixVersion` / engine snapshots
- [ ] Production API/server wrapper for engine pipeline
- [ ] Remaining engine modules (`energy.ts`, `activity-profile.ts`, `meal-distribution.ts`, `measurement-present.ts`, `rotation-builder.ts`, `grocery-builder.ts`)
- [ ] Broader approved food catalog for complete 13-category coverage where Foundation Foods gaps remain
- [ ] Portal / quiz / PDF integration
- [ ] Explicit authorization to set `BIOLOGICAL_OS_ENGINE=true` for allowlisted internal testing

---

## Remaining gaps before customer Biological OS rollout

1. ~~**Approved requirement set**~~ **Done** — EFSA 2017 summary report slice imported
2. ~~**Engine spike (pure library)**~~ **Done** — `src/lib/biological-os/` with 31 tests
3. **Foundation coverage gaps** (organ meat, fatty fish beyond salmon, bivalves) or documented alternate approved sources
4. **Customer integration** — DB persistence, API wrapper, portal/quiz/PDF flows
5. **Remaining engine modules** — energy, activity profile, meal distribution, rotation, grocery builder

---

## Final status (2026-08-12)

### PHASE 2 — COMPLETE

**Production food data:** USDA Foundation Foods, approved production slice (`usda-fdc`, `2025-04-24-production-slice-v2`, 340 foods). v1 (26 foods) remains importable for regression. PhytoHub and FooDB are **REJECTED** (see `docs/FOOD_DATA_EXPANSION.md`).

**Production requirement data:** EFSA DRV 2017 summary framework, approved production slice (`efsa-drv-eu-2017-v1`, 20 rows, 13 nutrients).

**Validation:** 123 tests passing, typecheck passing, production build passing locally, `pnpm validate:requirements` passing.

### PHASE 3 ENGINE SPIKE — COMPLETE

Core pure-library Biological OS optimizer pipeline implemented and tested in `src/lib/biological-os/`.

### PHASE 3 CUSTOMER PRODUCT — IN PROGRESS

Customer integration is not complete. Portal, API persistence, remaining modules, and broader catalog work are outstanding.

**Feature flag:** `BIOLOGICAL_OS_ENGINE=false`

**Legacy customer calculator:** Still active (`plan-engine.ts`).

---

## Related documents

- `docs/INTERNAL_ENGINE_TEST.md` — allowlist test runbook for the engine spike
- `docs/DATA_SOURCE_DECISION.md`
- `docs/BIOLOGICAL_OS_DATA_SPEC.md`
- `docs/DATA_PROVENANCE_AND_NUTRIENT_MODEL.md`
- `docs/REQUIREMENT_SOURCE_POLICY.md`
- `docs/REQUIREMENT_DATA_VALIDATION.md`
