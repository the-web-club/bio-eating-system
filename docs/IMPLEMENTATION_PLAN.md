# Implementation plan — Biological OS + Master Personal Portal

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Prerequisite:** Read `docs/PRODUCT_GAP_ANALYSIS.md`  
**Authority:** Final Master Cursor Specification > `rules.md` > legacy `plan.md`  

This plan sequences work so working infrastructure (auth, webhooks, mail, cron, tokens) is **preserved** while the nutritional core and commerce model are **replaced in layers**. No phase is “complete” with placeholder nutrition data in production paths.

---

## Current status (2026-08-13)

| Layer | Status |
|-------|--------|
| Phase 2 food + requirement foundation | **Implemented** in Prisma + import pipeline + compliance gates |
| Phase 3 Biological OS engine spike | **Implemented** under `src/lib/biological-os/` (54+ tests), flag **off** |
| Production food universe today | USDA Foundation v3 (363 foods, 94 nutrients) when imported |
| Multi-source architecture | Adaptor registry, source registry, canonical identity, source priority |
| Phytonutrients | 57-compound catalog; Foundation + FNDDS flavonoid enrichment path |
| Customer rollout | **Not enabled** (`BIOLOGICAL_OS_ENGINE=false`) |

The engine is **not** “not built.” It is built, tested, and gated. Legacy slot calculator remains the customer path until rollout criteria are met.

---

## Principles

1. **Audit before implement** — Read touched files; report what exists (`rules.md` §1).  
2. **Deterministic core** — Optimizer and requirement checks are pure functions with version stamps.  
3. **Content vs code** — Nutrition prose and preparation guidance live in reviewed content modules; code renders keys only.  
4. **No mock nutrition in production** — Dev fixtures OK under `/preview` and test harnesses only.  
5. **Migrate, don’t big-bang** — Keep legacy slot engine behind feature flag until Biological OS pipeline passes parity tests for safety (allergens, screening).  
6. **Verify every phase:** `pnpm exec tsc --noEmit` (add script), `pnpm lint`, `pnpm test`, `pnpm build`.

---

## Phase 0 — Program setup (1–2 days)

**Goal:** Make the repo ready for multi-month delivery without breaking CI.

### Tasks

- [ ] Add `typecheck` script: `"typecheck": "tsc --noEmit"`.  
- [ ] Document env vars for new domains in `.env.example` (no defaults in code).  
- [ ] Add feature flags module: `LEGACY_SLOT_ENGINE`, `BIOLOGICAL_OS_ENGINE` (env or DB-backed).  
- [ ] Rename chat/docs references: Biological OS = Product slug `biological-os`.  
- [ ] Archive superseded scope notes: add header to `plan.md` pointing to this plan + gap analysis.

### Preserve

Everything currently building.

### Exit criteria

- `pnpm build` green on current mainline.  
- Gap analysis + this plan merged.

---

## Phase 1 — Master portal & commerce model (1–2 weeks)

**Goal:** Scalable entitlements without boolean sprawl. Portal shows products locked/unlocked from data.

### 1.1 Schema

Introduce (names indicative):

```
Product              — slug, name, kind (one_time | subscription | coaching)
Bundle               — slug, name
BundleItem           — bundleId, productId
EntitlementGrant     — userId, productId, sourcePurchaseId?, startsAt, endsAt?, status
Purchase             — externalId, userId, currency, gross, net, vatRate, vatAmount, country, billedAt, refundedAt
PurchaseLine         — purchaseId, sku, productId, quantity
Subscription         — userId, productId, externalId, status, currentPeriodEnd
WebhookEvent         — (keep)
AuditEvent           — (keep)
```

**Migration:** Backfill grants from existing `Entitlement` booleans:

| Legacy field | Product slug |
|--------------|--------------|
| `corePlan` | `biological-os` |
| `weeklyRotation` | `bio-weekly-email` (or bundle child — decide with commerce) |
| `labReference` | `bio-lab-reference` |
| `coaching` | `vip-coaching-30d` |

Deprecate direct boolean writes; keep columns temporarily read-only for rollback.

### 1.2 Application

