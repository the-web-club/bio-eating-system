# Biological OS data specification

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Status:** Draft for review, aligned with production architecture as of 2026-08-13  
**Authority:** Final Master Cursor Specification > `rules.md` > this document > `docs/IMPLEMENTATION_PLAN.md`  
**Companion:** `docs/DATA_PROVENANCE_AND_NUTRIENT_MODEL.md`  

This document defines the **data shapes, semantics, and engine contracts** for Biological OS.

**Architecture vs current data:** The normalized food model, compliance gate, multi-source adaptor registry, and engine pipeline are production-capable. The **current approved production import** is USDA Foundation Foods slice v3 (363 foods) plus EFSA DRV v2. That slice size is a **current data limitation**, not an architecture limitation. Additional approved sources attach through the same import pipeline without engine rewrites.

**Review gate:** No production nutrition path may ship until a registered dietitian and legal review sign off the companion provenance document and the approved food universe.

---

## Product north star

The Biological OS answers one question:

> What is the smallest practical set of **actual foods** this person needs to cover their **defined nutritional requirements**, without unnecessary redundancy, while still allowing foods they explicitly choose to keep?

The 13 biological categories are **internal scaffolding**, not the customer-facing food list. The customer's approved matrix may look radically different from the starting categories.

Preference hierarchy (highest first):

1. Safety / hard exclusions  
2. Defined nutritional adequacy  
3. Essential nutrient coverage  
4. Professionally defined diversity constraints  
5. Minimize unnecessary redundancy  
6. User preference (including intentional redundancy)  
7. Practicality  
8. Variety / rotation  

If a user chooses **KEEP BOTH** when oats and bread overlap, **both remain**. The optimizer must never silently remove an explicitly retained food.

---

## 1. Purpose and scope

Biological OS outputs an **approved actual-food matrix** per person, not internal slot labels. The data layer must support:

1. Deterministic nutrient contribution math from structured food portions.
2. Requirement comparison (gap/surplus), not pass/fail medical styling.
3. Allergen hard exclusion from structured enums only.
4. User preference layers that never override safety exclusions.
5. A future optimizer that selects a minimum food set under constraints (contract only in this document).
6. Versioned snapshots from onboarding through approval, meals, rotation, and PDFs.

**Out of scope here:** optimizer implementation, UI copy, health claims, recipe prose, energy formula selection.

---

## 2. Canonical units and identifiers

| Concept | Rule |
|---------|------|
| Internal mass | Grams (`g`) for all portion math |
| Internal nutrient storage | Per `perAmountG` basis (default 100 g edible portion) |
| Food identity | Stable internal UUID (`Food.id`) plus source-scoped external id |
| Nutrient identity | Stable internal code (`Nutrient.code`), not display name |
| Biological category | One of 13 slugs aligned with `FOOD_SLOTS` in `src/lib/nutrition/plan-engine.ts` |
| Declared allergen | EU 14 subset already used in intake (`DeclaredAllergen` enum) |

Presentation units (household, imperial, hand) are **display-only** and never stored as the canonical portion in engine math.

---

## 3. Food schema

### 3.1 Entity: `Food`

Represents one row in the **approved food universe** once `reviewStatus = approved` and `active = true`.

| Field | Type | Required | Semantics |
|-------|------|----------|-----------|
| `id` | UUID | yes | Internal primary key |
| `externalId` | string | yes | Id within import source (e.g. USDA FDC id, Fineli id, fixture slug) |
| `source` | string | yes | Import source key (see provenance doc) |
| `sourceVersion` | string | yes | Immutable release tag of that source snapshot |
| `name` | string | yes | Canonical display name (sentence case in UI) |
| `preparationStateId` | FK | yes (proposed) | Which preparation state nutrient rows refer to |
| `ediblePortionFactor` | float 0–1 | optional | Fraction of as-purchased weight that is edible; default 1 until reviewed |
| `reviewStatus` | enum | yes (proposed) | `draft` \| `reviewed` \| `approved` |
| `active` | boolean | yes | Soft hide without deleting history |
| `approvedAt` | datetime | when approved | Audit |
| `approvedBy` | string | when approved | Reviewer id or name |

**Current database (20260812140000):** `Food` exists without `preparationStateId`, `ediblePortionFactor`, `reviewStatus`, `approvedAt`, or `approvedBy`. Treat current rows as **engineering fixtures only**.

