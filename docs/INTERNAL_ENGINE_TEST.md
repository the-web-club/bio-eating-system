# Internal Biological OS engine test runbook

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Audience:** Internal testers only  
**Last updated:** 2026-08-13  

This runbook describes how to run the Biological OS engine spike against **production USDA + EFSA data** and persist a `FoodMatrixVersion` snapshot. It does **not** enable customer-facing Biological OS flows.

---

## Scope

| In scope | Out of scope |
|----------|--------------|
| Pure-library engine + DB persistence | Portal quiz, matrix approval UI, PDFs, recipes |
| Allowlisted accounts only | General customer rollout |
| `POST /api/internal/biological-os/matrix` | `/portal/*` intake or plan generation changes |
| CLI script for local debugging | Enabling `BIOLOGICAL_OS_ENGINE` in production globally |

Customers continue to use the **legacy slot calculator** (`plan-engine.ts`) unless this flag is deliberately enabled for internal testing.

---

## Prerequisites

### 1. Production nutrition data imported

Confirm both datasets exist:

| Dataset | Key | Expected |
|---------|-----|----------|
| USDA Foundation Foods | `usda-fdc` / `2026-04-30-production-slice-v3` | 363 foods, `devOnly=false` |
| EFSA DRV | `efsa-drv-eu-2017-v2` | 42 requirement rows, 29 nutrients, `APPROVED` |

Commands:

```bash
pnpm import:usda
pnpm import:efsa-requirements
pnpm validate:requirements
```

`pnpm validate:requirements` should report production gate **eligible: yes**.

### 2. Feature flag (local or staging only)

In `.env`:

```bash
BIOLOGICAL_OS_ENGINE=true
```

Do **not** set this in production until explicit authorization. Default remains `false` in `.env.example`.

Restart the dev server after changing env.

### 3. Allowlisted tester account

The engine accepts requests only from emails on the **signup allowlist** or **admin allowlist** (see `src/lib/signup-allowlist.ts` and `src/lib/admin-allowlist.ts`).

The account must also have **Biological OS entitlement** (`corePlan` / product grant for `biological-os`).

### 4. Verification suite (optional but recommended)

```bash
pnpm typecheck
pnpm test
pnpm build
```

---

## What the engine does

Pipeline (see `src/lib/biological-os/run-engine.ts`):

1. Load approved USDA foods and EFSA requirements from the database
2. Resolve daily requirements for the profile
3. Run the minimal-set optimizer (deterministic heuristic)
4. Persist:
   - `FoodMatrixVersion`
   - `FoodMatrixItem` rows
   - `RedundancyAssessment` / `RedundancyChoice` when applicable
   - `AuditEvent` with action `biological_os.matrix_generated` (coverage + change reasons in `detail`)

Matrix version increments monotonically per user (`1`, `2`, `3`, ...).

---

## Method A: CLI (local debugging)

Use when you already know a `userId` and want to bypass HTTP auth.

```bash
BIOLOGICAL_OS_ENGINE=true pnpm run:biological-os-engine \
  --userId=<uuid> \
  --age=30 \
  --sex=female \
  --bodyWeightKg=65
```

**Success output** (example):

```json
{
  "matrixVersionId": "...",
  "version": 1,
  "optimizerStatus": "ok",
  "infeasibleReason": null,
  "itemCount": 12,
  "redundancyProposalCount": 0
}
```

