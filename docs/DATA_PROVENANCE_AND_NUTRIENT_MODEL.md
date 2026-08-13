# Data provenance and nutrient model

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Status:** Draft for review  
**Authority:** Final Master Cursor Specification > `rules.md` > this document  
**Companion:** `docs/BIOLOGICAL_OS_DATA_SPEC.md`  

This document defines **where nutrition numbers come from**, how they are versioned, how preparation affects composition rows, and how requirement/reference values are typed and interpreted.

**This document does not contain nutrition values.** All numeric reference data lives in reviewed import files or approved external databases, never hard-coded as product truth in application logic.

**NEEDS PROFESSIONAL REVIEW:** Every section marked with that label requires registered dietitian input and, where noted, legal review before production use.

---

## 1. Principles

1. **Provenance is mandatory.** Every `FoodNutrient` row stores `source` and `sourceVersion`. Rows without metadata must not enter the approved food universe.
2. **No invented numbers in code.** Constants in `plan-engine.ts` baseline grams and fixture JSON are engineering placeholders only.
3. **No health claims in generated copy.** Descriptive nutrient statements must come from an approved claims table authored outside the codebase (`rules.md` §4.3).
4. **Reference ranges are not targets.** Lab biomarker content stays reference-only; requirement values here are for **planning math only**, not diagnosis.
5. **Preparation matters.** A single food name can have multiple composition rows per preparation state; never mix states in one contribution row.
6. **Version stamps everywhere.** Optimizer outputs record `{ foodSource, requirementSet, preparationCatalog }` versions for audit.

---

## 2. Authoritative data sources (candidates, not selected)

Launch requires a written decision recorded in `ApprovedSourceRegistry`. Candidates commonly evaluated for EU-facing products:

| Source | Role | Licensing / notes |
|--------|------|-------------------|
| **USDA FoodData Central** | Broad composition database | US public domain for data; verify attribution requirements |
| **Fineli (Finland)** | EU-facing foods, bilingual | License terms must be reviewed before import |
| **NEVO (Netherlands)** | EU reference | License review required |
| **CoFID (UK)** | Legacy UK reference | Post-Brexit use case needs legal review |
| **Manufacturer / lab analysis** | Branded or clinical items | Per-product agreement |

**Current repo state:** Only `fixture-v1` is imported (`content/fixtures/food-source-fixture-v1.json`). **Not authoritative.**

**Action for dietitian + legal:** Pick primary and fallback sources, document attribution strings for UI/PDF footers, and retention policy for snapshots.

---

## 3. Source, version, and provenance model

### 3.1 Source key (`source`)

Short stable identifier used in code and database, e.g. `usda-fdc`, `fineli`, `fixture-v1`.

### 3.2 Source version (`sourceVersion`)

Immutable tag for a imported snapshot, e.g. `fdc-2024-04`, `fineli-2024-1`, `2026.08.12-fixture`.

**Rule:** Never overwrite rows in place for a new release. Import a new `(source, sourceVersion)` pair and migrate approved foods forward through review.

### 3.3 Import audit row

Entity: `FoodSourceImport` (exists)

| Field | Semantics |
|-------|-----------|
| `source`, `sourceVersion` | Unique pair |
| `importDate` | When import ran |
| `rowCount` | Rows touched |
| `status` | `pending` \| `running` \| `completed` \| `failed` |
| `error` | Failure message without PII |

### 3.4 Proposed: `ApprovedSourceRegistry`

| Field | Semantics |
|-------|-----------|
| `source` | Source key |
| `sourceVersion` | Approved snapshot |
| `approvedForProduction` | boolean |
| `approvedAt`, `approvedBy` | Audit |
| `attributionText` | Footer/legal string |
| `licenseReference` | URL or contract id |

**Rule:** Optimizer and customer paths reject foods whose `(source, sourceVersion)` is not in this registry.

### 3.5 Row-level provenance

Each `FoodNutrient` carries:

| Field | Purpose |
|-------|---------|
| `source` | Which database |
| `sourceVersion` | Which snapshot |
| `derivationNote` (proposed) | Optional, e.g. `calculated`, `analyzed`, `label` |

**NEEDS PROFESSIONAL REVIEW:** Which derivation types are acceptable for which nutrients (e.g. fiber, folate forms).

---

## 4. Preparation states

Nutrient composition depends on preparation. The system models this explicitly rather than overloading the food name.

### 4.1 Entity (proposed): `PreparationState`

| Field | Semantics |
|-------|-----------|
| `slug` | e.g. `raw`, `boiled`, `baked`, `canned_drained`, `dry` |
| `name` | Display label |
| `descriptionContentKey` | Key into reviewed `content/` module for preparation guidance |

### 4.2 Link to food

Each `Food` row references exactly one `preparationStateId` for its nutrient rows.

If the same ingredient exists in multiple states (e.g. rice raw vs cooked), each state is a **separate `Food` row** with distinct `externalId` and nutrients.

### 4.3 Edible portion