- [ ] `src/lib/commerce/products.ts` — catalog registry (seed + admin editable later).  
- [ ] `src/lib/commerce/grants.ts` — resolve user’s active products.  
- [ ] Refactor `load-portal-data.ts` → grant-based `PortalProductAccess`.  
- [ ] Master portal home: product cards (Biological OS, Offer 2 placeholder locked, Offer 3 locked, Coaching).  
- [ ] Refactor SureCart webhook: SKU → product grants (support bundles mapping to multiple grants).  
- [ ] Admin access editor → grant/revoke products with audit trail.  
- [ ] Portal upgrade CTAs → checkout URL placeholder (SureCart deep link config).

### 1.3 Tests

- [ ] Bundle grant creates multiple active products.  
- [ ] User A / B / C entitlement isolation scenarios (§2 spec examples).  
- [ ] Webhook idempotency unchanged.

### Preserve

Webhook HMAC, `WebhookEvent`, admin shell, locked empty state components.

### Exit criteria

- Portal renders Biological OS unlocked only when grant exists.  
- Legacy users migrated.  
- No new boolean columns added for future products.

---

## Phase 2 — Food & requirement data layer (2–4 weeks)

**Goal:** Authoritative, versioned data foundation. **No optimizer yet.**

**NEEDS PROFESSIONAL REVIEW:** Dataset selection (USDA FoodData Central, Fineli, etc.), licensing, which nutrients to track.

### 2.1 Schema

```
Nutrient
Food
FoodNutrient          — foodId, nutrientId, amount, unit, perAmountG
FoodAllergen
FoodCategory / FoodCategoryMap
FoodSubstitution      — ranked alternatives, reason tags
FoodSourceImport      — source, sourceVersion, importDate, rowCount, status
RequirementSet        — version, reviewer, reviewedAt, status
NutrientRequirement   — setId, nutrientId, ageMin, ageMax, sex, value, unit
BiologicalCategory    — maps internal 13 categories → default candidate food IDs
```

### 2.2 Import pipeline

- [ ] `scripts/import-food-source.ts` — adaptor interface + first importer stub.  
- [ ] `src/lib/nutrition-data/` — normalize external rows → internal schema.  
- [ ] Store **source + sourceVersion** on every nutrient value.  
- [ ] Admin read-only import status page.

### 2.3 Requirement engine (pure)

- [ ] `src/lib/nutrition/requirements.ts` — given profile + requirement set version → daily targets.  
- [ ] `src/lib/nutrition/contribution.ts` — food portions → nutrient totals.  
- [ ] `src/lib/nutrition/coverage.ts` — matrix → gap/surplus vs requirements.

### Tests

- [ ] Import fixture slice (offline JSON) round-trips.  
- [ ] Coverage math deterministic.  
- [ ] No food without source metadata in production seed.

### Exit criteria

- Can answer: “What does 100g of food X contribute to iron, protein, …?”  
- Can answer: “What gaps appear if food Y is removed?” (nutrient delta, not slot swap).

---

## Phase 3 — Core engine pipeline (3–5 weeks)

**Goal:** Replace slot gram allocator with spec §46 pipeline (behind feature flag).

**Status (2026-08-12):**

- **Engine spike:** COMPLETE — pure-library pipeline in `src/lib/biological-os/`, 31 tests, deterministic
- **Customer product:** NOT READY — DB persistence, API wrapper, portal integration, remaining modules outstanding
- **Feature flag:** `BIOLOGICAL_OS_ENGINE=false`
- **Legacy slot calculator:** Still active for customers

### Modules (new)