**Infeasible output** is also a valid test result when the USDA slice cannot cover all 13 biological categories (see [Expected infeasible cases](#expected-infeasible-cases)).

---

## Method B: Internal API (session auth)

**Endpoint:** `POST /api/internal/biological-os/matrix`

**Not a portal route.** No customer UI calls this path.

### Request body

```json
{
  "age": 30,
  "sex": "female",
  "bodyWeightKg": 65,
  "excludedAllergens": [],
  "requiredFoodIds": [],
  "hardExcludedFoodIds": [],
  "proteinPreference": { "preference": "no_preference" },
  "redundancyChoices": []
}
```

Optional fields may be omitted. `age` must be 18-49 (matches the imported EFSA slice).

### Example (authenticated session cookie)

```bash
curl -sS -X POST "http://localhost:3000/api/internal/biological-os/matrix" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"age":30,"sex":"female","bodyWeightKg":65}'
```

### Response codes

| Status | `error` | Meaning |
|--------|---------|---------|
| 503 | `engine_disabled` | `BIOLOGICAL_OS_ENGINE` is not `true` |
| 401 | `unauthenticated` | No valid session |
| 403 | `not_allowlisted` | Email not on internal allowlist |
| 403 | `not_entitled` | User lacks Biological OS product grant |
| 422 | `validation_failed` | Body failed Zod validation |
| 500 | `engine_run_failed` | Loader or persistence error (see `message`) |
| 200 | — | Run completed; check `optimizerStatus` in body |

### 200 response shape

```json
{
  "matrixVersionId": "uuid",
  "version": 1,
  "optimizerStatus": "ok",
  "infeasibleReason": null,
  "missingCategories": [],
  "uncoveredNutrients": [],
  "itemCount": 12,
  "redundancyProposalCount": 0
}
```

The API returns a **summary only**. Full coverage and change reasons live in the audit event and DB rows.

---

## Verify persistence

After a successful run, confirm in the database:

### `FoodMatrixVersion`

- `userId` matches the tester
- `version` incremented
- `status` = `DRAFT`
- `engineVersion` = `biological-os-engine-0.1.0`
- `foodDatasetVersion` = `2026-04-30-production-slice-v3`
- `requirementSetVersion` = `efsa-drv-eu-2017-v2`

### `FoodMatrixItem`

- One row per food in the draft
- `foodId` references production `Food.id` (UUID), not FDC external ids
- `portionGrams` set by the optimizer

### `AuditEvent`

- `action` = `biological_os.matrix_generated`
- `detail.matrixVersionId` matches the created version
- `detail.coverage` and `detail.changeReasons` present for audit replay

---

## Determinism check

Run the same inputs twice for the same user (or use two fresh users with identical inputs via CLI).

Same profile + same data versions should produce **identical optimizer output** (food set and portions). Matrix `version` will differ (monotonic counter), but `FoodMatrixItem` contents for a given input should match between runs if data has not changed.

Unit tests in `src/lib/biological-os/__tests__/pipeline.test.ts` enforce this for the in-memory pipeline.

---

## Expected infeasible cases

The current USDA production slice is **real and approved, but intentionally limited**. The engine must not invent foods or categories.

| Condition | `optimizerStatus` | `infeasibleReason` |
|-----------|-------------------|---------------------|
| No USDA candidate for a biological category (e.g. organ meat, bivalves) | `infeasible` | `no_candidate_for_category` |
| Allergen exclusion removes the only candidate for a category (e.g. `egg` removes eggs) | `infeasible` | `no_candidate_for_category` |
| Combined portions cannot meet EFSA targets | `infeasible` | `uncovered_nutrients` |
| Required user food cannot be satisfied | `infeasible` | `required_food_infeasible` |

Document infeasible results in test notes. They are expected until catalog coverage expands.

---

## Test scenarios (minimum protocol)

Run at least these before widening allowlist access:

1. **Baseline female 30y** — expect `ok` or documented `infeasible` with `missingCategories`
2. **Baseline male 30y** — same
3. **Egg allergen** — `"excludedAllergens": ["egg"]` — expect `infeasible` (`no_candidate_for_category`)
4. **Repeat run** — same user, same body — version increments; optimizer output stable
5. **Audit trail** — confirm `biological_os.matrix_generated` event exists

Optional (when you have real `Food.id` values from the DB):

6. **Redundancy choice** — pass `redundancyChoices` with `keep_both`, `remove_a`, or `review`
7. **Required food** — pass `requiredFoodIds` with a valid production food UUID

---

## Rollback

1. Set `BIOLOGICAL_OS_ENGINE=false` (or remove from env)
2. Restart the app
3. Internal API returns `503 engine_disabled`
4. Legacy slot calculator unchanged for all customers

Persisted `FoodMatrixVersion` rows remain in the database for audit. They are not exposed to customer UI.

---

## Related documents

- `docs/PHASE_2_REVIEW.md` — Phase 2 complete, Phase 3 spike status
- `docs/IMPLEMENTATION_PLAN.md` — Phase 3 module checklist
- `docs/BIOLOGICAL_OS_DATA_SPEC.md` — optimizer contract and infeasible handling
- `docs/REQUIREMENT_DATA_VALIDATION.md` — nutrient coverage vs USDA slice

## Related code

- `src/lib/biological-os/run-engine.ts` — orchestrator
- `src/lib/biological-os/production-loader.ts` — DB loader
- `src/lib/biological-os/persist-matrix.ts` — persistence
- `src/lib/biological-os/engine-allowlist.ts` — internal email gate
- `src/app/api/internal/biological-os/matrix/route.ts` — HTTP entry point
- `scripts/run-biological-os-engine.ts` — CLI entry point