| Field | Semantics |
|-------|-----------|
| `ediblePortionFactor` | Multiplier on as-purchased weight to edible weight |

**NEEDS PROFESSIONAL REVIEW:** Default factors and which foods require lab-specific yields.

### 4.4 Fixture convention

Fixture file names encode state in `externalId` suffix, e.g. `egg-whole-raw`, `potato-boiled`. This is a naming convention only, not a scientific claim.

---

## 5. Nutritional requirement and reference model

Requirements drive **coverage gaps** for planning. They do not diagnose deficiency or disease.

### 5.1 Entity: `RequirementSet` (exists)

| Field | Semantics |
|-------|-----------|
| `version` | e.g. `efsa-drv-2017`, `fixture-v1` |
| `status` | `draft` \| `reviewed` \| `approved` |
| `reviewer`, `reviewedAt` | Audit |

**Proposed add:** `authority` — citation string only (no embedded numbers).

### 5.2 Entity: `NutrientRequirement` (exists)

| Field | Semantics |
|-------|-----------|
| `nutrientId` | FK to `Nutrient` |
| `ageMin`, `ageMax` | Whole years inclusive |
| `sex` | `female` \| `male` \| null (both) |
| `value` | Numeric target for planning |
| `unit` | Must match nutrient unit |

**Proposed adds:**

| Field | Semantics |
|-------|-----------|
| `requirementType` | See Section 6 |
| `lifeStage` | Optional tag, e.g. `pregnancy`, `lactation` — only after explicit product scope |

### 5.3 Resolution algorithm (implemented)

Module: `src/lib/nutrition/requirements.ts` (`REQUIREMENT_ENGINE_VERSION = requirements-0.1.0`)

1. Filter rows by age range.
2. For each nutrient code, prefer sex-specific row over `sex = null`.
3. Return `{ nutrientCode, unit, value }[]`.

**NEEDS PROFESSIONAL REVIEW:** Conflict rules when multiple rows match (e.g. pregnancy overrides).

---

## 6. Requirement types and semantics

Each `NutrientRequirement` row must declare its **type**. The optimizer treats types differently.

| Type | Code | Optimizer semantics | UI semantics |
|------|------|---------------------|--------------|
| Population reference intake | `pri` | Target minimum unless upper bound conflicts | "Planning target" |
| Recommended dietary allowance | `rda` | Hard minimum target | "Planning target" |
| Adequate intake | `ai` | Target when no RDA; document uncertainty in content | "Planning target (estimated)" |
| Upper tolerable limit | `ul` | **Ceiling** — surplus above UL is flagged for review, not a goal | "Upper reference — not a target" |
| Informational | `informational` | Monitor only; does not block feasibility | "For your information" |
| Energy | `energy` | Handled by energy module, not micronutrient optimizer | Estimate framing |

**Rules:**

1. Never present UL as something to "hit" or progress toward.
2. Never present lab reference ranges as requirement targets (`rules.md` §4.4).
3. Gap/surplus copy is descriptive, not diagnostic.

**NEEDS PROFESSIONAL REVIEW:** Map each tracked nutrient to type and authoritative citation.

---

## 7. Nutrient catalogue model

### 7.1 Entity: `Nutrient` (exists)

| Field | Semantics |
|-------|-----------|
| `code` | Stable identifier |
| `name` | Display |
| `unit` | Canonical unit for math |

**Proposed add:** `requirementKind` default for the nutrient (informational vs constrained).

### 7.2 Tracked nutrient tiers (proposal structure only)

| Tier | Purpose | Examples (illustrative names only) |
|------|---------|-------------------------------------|
| **Tier A — optimizer hard constraints** | Must be covered or infeasible | TBD by dietitian |
| **Tier B — optimizer soft monitors** | Report gaps, may allow infeasible flag | TBD |
| **Tier C — informational** | Education only | TBD |

**No nutrient codes or values are assigned here.**

---

## 8. Import pipeline and adaptors

### 8.1 Adaptor interface (contract)

```
FoodSourceAdaptor {
  sourceKey: string
  listVersions(): Promise<string[]>
  fetch(version: string): Promise<FoodSourceBundle>
}
```

Bundle shape: validated by `src/lib/nutrition-data/schema.ts` (Zod).

### 8.2 Normalization rules

Module: `src/lib/nutrition-data/normalize.ts`

- Reject foods with nutrient codes not in bundle nutrient list.
- Reject substitutions pointing to unknown external ids.
- Count rows for audit.

### 8.3 Importer

- CLI: `pnpm import:food [path]` → `scripts/import-food-source.ts`
- Persists via `src/lib/nutrition-data/import-pipeline.ts`

**Rule:** Production imports run only after `ApprovedSourceRegistry` entry exists.

### 8.4 Fixture import (development only)

| Property | Value |
|----------|-------|
| Source | `fixture-v1` |
| File | `content/fixtures/food-source-fixture-v1.json` |
| Requirement set | `fixture-v1` with `status: draft` |
| Production | **Forbidden** |