```
src/lib/biological-os/
  energy.ts              — versioned REE/TDEE from structured activity [NOT STARTED]
  activity-profile.ts    — convert ActivityEntry[] → MET/load [NOT STARTED]
  protein-target.ts      — preference + safeguards [DONE — spike]
  candidate-set.ts       — 13 categories → initial food candidates [DONE — spike]
  filter-exclusions.ts   — allergens, unresolved allergy policy [DONE — spike]
  coverage-engine.ts     — draft coverage helpers [DONE — spike]
  optimizer.ts           — minimal set under constraints [DONE — spike]
  redundancy.ts          — overlap detection (oats/bread scenario) [DONE — spike]
  recalculate.ts           — add/remove recalculation [DONE — spike]
  matrix-versioning.ts   — in-memory snapshot + change reasons [DONE — spike]
  pipeline.ts            — orchestrates spike pipeline [DONE — spike]
  meal-distribution.ts   — daily totals → N meals [NOT STARTED]
  measurement-present.ts — canonical → metric/imperial/household/hand [NOT STARTED]
  rotation-builder.ts    — 52-week assignment from approved candidates [NOT STARTED]
  grocery-builder.ts     — week list from rotation + portions [NOT STARTED]
```

### Legacy bridge

- [ ] Keep `plan-engine.ts` as `legacy-slot-engine` until Phase 6.  
- [ ] Shared: `screening.ts`, allergen hard-block tests.

### Tests (from spec §47)

**Engine spike (library — done):**

- [x] Allergen hard exclusion (filter layer).  
- [x] Remove liver → multi-food replacement ranked by coverage (recalculate module).  
- [x] Add oats → redundancy suggestion.  
- [x] KEEP BOTH retains both; REMOVE drops one; REVIEW no auto change.  
- [x] Matrix versioning records reason (in-memory snapshot).  
- [x] Protein target alters portions, not arbitrary category removal.  
- [x] Same inputs + data version → identical matrix JSON (determinism).

**Customer product (not done):**

- [ ] Unresolved “Other” allergy policy end-to-end.  
- [ ] Activity builder → energy ≠ subjective-only path.  
- [ ] Meal frequency changes distribution only.  
- [ ] Measurement conversion presentation-only.  
- [ ] DB persistence and portal/API integration tests.

### Exit criteria

**Engine spike (met):**

- Same inputs + data version → identical matrix JSON.  
- Optimizer validates coverage against requirement set or returns explicit “cannot satisfy” (never silent gap).

**Customer rollout (not met):**

- Engine snapshots persisted to `FoodMatrixVersion` / `FoodMatrixItem`
- Portal routes call engine behind `BIOLOGICAL_OS_ENGINE` for allowlisted users only
- Legacy slot calculator remains fallback until parity and authorization

---

## Phase 4 — Biological OS onboarding UX (2–3 weeks)

**Goal:** Entitlement-gated, one-question-at-a-time quiz per spec §4–§10, §19–§22.

### Routes

```
/portal                                    — Master portal product grid
/portal/biological-os                      — Product home (locked/unlocked)
/portal/biological-os/onboarding           — Quiz (grant required)
/portal/biological-os/onboarding/activity  — Activity builder subflow if needed
/portal/biological-os/foods                — Favourite browser
/portal/biological-os/matrix               — Final food list + approval loop
/portal/biological-os/plan                 — Meals (post-approval only)
```

### UI

- [ ] New onboarding tokens in `globals.css`: `--onboarding-canvas`, `--onboarding-accent` mapped to `#f8f6f1` / `#5170ff`.  
- [ ] `BiologicalOsQuiz` component — single question, auto-advance, back stack preserves answers.  
- [ ] Activity Builder UI — multi-entry list.  
- [ ] Favourite food browser — categorized; map to `Food.id`; “Other” → unresolved queue.  
- [ ] Final matrix approval screen — numbered actual foods; “Looks good” / “Change something”.  
- [ ] Change loop without full quiz restart.

### API

- [ ] Staged PATCH endpoints or single `POST` with step discriminator — all Zod validated.  
- [ ] Do **not** generate meals until `matrixStatus = approved`.

### Deprecate

- [ ] `/portal/intake` → redirect to Biological OS routes when granted; hide when not.

### Exit criteria

- Non-entitled user never sees Biological OS questions.  
- Completing quiz produces `FoodMatrixVersion` v1 pending approval, not immediate meals.

---

## Phase 5 — Portal surfaces rebind (2 weeks)

**Goal:** Customer sees **actual foods** everywhere.

### Tasks