### 3.2 Entity: `FoodCategory` / `FoodCategoryMap`

Cross-cutting taxonomy (e.g. `seafood`, `starch`) for browsing and admin filters. **Not** the same as biological category.

| Field | Semantics |
|-------|-----------|
| `FoodCategory.slug` | Stable slug |
| `FoodCategoryMap` | Many-to-many link |

### 3.3 Entity: `BiologicalCategory` / `BiologicalCategoryDefault`

Maps each of the 13 internal categories to **ranked candidate foods** for optimizer seeding.

| Field | Semantics |
|-------|-----------|
| `BiologicalCategory.slug` | One of 13 enum values |
| `BiologicalCategoryDefault.rank` | Lower = preferred default candidate |
| `BiologicalCategoryDefault.foodId` | Must reference an approved food in production |

**Rule:** Biological category is philosophy, not the customer-facing final list. Optimizer and user choices produce the actual matrix.

---

## 4. Nutrient schema

### 4.1 Entity: `Nutrient`

| Field | Type | Semantics |
|-------|------|-----------|
| `code` | string | Stable key, e.g. `protein`, `iron`, `vitamin_a` |
| `name` | string | Human label; not used in math |
| `unit` | enum | `g` \| `mg` \| `mcg` \| `kcal` \| `iu` |
| `requirementKind` | enum (proposed) | See companion doc: `reference_intake`, `adequate_intake`, `upper_limit`, `informational` |

**NEEDS PROFESSIONAL REVIEW:** Full nutrient catalogue, units, and which nutrients the optimizer must satisfy vs monitor only.

### 4.2 Entity: `FoodNutrient` (contribution row)

| Field | Semantics |
|-------|-----------|
| `foodId` | Parent food |
| `nutrientId` | Which nutrient |
| `amount` | Quantity in `Nutrient.unit` |
| `perAmountG` | Denominator grams (typically 100 g edible) |
| `source` | Copied from import source key |
| `sourceVersion` | Copied from import release |
| `preparationStateId` | (proposed) Must match parent food's preparation state |

**Contribution formula (deterministic):**

```
contribution = (amount / perAmountG) * portionGrams * ediblePortionFactor
```

No bioavailability adjustment in code unless a future reviewed factor table is added explicitly in the provenance doc.

---

## 5. Food → nutrient contribution

### 5.1 Pure function contract

Module: `src/lib/nutrition/contribution.ts` (exists, version `contribution-0.1.0`)

| Input | Description |
|-------|-------------|
| `portions[]` | `{ foodId, grams }` edible grams |
| `profiles` | Map of foodId → nutrient rows with source metadata |

| Output | Description |
|--------|-------------|
| `totals[]` | `{ nutrientCode, unit, total }` summed across portions |

**Rules:**

1. Same inputs → same outputs (no clock, no randomness).
2. Zero or negative portion grams contribute zero.
3. Missing nutrient row for a food means zero contribution for that nutrient (not an error unless optimizer requires complete coverage metadata).

### 5.2 Coverage function contract

Module: `src/lib/nutrition/coverage.ts` (exists, version `coverage-0.1.0`)

Compares totals to daily requirements and returns `gap` and `surplus` per nutrient. Removal analysis uses `nutrientDeltaOnRemoval` and `gapsFromRemoval`.

**Rule:** Coverage is informational for planning. It must not render as medical pass/fail UI (see `rules.md` §4.4).

---

## 6. Allergen mapping

### 6.1 Declared allergens (user intake)

Structured enum only: `DeclaredAllergen` on `IntakeProfile.declaredAllergens`. Free text is never parsed for exclusion (`rules.md` §4.1).

### 6.2 Food allergens (catalog)

Entity: `FoodAllergen` — many-to-many `Food` ↔ `DeclaredAllergen`.

**Hard exclusion rule:** If user declares allergen `A`, every food with `FoodAllergen.allergen = A` is removed from:

- Optimizer candidate set
- Substitution suggestions
- Approved matrix auto-additions
- Rotation and grocery outputs

### 6.3 Legacy slot mapping (transitional)

`plan-engine.ts` maps some allergens to **slots** (`ALLERGEN_TO_SLOTS`). During migration, food-level mapping is authoritative; slot mapping remains only for the legacy engine behind `LEGACY_SLOT_ENGINE`.