Fixture numbers exist solely to test contribution and coverage math. They must be replaced before any customer-facing nutritional use.

---

## 9. Allergen and composition provenance

Food allergen tags are **structured data** separate from nutrient imports.

| Source of truth | Process |
|-----------------|---------|
| Composition | External food database import |
| Allergen tags | Dietitian-reviewed mapping table authored per food id |

**NEEDS PROFESSIONAL REVIEW:** Cross-reactivity policies, precautionary labelling, and sulphite thresholds are not encoded here.

Allergen enum aligns with intake `DeclaredAllergen` and EU 14 subset in `plan-engine.ts`.

---

## 10. Substitution provenance

`FoodSubstitution.reasonTags` hold **structured tokens** referencing nutrient codes or category roles, not free text.

Substitutions are authored in reviewed content or admin tooling, versioned with the food source release they were validated against.

---

## 11. Redundancy and overlap (nutrient model view)

Overlap is computed from **contribution totals**, not name similarity.

Proposed overlap definition for engine (thresholds TBD):

```
overlap(A,B) = { nutrientCode |
  min(contributionA, contributionB) / requirementTarget > TBD_threshold }
```

**NEEDS PROFESSIONAL REVIEW:** Thresholds and which nutrients count for redundancy (e.g. count fiber once, not both oats and bread).

---

## 12. Approved food universe (provenance gate)

A food enters the production universe when all are true:

1. Imported from an `ApprovedSourceRegistry` entry.
2. `Food.reviewStatus = approved` by named reviewer.
3. All nutrient rows share the same `preparationStateId` as the food.
4. Allergen tags reviewed for that food id.
5. Preparation guidance content key exists in `content/` with `status = approved`, or explicit waiver recorded in audit log.

---

## 13. Optimizer data dependencies (no implementation)

The optimizer may only read:

- Approved foods and nutrients (Section 12)
- Approved requirement set
- User profile and structured preferences (see data spec)
- Version stamps

It must write `dataVersions` onto `FoodMatrixVersion` for reproducibility.

Infeasible outcomes when coverage cannot satisfy **Tier A** nutrients under hard exclusions are documented in `docs/BIOLOGICAL_OS_DATA_SPEC.md` Section 12.

---

## 14. Future 52-week rotation provenance

Each `RotationWeek` row tracks:

| Field | Semantics |
|-------|-----------|
| `weekNumber` | 1–52 |
| `reviewStatus` | Content validation |
| `contentVersion` | Link to reviewed rotation content bundle |
| `reviewer`, `reviewedAt` | Audit |

Assignments reference **food ids from the user's approved matrix**, not global slot names.

Weeks without approved content must not emit email or PDF lines implying that week is complete.

---

## 15. Schema and migration proposal (provenance-focused)

See full entity list in `docs/BIOLOGICAL_OS_DATA_SPEC.md` Section 15. Provenance-specific changes:

### 15.1 New tables

| Table | Purpose |
|-------|---------|
| `PreparationState` | Preparation catalog |
| `ApprovedSourceRegistry` | Production source allowlist |
| `NutrientRequirementType` | Optional lookup if not enum column |

### 15.2 Column additions

| Table | Column | Purpose |
|-------|--------|---------|
| `Nutrient` | `requirementKind` | Default tier/type |
| `NutrientRequirement` | `requirementType` | `rda`, `ai`, `ul`, etc. |
| `RequirementSet` | `authority` | Citation string |
| `Food` | `preparationStateId`, `reviewStatus`, approval audit fields |
| `FoodNutrient` | `derivationNote` | Import audit |

### 15.3 Data migration notes

1. Mark all existing `fixture-v1` rows as `reviewStatus = draft`, `approvedForProduction = false`.
2. Do not delete fixture data; tests depend on it.
3. First production import creates parallel rows under new source keys; staff maps biological category defaults to new food ids.

**Status:** Proposal only — **not applied**.

---

## 16. Governance workflow

| Step | Owner | Output |
|------|-------|--------|
| 1 | Dietitian | Nutrient tier list and requirement type map |
| 2 | Legal | Source license + attribution text |
| 3 | Engineering | Import adaptor + registry entry |
| 4 | Dietitian | Approve food rows + allergen tags |
| 5 | Dietitian | Sign off requirement set version |
| 6 | Product | Enable `BIOLOGICAL_OS_ENGINE` for allowlisted users |

No step may be skipped for production.

---

## 17. Explicit non-goals

- Bioavailability adjustment factors unless added as reviewed data table
- LLM-generated nutrient values or requirement numbers
- Parsing free-text allergies or preferences
- Using lab biomarker results as plan inputs (future wearable module is read-only stub)

---

## 18. Related documents

- `docs/BIOLOGICAL_OS_DATA_SPEC.md` — entities, optimizer contract, redundancy UX
- `docs/IMPLEMENTATION_PLAN.md` — Phase 2 (data) and Phase 3 (optimizer)
- `docs/PRODUCT_GAP_ANALYSIS.md` — Professional review gate table