- [ ] Replace `SLOT_LABELS` in customer views with matrix food names.  
- [ ] Rebuild Today / Plan / Shop from approved matrix + meal plan.  
- [ ] Weekly list: actual names + shoppable quantities.  
- [ ] Locked product empty states per grant, not boolean checks in JSX.  
- [ ] Learn tab: food-attached education modules (content keys per food).  
- [ ] Biomarkers: keep reference-only; hide until content + grant.

### Preserve

Portal shell, motion, loading skeletons, error states.

### Exit criteria

- No customer-facing “tubers”, “muscle meat”, “bivalves” strings in production paths.  
- Definition of Done items 19–21 satisfied in portal (pre-PDF).

---

## Phase 6 — 52-week rotation & email (2–3 weeks)

**Goal:** True 52-week architecture; honest UX when weeks not yet validated.

### Tasks

- [ ] `RotationWeek` table: week 1–52, review status, effective food IDs per biological category.  
- [ ] Seed only validated weeks; UI shows “Week N content in preparation” for unvalidated weeks.  
- [ ] Replace `rotation.ts` stub.  
- [ ] Refactor cron to use approved matrix + rotation tables.  
- [ ] Email templates: actual food lines only.

### Preserve

Cron batching, `EmailDrop` uniqueness, unsubscribe.

### Tests

- [ ] Forbidden food never appears in rotation/email for allergic user.  
- [ ] Cron retry sends zero duplicates.

### Exit criteria

- Architecture supports 52 weeks; production enables weeks only when `reviewStatus = approved`.  
- No fake 4-week loop labeled as 52.

---

## Phase 7 — Recipes & meal generation (2 weeks)

**Goal:** Execution layer on approved matrix (spec §23–§24).

### Tasks

- [ ] `Recipe`, `RecipeIngredient` models — ingredients ⊆ approved matrix (+ explicit optional subs).  
- [ ] Recipe generator (deterministic template selection + rotation).  
- [ ] Portal recipe views linked from meals.  
- [ ] Content references for preparation steps (not LLM-generated science).

### Exit criteria

- Recipes never introduce unapproved foods.  
- Meal plan respects selected meal count and protein target.

---

## Phase 8 — PDF deliverables (2–3 weeks)

**Goal:** Purchased product persists as downloadable assets (spec §27).

### Tasks

- [ ] Choose PDF renderer (e.g. `@react-pdf/renderer` or server-side HTML→PDF) — evaluate licensing.  
- [ ] `DeliverableAsset` model — type, version, storage URL, checksum, createdAt.  
- [ ] Generate: food matrix, meal plan, 52-week rotation compendium, weekly lists bundle, education pack.  
- [ ] Store on durable object storage (Vercel Blob / S3 — decide).  
- [ ] Email attachments or signed download links via Resend.  
- [ ] Portal “My downloads” — never expire for one-time purchase grants.

### Tests

- [ ] PDF generation smoke test with fixture matrix.  
- [ ] Regenerated plan creates new asset version; old remains for admin.

### Exit criteria

- Definition of Done items 22–24 satisfied.

---

## Phase 9 — Subscription & coaching (2 weeks)

**Goal:** Separate entitlements; VIP capacity enforced (spec §28, §35–§37).

### Coaching schema

```
CoachingEngagement — userId, startsAt, endsAt, status, seatSlot (1–10), coachId?
CoachingSeat       — optional materialized counter / lock table
CoachNote          — engagementId, body, publishedAt
CoachDeliverable   — attachment metadata
```

### Tasks

- [ ] 10 active seat enforcement at webhook + admin grant.  
- [ ] Waitlist product/grant when full.  
- [ ] Auto-expire at 30 days; Biological OS grant unaffected.  
- [ ] Coach admin: view matrix, versions, symptoms (if permitted), publish note, notify client.  
- [ ] Subscription product separate from `bio-weekly-email` convenience features.

### Tests

- [ ] 11th coaching grant rejected.  
- [ ] Expired coaching removes coach access only.

---

## Phase 10 — Symptom observations (1–2 weeks)

**Goal:** Optional logging without diagnosis (spec §32).

### Tasks