| Declared allergen | Legacy slot impact (transitional) |
|-------------------|-----------------------------------|
| `egg` | `eggs` |
| `fish` | `small_fish` |
| `crustaceans`, `molluscs` | `bivalves` |
| `sulphites` | `fermented` |

**NEEDS PROFESSIONAL REVIEW:** Complete food-level allergen tags for every approved food.

### 6.4 Unresolved allergies

Entity (proposed): `UnresolvedAllergy` — user free-text or "other" queue for human review. **Does not** auto-exclude foods until resolved to structured enum by staff.

---

## 7. Substitution candidates

Entity: `FoodSubstitution`

| Field | Semantics |
|-------|-----------|
| `fromFoodId` | Food being replaced |
| `toFoodId` | Candidate replacement |
| `rank` | Order for suggestions |
| `reasonTags` | Structured tags only, e.g. `iron`, `omega3`, `protein` — not prose |

**Rules:**

1. Substitutions must respect allergen hard exclusions.
2. Substitutions must not introduce foods outside the approved universe.
3. Optimizer may use substitutions as edges; user retains final approval.

**NEEDS PROFESSIONAL REVIEW:** Which substitutions are clinically appropriate.

---

## 8. Preference and exclusion semantics

Three layers, **strict precedence**:

| Layer | Type | Source | Effect |
|-------|------|--------|--------|
| 1 | **Hard exclusion** | `declaredAllergens`, resolved allergy policy | Food removed permanently from candidate set |
| 2 | **Hard preference** | User explicit remove / "never include" on a food id | Food removed unless user reverses in change loop |
| 3 | **Soft preference** | Favourites, likes, redundancy KEEP BOTH | Influences optimizer cost function and ranking; must not silently drop hard preferences |

### 8.1 Hard exclusion

- Allergen match → food forbidden.
- User removes food in matrix change loop → forbidden until re-added explicitly.
- Screening refusal does not remove foods; it caps energy strategy (`screening.ts`).

### 8.2 Hard preference

Entity (proposed): `FoodMatrixItem.preference` enum:

- `required` — user insists on keeping; optimizer must include unless infeasible
- `neutral` — default
- `excluded` — hard remove

### 8.3 Soft preference

Entity (proposed): `FavouriteFood` with rank; optimizer treats as lower cost to include, not mandatory.

**Rule:** Never silently remove a user-requested food. If optimizer drops a `required` item, return infeasible result (Section 12).

---

## 9. Redundancy model

Redundancy = multiple foods contributing overlapping nutrients (e.g. oats and bread).

### 9.1 Detection (contract only)

Module (future): `src/lib/biological-os/redundancy.ts`

| Input | Overlap threshold |
|-------|-------------------|
| Pair of foods in matrix | TBD by dietitian — expressed as nutrient codes and % overlap, not invented here |

| Output | Description |
|--------|-------------|
| `RedundancyProposal` | `{ foodA, foodB, overlappingNutrients[], suggestedActions[] }` |

### 9.2 User decision (persistence)

Entity (proposed): `RedundancyChoice`

| Field | Semantics |
|-------|-----------|
| `foodMatrixVersionId` | Snapshot this choice applies to |
| `foodAId`, `foodBId` | Pair |
| `decision` | `keep_both` \| `remove_a` \| `remove_b` \| `review` |
| `decidedAt` | Audit |

**UI semantics (from master spec):**

- **KEEP BOTH** — intentional redundancy recorded; no auto removal.
- **REMOVE** — drop one food; trigger recalc and coverage diff.
- **REVIEW** — no automatic change; coach or user follows up.

---

## 10. Approved food universe

Production optimizer, portal, email, and PDF paths may only reference foods where:

```
Food.reviewStatus = approved
AND Food.active = true
AND Food.source/sourceVersion matches an approved import row
AND all FoodNutrient rows carry source metadata
```

### 10.1 Fixture vs production

| Source key | Purpose | Production use |
|------------|---------|----------------|
| `fixture-v1` | Engineering and tests | **Forbidden** |
| TBD (USDA, Fineli, etc.) | Authoritative catalog | After legal + dietitian sign-off |

Entity (proposed): `ApprovedSourceRegistry` — lists which `(source, sourceVersion)` pairs are production-eligible.

---