- [ ] `SymptomObservation` model + daily UI.  
- [ ] Link to logged meals/foods.  
- [ ] Pattern detector: “reported N times with food X” → review prompt, not intolerance claim.  
- [ ] Coach view respects privacy flags.

### Tests

- [ ] Pattern copy contains no diagnostic language.

---

## Phase 11 — Health data abstraction (1 week)

**Goal:** Future Oura/Apple Health readiness (spec §33).

### Tasks

- [ ] `HealthDataProvider`, `HealthDataConnection`, `HealthMetric` tables.  
- [ ] Interface stub + no-op provider.  
- [ ] No automatic plan changes from wearable data.

---

## Phase 12 — Tax & reporting (1 week)

**Goal:** CSV export for Finnish accounting (spec §39).

### Tasks

- [ ] Ensure `Purchase` lines store commerce platform tax fields.  
- [ ] Admin export CSV by date range.  
- [ ] **NEEDS PROFESSIONAL REVIEW:** field set with accountant.

---

## Phase 13 — Education & intuitive eating content (ongoing, parallel)

**Goal:** Content modules with governance (spec §29–§31, §43).

### Tasks

- [ ] Expand `content/` into versioned modules per food and lesson.  
- [ ] Required metadata: source, reviewer, reviewDate, version, status.  
- [ ] Intuitive eating track as separate product content bundle.  
- [ ] Gate publish: `status === approved` only.

**Blocked on dietitian authorship** — engineering can build CMS-shaped JSON and admin preview.

---

## Phase 14 — Localisation (defer)

Legacy `plan.md` Phase 6 (next-intl EN/FI) is **not** in master spec Definition of Done. Schedule after Biological OS core is complete unless product requires FI launch.

---

## Testing strategy (continuous)

| Layer | Approach |
|-------|----------|
| Engine pure functions | Vitest fixtures + golden files per `ENGINE_VERSION` / `REQUIREMENT_SET_VERSION` |
| API routes | Integration tests with test DB or mocked Prisma |
| Allergen safety | Property-style tests: random exclusions never appear downstream |
| Webhook/cron | Replay tests from recorded payloads |
| E2E | Playwright: onboarding → approve → see actual foods (post Phase 4) |

Add CI job running: `typecheck`, `lint`, `test`, `build`.

---

## Rollout strategy

1. **Internal alpha** — Feature flag `BIOLOGICAL_OS_ENGINE` for allowlisted users only.  
2. **Parallel run** — Legacy slot plan vs new matrix for staff comparison.  
3. **New customers** — Biological OS path only.  
4. **Migrate existing** — Regenerate matrix offer; do not silently overwrite without consent.  
5. **Retire legacy** — Remove `plan-engine.ts` customer paths when metrics stable.

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Optimizer complexity | Start deterministic greedy coverage; document non-optimality; iterate |
| 52-week content volume | Architecture week 1–52; ship approved weeks incrementally with honest UI |
| Dataset licensing | Legal review before production import |
| PDF storage costs | Generate on purchase; cache immutable assets |
| Scope creep (Learn, Progress, Check-in) | Keep ancillary features; don’t block core Biological OS phases |
| Master spec vs `rules.md` Dutch copy | Clarify with product: rules say Dutch client copy; spec examples English — resolve before Phase 4 copy |

---

## Suggested immediate next sprint (after this audit)

**Sprint 1 (10 working days):**

1. Phase 0 setup + feature flags.  
2. Phase 1 schema migration + grant resolver + portal product grid.  
3. Refactor webhook to grants (keep SKU map).  
4. Tests for bundle + isolation.

**Do not start:** Optimizer UI, PDF, or recipe work until Phase 1–2 foundations land.

---

## Definition of Done mapping

When all phases complete, re-run the §48 checklist in `PRODUCT_GAP_ANALYSIS.md` and mark each item **DONE** only with demonstrated end-to-end flows (staging URL + test evidence).

**Final principle (spec §50):** The customer stops doing nutrition arithmetic; the system remains transparent, deterministic, preference-respecting, and auditable. The 13-category matrix is the starting philosophy — the **actual-food matrix, meals, recipes, rotation, and grocery lists** are the product.