## 11. Optimizer inputs and outputs (contract only)

**Do not implement** until this spec and the provenance doc are approved.

### 11.1 Inputs

| Input | Source |
|-------|--------|
| `BiologicalOsProfile` | Age, sex, height, weight, activity entries, goal, protein preference, meal count, measurement preference |
| `RequirementSet` version | Approved reference set id |
| `DailyRequirement[]` | From `requirements.ts` |
| `candidateFoods[]` | From biological category defaults + favourites, minus hard exclusions |
| `FoodNutrient` rows | Approved universe only |
| `RedundancyChoice[]` | Prior decisions |
| `EnergyTarget` | From versioned energy module (TBD separately) |
| `constraintVersion` | String stamp for reproducibility |

### 11.2 Outputs

| Output | Description |
|--------|-------------|
| `FoodMatrixDraft` | List of `{ foodId, biologicalCategorySlug?, portionGrams?, preference }` |
| `coverageReport` | Per-nutrient gap/surplus at draft portions |
| `changeReasons[]` | Structured codes why each food entered set |
| `engineVersion` | Optimizer version string |
| `dataVersions` | `{ foodSource, requirementSet, constraintVersion }` |
| `status` | `ok` \| `infeasible` \| `maintenance_only` (if screening blocks deficit) |

### 11.3 Determinism

Same inputs + same data versions → identical JSON output.

---

## 12. Infeasible and no-solution handling

| Condition | System behaviour |
|-----------|------------------|
| Hard exclusions remove all candidates for a biological category | `status = infeasible`, reason `no_candidate_for_category` |
| Required user food cannot fit energy + requirement constraints | `status = infeasible`, reason `required_food_infeasible` |
| Coverage gaps remain after optimizer pass | `status = infeasible`, reason `uncovered_nutrients`, list nutrient codes |
| Screening blocks deficit | Generate at maintenance energy; surface screening reasons (existing gate) |
| Unresolved allergy on intake | Policy TBD — default **exclude no foods** until resolved; block auto-optimizer only |

**Never:** silently drop a required food, silently shrink portions below reviewed floors, or fill gaps with model-generated foods.

**User messaging:** Plain language, no diagnosis. State what could not be satisfied and offer change loop or coach contact.

---

## 13. Customer food matrix (proposed entities)

### 13.1 `FoodMatrixVersion`

| Field | Semantics |
|-------|-----------|
| `userId` | Owner |
| `version` | Monotonic integer |
| `status` | `draft` \| `pending_approval` \| `approved` \| `superseded` |
| `engineVersion` | Optimizer or manual edit stamp |
| `dataVersions` | JSON blob of source + requirement versions |
| `approvedAt` | When user confirmed |

### 13.2 `FoodMatrixItem`

| Field | Semantics |
|-------|-----------|
| `matrixVersionId` | Parent |
| `foodId` | Actual food |
| `biologicalCategorySlug` | Optional trace back to category |
| `portionGrams` | Canonical edible grams after approval |
| `preference` | `required` \| `neutral` \| `excluded` |
| `sortOrder` | Display |

Meals, recipes, rotation, and grocery lists **must** reference an **approved** matrix version only.

---

## 14. Future 52-week rotation inputs

Rotation consumes **approved matrix + approved rotation week table**, not slots.

### 14.1 Entity (proposed): `RotationWeek`

| Field | Semantics |
|-------|-----------|
| `weekNumber` | 1–52 |
| `reviewStatus` | `draft` \| `approved` |
| `effectiveFrom` | Optional scheduling |

### 14.2 Entity (proposed): `RotationWeekAssignment`

| Field | Semantics |
|-------|-----------|
| `rotationWeekId` | Week |
| `userId` | Owner |
| `foodMatrixVersionId` | Which approved matrix |
| `assignments` | JSON or normalized rows: `{ biologicalCategorySlug, foodId, portionGrams }` |

**Rules:**

1. Only foods in the user's approved matrix may appear.
2. Weeks without `reviewStatus = approved` show honest "in preparation" empty state.
3. Email and PDF use actual food names from matrix, not slot labels.

**NEEDS PROFESSIONAL REVIEW:** Week content authorship and validation workflow.

---

## 15. Schema and migration proposal (for review)

### 15.1 Already applied (baseline)

Migration `20260812140000_nutrition_data_layer` created:

- `Nutrient`, `Food`, `FoodNutrient`, `FoodAllergen`
- `FoodCategory`, `FoodCategoryMap`, `FoodSubstitution`
- `FoodSourceImport`, `RequirementSet`, `NutrientRequirement`
- `BiologicalCategory`, `BiologicalCategoryDefault`

**Gap:** This migration landed before this spec existed. Fixture data in `content/fixtures/food-source-fixture-v1.json` is **not** authoritative and must not be used for production claims.

### 15.2 Proposed migration `20260813XXXXXX_biological_os_data_spec` (not applied)

**Add tables**

| Table | Purpose |
|-------|---------|
| `PreparationState` | `slug`, `name`, `descriptionKey` (content lookup) |
| `ApprovedSourceRegistry` | Production-eligible `(source, sourceVersion)` |
| `FoodMatrixVersion` | Versioned customer matrix |
| `FoodMatrixItem` | Foods in a matrix |
| `RedundancyChoice` | KEEP BOTH / REMOVE / REVIEW decisions |
| `FavouriteFood` | Soft preference list |
| `UnresolvedAllergy` | Coach review queue |
| `RotationWeek` | 52-week scaffold |
| `RotationWeekAssignment` | Per-user week content |

**Alter tables**

| Table | Change |
|-------|--------|
| `Food` | Add `preparationStateId`, `ediblePortionFactor`, `reviewStatus`, `approvedAt`, `approvedBy` |
| `FoodNutrient` | Add `preparationStateId` (FK), optional `derivationNote` for audit |
| `Nutrient` | Add `requirementKind` enum |
| `NutrientRequirement` | Add `requirementType` (`rda`, `ai`, `ul`, `informational`), `lifeStage` tag optional |
| `RequirementSet` | Add `authority` (e.g. `EFSA DRV 2017`) — text reference only, no values in code |

**Do not migrate yet:** Await sign-off on this spec and the provenance doc.

### 15.3 Rollout order (after approval)

1. Add `PreparationState` + alter `Food` / `FoodNutrient`.
2. Add `ApprovedSourceRegistry`; mark `fixture-v1` as non-production.
3. Add customer matrix tables (`FoodMatrixVersion`, `FoodMatrixItem`, `RedundancyChoice`, `FavouriteFood`).
4. Add rotation scaffold tables (empty until content validated).
5. Import first **approved** external source under new registry rules.
6. Only then implement optimizer against approved universe.

### 15.4 Backward compatibility

- Legacy `GeneratedPlan.slots` JSON remains for `LEGACY_SLOT_ENGINE`.
- New engine writes `FoodMatrixVersion` rows; portal switches under `BIOLOGICAL_OS_ENGINE` flag.

---

## 16. Module map (target)

| Module | Status | Role |
|--------|--------|------|
| `src/lib/nutrition/contribution.ts` | Implemented | Portion → totals |
| `src/lib/nutrition/requirements.ts` | Implemented | Profile → daily targets |
| `src/lib/nutrition/coverage.ts` | Implemented | Gaps and removal deltas |
| `src/lib/nutrition-data/import-pipeline.ts` | Implemented | USDA + requirement import |
| `src/lib/biological-os/` (spike modules) | **Engine spike complete** | Pure-library optimizer pipeline; not wired to customer paths |
| `src/lib/biological-os/optimizer.ts` | **Spike complete** | Minimal set heuristic |
| `src/lib/biological-os/redundancy.ts` | **Spike complete** | Overlap detection + KEEP BOTH / REMOVE / REVIEW |

---

## 17. Open decisions (require product + dietitian)

1. Which external food database is authoritative for launch?
2. Which preparation states are in scope for v1 (raw, cooked, canned, drained)?
3. Full nutrient list for optimizer hard constraints vs soft monitors?
4. Unresolved allergy default policy during onboarding?
5. Overlap threshold for redundancy proposals?
6. Minimum portion floors per food category?

Do not resolve these in code until recorded in the provenance doc and signed off.

---

## 18. Related documents

- `docs/DATA_PROVENANCE_AND_NUTRIENT_MODEL.md` — sources, versions, requirements reference model
- `docs/PRODUCT_GAP_ANALYSIS.md` — current vs target
- `docs/IMPLEMENTATION_PLAN.md` — phased delivery (optimizer = Phase 3)
