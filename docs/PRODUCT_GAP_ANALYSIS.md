# Product gap analysis — Biological OS + Master Personal Portal

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Audit date:** 2026-08-12  
**Authoritative spec:** Final Master Cursor Specification (this audit)  
**Binding rules:** `rules.md`, then current `plan.md` where it does not conflict with the master spec  

**Status note (2026-08-12):** Phase 2 production data foundation (USDA + EFSA) and the Phase 3 **engine spike** (`src/lib/biological-os/`, 31 tests) are complete as pure library code. This document describes **customer-facing product gaps**. The legacy slot calculator remains active; `BIOLOGICAL_OS_ENGINE=false`.

**Status legend**

| Status | Meaning |
|--------|---------|
| **DONE** | Implemented and aligned with the master spec at a shippable level |
| **PARTIAL** | Exists but incomplete, placeholder, or misaligned |
| **MISSING** | Not implemented |
| **WRONG ARCHITECTURE** | Implemented in a way that blocks the target product; refactor or replace |
| **NEEDS PROFESSIONAL REVIEW** | Code may exist, but launch requires clinician/dietitian/legal sign-off or authoritative data |

---

## Executive summary

The repository is a **solid engineering foundation** (Next.js App Router, Prisma/MariaDB, Better Auth, Resend, Vercel, token system, webhook security, cron idempotency, GDPR primitives). It is **not yet the Biological OS** described in the master specification.

What exists today is closer to an **MVP 13-slot portion calculator** with a portal shell, weekly email automation, and admin tooling. The core product gap is architectural:

1. **Output model** — The system outputs internal biological *slots* (e.g. “tubers”, “muscle meat”), not the customer’s **approved actual-food matrix**.
2. **Engine model** — Energy is estimated from subjective activity labels and fixed gram baselines per slot. There is **no food database, requirement database, contribution model, or minimum-food optimizer**.
3. **Commerce model** — Entitlements are **hard-coded booleans** on a single row, not a scalable Product / Bundle / Purchase / Subscription model.
4. **Onboarding model** — A **multi-section wizard** at `/portal/intake`, not entitlement-gated, one-question-at-a-time Biological OS quiz.
5. **Deliverables** — No **PDF pipeline**, no **52-week validated rotation**, no **recipes**, no **final food approval loop**.

**Estimated readiness against master spec Definition of Done (§48):** ~8 of 35 criteria have meaningful partial coverage; **0 criteria are fully complete end-to-end**.

---

## 1. Product definition (§1)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Biological OS as flagship educational system | **WRONG ARCHITECTURE** | Product is implemented as a 13-slot gram engine (`src/lib/nutrition/plan-engine.ts`), not a personalized actual-food system |
| 13 categories as *starting philosophy*, not mandatory final diet | **PARTIAL** | Slots exist and can be excluded/swapped, but output remains slot-based; no transition to actual foods |
| Minimize unnecessary redundancy with user control | **MISSING** | No contribution analysis, redundancy detection, or KEEP BOTH / REMOVE / REVIEW flow |
| Never silently remove user-requested foods | **PARTIAL** | Swap logic preserves user exclusions; no favourite-food or redundancy-choice model |
| Nutritional adequacy as optimization objective | **MISSING** | No requirement validation against authoritative reference values |

---

## 2. Master portal architecture (§2)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Master portal hosting multiple products | **PARTIAL** | Portal shell, nav, locked states exist; products are not first-class entities |
| Entitlement-driven access | **PARTIAL** | `Entitlement` booleans: `corePlan`, `weeklyRotation`, `labReference`, `coaching`, `hormoneModule`, `nervousModule` (`prisma/schema.prisma`) |
| Product / Bundle / Purchase / Subscription / AccessLevel model | **WRONG ARCHITECTURE** | Boolean flags cannot scale to Offer 2, Offer 3, bundles, or future products without schema churn |
| Per-user mixed unlock states | **PARTIAL** | Admin + webhook can set flags; no bundle composition or subscription lifecycle |
| Coaching as separate entitlement | **PARTIAL** | `coaching` boolean exists; no coaching lifecycle, capacity, or coach workspace |

**Preserve:** Portal layout (`src/components/portal/app-shell.tsx`), locked empty states, preview fixtures for design review.  
**Replace:** Entitlement schema and all consumers (`load-portal-data.ts`, webhook SKU map, admin access editor).

---

## 3. Product-specific onboarding (§3)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Biological OS onboarding only when entitled | **MISSING** | `/portal/intake` runs for any authenticated user with `corePlan`; no product gate |
| Route e.g. `/portal/biological-os/onboarding` | **MISSING** | Current route: `/portal/intake` |
| Separate onboarding per future product | **MISSING** | No product-scoped onboarding registry |

---

## 4. Visual design — onboarding quiz (§4)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Premium one-question-at-a-time quiz | **WRONG ARCHITECTURE** | `IntakeWizard` uses 7 multi-field sections (~900 lines), not single centered questions |
| Apple-inspired calm aesthetic | **PARTIAL** | Onboarding shell exists; not spec palette |
| Background `#f8f6f1`, accent `#5170ff` as tokens | **MISSING** | Onboarding uses general portal tokens in `globals.css`, not spec onboarding tokens |
| Auto-advance, back without losing later answers | **PARTIAL** | Step navigation exists within sections; not per-question model |

---

## 5. Biological OS quiz — profile & activity (§5–§6)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Name, age, sex, height, weight | **DONE** | Collected in intake basics |
| Structured Activity Builder (running, strength, etc.) | **MISSING** | Uses `activityLevel` enum + lifestyle JSON (`sedentary`/`light`/`moderate`/`active`) |
| Multiple activity entries with frequency/duration/intensity | **MISSING** | `trainingFrequency` is coarse, not per-activity |
| Validated energy equation, versioned | **PARTIAL** | Simple Mifflin-style maintenance × activity factor in plan engine; no documented formula selection, no `calculationVersion` storage |
| Present energy as estimate, not exact metabolism | **PARTIAL** | Some copy is cautious; portal shows kcal without strong estimation framing |

**NEEDS PROFESSIONAL REVIEW:** Formula choice, activity conversion methodology, safety floors (`screening.ts` is explicitly `UNREVIEWED`).

---

## 7–10. Protein, goal, meals, measurement (§7–§10)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Protein preference (0.7–2.2 g/kg, custom) | **MISSING** | No `proteinPreference` / `proteinTarget` |
| Goal: lose / maintain / gain | **DONE** | `Goal` enum REDUCE / MAINTAIN / INCREASE |
| Meals per day (3–7) | **MISSING** | Meals are heuristic 3-meal + optional map, not user-selected count |
| Measurement: metric / imperial / household / hand | **PARTIAL** | `UnitSystem`: METRIC, HOUSEHOLD, SIMPLE — no US/imperial, no hand portions; presentation mixed into engine types |
| Canonical internal units + presentation layer | **PARTIAL** | Grams canonical in engine; household display is secondary fields on slots, not a pure presentation layer |

---

## 11. Thirteen core biological categories (§11)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Internal category model | **DONE** | `FOOD_SLOTS` (13) in `plan-engine.ts` — aligned with spec list (naming differs slightly: `olive_oil`, `fermented`, `aromatics`) |
| Categories not equal to final customer food list | **WRONG ARCHITECTURE** | Portal, meals, grocery list, and email all surface slot abstractions to the customer |
| Substitution / removal / addition at food level | **PARTIAL** | Slot swap/exclude only; no actual-food operations |

---

## 12–14. Food DB, requirements, contribution model (§12–§14)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Structured food knowledge layer | **MISSING** | No `Food`, nutrient tables, import pipeline, or source versioning |
| Authoritative nutrient data (USDA, Fineli, etc.) | **MISSING** | Baseline grams are hard-coded constants in `plan-engine.ts` |
| Nutritional requirement database | **MISSING** | No RDA/DRV model by age/sex/life stage |
| Food → nutrient contribution mapping | **MISSING** | No coverage/gap analysis |
| Import/update architecture | **MISSING** | No adaptors |

**This is the largest product gap.** The current engine cannot answer “what would we lose if liver were removed?” in nutrient terms.

---

## 15–18. Optimizer, remove/add food, redundancy (§15–§18)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Core minimum food set optimizer | **MISSING** | Fixed 13-slot template with gram scaling |
| Gap analysis on removal | **MISSING** | Slot swap with 80% carryover (`SWAP_CARRYOVER`), not nutrient-ranked multi-food replacement |
| Favourite food addition + redundancy offer | **MISSING** | Free-text likes in `foodPreferences`; no structured favourites or oats/bread flow |
| KEEP BOTH / REMOVE / REVIEW | **MISSING** | No UI or persistence for intentional redundancy |
| Deliberate redundancy transparency | **MISSING** | No `intentionalRedundancy` records |

**Replace entirely:** `plan-engine.ts` swap/allocation logic beyond screening gate patterns.  
**Preserve:** Deterministic pure-function discipline, `assertNoAllergenLeak`, screening integration, unit test approach.

---

## 19. Favourite food selection UI (§19)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Curated food browser by category | **MISSING** | |
| Map selections to structured food IDs | **MISSING** | |
| Unmapped “Other” handling | **PARTIAL** | Allergen “other” not modeled; coach notes exist but are not safety-routed |

---

## 20. Allergy system (§20)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Structured allergen tags | **DONE** | EU-style enum in engine + checkbox intake |
| Free text never drives plan | **DONE** | `notesForCoach` stored only; grep confirms no keyword parsing |
| Propagation to all outputs | **PARTIAL** | Engine + tests block allergens in plan; no downstream recipe/email/matrix integration because those layers don’t exist yet |
| Automated allergen tests | **DONE** | `plan-engine.test.ts` includes shellfish/crustaceans case |
| “Other” allergy unresolved workflow | **MISSING** | |

---

## 21–22. Final food matrix & approval loop (§21–§22)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Numbered actual-food list to customer | **MISSING** | Portal shows slot labels via `SLOT_LABELS` |
| Final approval before meal generation | **MISSING** | Plan generated immediately on intake POST |
| Change-without-full-quiz loop | **MISSING** | |
| PlanVersion history with reasons | **PARTIAL** | `GeneratedPlan` rows append on each generation; no version number, diff, or approval state machine |

---

## 23–24. Meals & recipes (§23–§24)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Meals from approved actual foods | **WRONG ARCHITECTURE** | `meal-assembly.ts` maps slots → breakfast/lunch/dinner heuristically |
| Meal count from user selection | **MISSING** | |
| Recipes from approved matrix | **MISSING** | |
| Recipe layer cannot alter requirements | **N/A** | No recipe layer |

---

## 25–26. 52-week rotation & grocery lists (§25–§26)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| True 52-week actual-food rotation | **WRONG ARCHITECTURE** | `rotation.ts`: **4 weeks**, `reviewedBy: PENDING_RD_REVIEW`, variety keys not actual validated content |
| Honest labeling when content incomplete | **PARTIAL** | Old `plan.md` said cycle honestly; portal still exposes `authoredWeeks` without strong “incomplete” UX |
| Weekly grocery lists with actual food names | **PARTIAL** | `weekly-list.ts` resolves label keys but inputs are still slot-rotation items; quantities often `0` in rotation stub |
| Shop directly from list | **PARTIAL** | Weekly portal view exists; content quality insufficient for spec |

**Replace:** `rotation.ts` and weekly list join logic once food matrix exists.  
**Preserve:** Cron batching, `EmailDrop` uniqueness, unsubscribe headers.

---

## 27. PDF delivery (§27)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| PDF generation (matrix, meals, rotation, lists, education) | **MISSING** | No PDF library or routes |
| Email + persistent portal download | **MISSING** | |
| Purchased deliverables do not expire | **MISSING** | No deliverable asset model |

---

## 28–29. Subscription & education (§28–§30)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Subscription as separate entitlement | **MISSING** | `weeklyRotation` conflates product feature with email schedule |
| Subscription ≠ paywall for purchased PDFs | **MISSING** | |
| Food literacy education modules | **MISSING** | `content/en.json` is mostly empty placeholders |
| Bioavailability / preparation content governance | **PARTIAL** | Content resolver + empty states exist; almost no authored content |

**NEEDS PROFESSIONAL REVIEW:** All nutrition education copy, preparation claims, intuitive eating modules.

---

## 31. Intuitive eating (§31)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Intuitive eating curriculum | **MISSING** | `/portal/learn` shows empty state; blocked on content per old plan |

---

## 32. Symptom observation (§32)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Daily symptom logging | **MISSING** | No symptom models |
| Pattern surfacing without diagnosis | **MISSING** | |
| Link observations to meals | **MISSING** | `WeeklyCheckIn` exists for adherence metrics, not symptoms |

---

## 33. Wearable / Oura architecture (§33)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| HealthDataProvider abstraction | **MISSING** | |
| HealthDataConnection / HealthMetric tables | **MISSING** | |

---

## 34. Plan versioning (§34)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Named versions with change reasons | **PARTIAL** | Multiple `GeneratedPlan` rows; `AdaptationEvent` audit trail partial |
| Admin-visible history | **PARTIAL** | Admin sees latest plan, not full version timeline |
| Immutable approved matrix snapshot | **MISSING** | |

---

## 35–37. Admin / coaching / VIP capacity (§35–§37)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Admin coach view | **PARTIAL** | `/admin/people/[id]` shows intake + entitlements + audit; no food matrix, meal plan PDF, symptom data |
| Coach publish revised plan + notify | **MISSING** | |
| 10 active coaching seat cap | **MISSING** | No capacity enforcement or waitlist |
| 30-day coaching expiry | **MISSING** | No `coachingStartDate` / `coachingEndDate` |
| Continuation coaching product | **MISSING** | |

**Preserve:** Admin shell, allowlist, audit logging, member search.  
**Extend:** Coach workspace, capacity, plan publish workflow.

---

## 38–39. Commerce & tax (§38–§39)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Portal “Unlock access” → checkout | **MISSING** | Upgrade dialogs are informational only |
| Webhook entitlement grants | **DONE** | `POST /api/webhooks/surecart` — HMAC, timestamp, idempotency |
| Bundle → multiple product grants | **PARTIAL** | `CORE_PLAN_BUNDLE` sets multiple booleans; not data-driven |
| Transaction / VAT storage | **MISSING** | No `Purchase` ledger |
| CSV export for accounting | **MISSING** | |

**NEEDS PROFESSIONAL REVIEW:** VAT treatment, Finnish tax reporting fields — legal/accounting, not engineering guesses.

---

## 40. Entitlement data model (§40)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Scalable Product / Bundle / Purchase / Entitlement / Subscription | **WRONG ARCHITECTURE** | See §2 |

---

## 41. GDPR / privacy (§41)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Consent at intake | **DONE** | `consentHealthDataAt`, `consentVersion` |
| Data export | **DONE** | `GET /api/portal/account/export` |
| Account deletion | **DONE** | `DELETE /api/portal/account` |
| Marketing opt-in / unsubscribe | **DONE** | User flags + `/unsubscribe/[token]` + email headers |
| Retention policy, DPAs, processing register | **NEEDS PROFESSIONAL REVIEW** | Not in codebase (expected) |
| Audit logging | **PARTIAL** | `AuditEvent` for webhook/admin/engine refusal |

---

## 42–43. Medical scope & content governance (§42–§43)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| No unauthorized health claims in code | **DONE** | Rules enforced; engine emits keys not prose |
| Biomarker view reference-only | **PARTIAL** | `/portal/biomarkers` filters missing content; entitlement gated |
| Versioned reviewed content modules | **PARTIAL** | `content/en.json` stub; resolver returns null → empty state |
| Code never invents nutrition science | **DONE** | Explicit empty states; hard-coded grams are the exception (**WRONG** for production) |

**NEEDS PROFESSIONAL REVIEW:** Screening thresholds, biomarker copy, all customer-facing nutrition text, food dataset licensing.

---

## 44–46. Data sources, determinism, pipeline (§44–§46)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Import adaptors for food/requirement sources | **MISSING** | |
| Deterministic engine | **DONE** | Pure `generatePlan()`; tested |
| Full pipeline per master spec §46 | **MISSING** | Current pipeline: intake → screening → slot grams → portal |

**Target pipeline (abbreviated):** profile → requirements → candidates → filter → optimize → matrix → user edits → recalc → approve → portions → meals → recipes → 52-week rotation → lists → PDF → delivery.

---

## 47. Testing (§47)

| Item | Status | Evidence / gap |
|------|--------|----------------|
| Plan engine unit tests | **DONE** | Allergen, swap order, screening refusal |
| Email / webhook / token tests | **PARTIAL** | Some lib tests; no webhook integration tests |
| Optimizer / food / PDF / coaching cap tests | **MISSING** | |
| Entitlement isolation tests | **MISSING** | |

**Preserve:** Vitest setup, existing engine tests as regression guard during migration.

---

## 48. Definition of Done checklist (§48)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Master portal entry | **PARTIAL** |
| 2 | See only owned products | **PARTIAL** |
| 3 | Biological OS quiz gated | **MISSING** |
| 4 | One-question intake | **MISSING** |
| 5 | Structured weekly activity | **MISSING** |
| 6 | Protein preference | **MISSING** |
| 7 | Meal count | **MISSING** |
| 8 | Measurement system | **PARTIAL** |
| 9 | Initial 13-category foundation | **PARTIAL** (internal only) |
| 10 | Modify foundation | **PARTIAL** (slot swap/exclude) |
| 11 | Structured allergies | **DONE** |
| 12 | Favourite foods | **MISSING** |
| 13–16 | Add foods, recalc, redundancy UX | **MISSING** |
| 17 | Nutrient-aware replacement | **MISSING** |
| 18 | Approve actual-food matrix | **MISSING** |
| 19 | Actual-food meal plan | **MISSING** |
| 20 | Actual-food grocery lists | **MISSING** |
| 21 | 52-week actual-food rotation | **MISSING** |
| 22–23 | PDF download + email | **MISSING** |
| 24 | Retain purchase without subscription | **MISSING** |
| 25–26 | Optional subscription + coaching purchase | **MISSING** |
| 27 | 10-seat coaching cap | **MISSING** |
| 28 | Admin coach plan review | **PARTIAL** |
| 29 | Symptom observations | **MISSING** |
| 30 | Food-attached education | **MISSING** |
| 31 | Wearable-ready architecture | **MISSING** |
| 32 | Automatic payment entitlements | **PARTIAL** |
| 33 | Tax CSV export | **MISSING** |
| 34 | Sensitive data protected | **PARTIAL** |
| 35 | Educational scope maintained | **PARTIAL** |

---

## Infrastructure audit (existing `plan.md` phases)

These were the prior MVP phases. Status against **master spec** (not old MVP alone):

| Phase | Old MVP intent | Status vs master spec |
|-------|----------------|----------------------|
| 1 Foundation | Tokens, env, db, lint | **DONE** — preserve |
| 2 Schema & auth | Prisma, Better Auth, guards | **DONE** — extend schema |
| 3 Intake & plan engine | Zod intake, biometrics API, engine | **PARTIAL** — intake UX and engine must be replaced |
| 4 Portal | Plan, weekly, biomarkers, empty states | **PARTIAL** — UI patterns reusable; data model wrong |
| 5 Automation | Webhook, cron, mail | **DONE** — extend for PDFs and product grants |
| 6 Localisation | next-intl EN/FI | **MISSING** — deprioritized unless master spec adds locale requirements |

---

## Wrong architecture — summary

These must change before the product matches the spec:

1. **`Entitlement` boolean row** → Product catalog + grants + purchases + subscriptions  
2. **`plan-engine.ts` slot gram allocator** → Requirement engine + food DB + optimizer + contribution model  
3. **Customer-facing slot labels** → Actual-food matrix throughout portal, email, PDF  
4. **`rotation.ts` (4-week slot stub)** → 52-week actual-food rotation from approved candidates  
5. **`/portal/intake` multi-step form** → `/portal/biological-os/onboarding` one-question quiz  
6. **`meal-assembly.ts` slot heuristics** → Meal distribution from approved foods after explicit approval  
7. **`weeklyRotation` boolean** → Separate product entitlement vs subscription feature flags  

---

## Code to preserve (do not destroy)

| Area | Paths | Why |
|------|-------|-----|
| Stack & tooling | Next.js 16, pnpm, TS strict, Vitest | Stable |
| Env validation | `src/lib/env.ts` | Security baseline |
| DB client | `src/lib/db.ts`, Prisma generator config | Stable |
| Design tokens | `src/app/globals.css`, ESLint colour rules | Extend for onboarding tokens |
| Auth | `src/lib/auth.ts`, magic link, session config | Stable |
| Route protection | `src/middleware.ts`, `src/lib/portal-session.ts` | Extend matchers for product routes |
| Webhook | `src/app/api/webhooks/surecart/route.ts` | Refactor grant target, keep crypto/idempotency |
| Cron | `src/app/api/cron/weekly-drop/route.ts` | Refactor content source, keep idempotency |
| Mail | `src/lib/mail.ts`, templates | Extend for PDF attachments |
| Screening gate | `src/lib/nutrition/screening.ts` | Keep gate pattern; thresholds need review |
| Allergen safety pattern | Structured enums, `assertNoAllergenLeak` | Extend to food IDs |
| GDPR | Export, delete, consent, unsubscribe | Stable |
| Admin shell | `src/app/admin/*`, audit events | Extend |
| Portal UI patterns | Empty states, locked states, shell, motion | Rebind to new data |
| Content resolver | `src/lib/content/resolve.ts` | Extend for modular content |
| Tests | Existing engine/email tests | Migrate with engine |

---

## Code to replace or heavily refactor

| Area | Paths | Action |
|------|-------|--------|
| Plan engine | `src/lib/nutrition/plan-engine.ts` | Replace with pipeline modules; keep screening hook + determinism |
| Rotation | `src/lib/nutrition/rotation.ts` | Replace with 52-week food rotation service |
| Meal assembly | `src/lib/portal/meal-assembly.ts` | Replace after food matrix approval |
| Intake schema/UI | `src/lib/intake/schema.ts`, `intake-wizard.tsx` | New Biological OS quiz schema + UI |
| Plan regeneration | `src/lib/portal/plan-regenerate.ts` | Replace with versioned matrix operations |
| Entitlement consumers | `load-portal-data.ts`, webhook, admin | Refactor to product grants |
| Intake API | `src/app/api/portal/biometrics/route.ts` | Split into staged onboarding + approval endpoints |

---

## Database migrations required (high level)

New domains implied by master spec (exact schema in implementation plan):

1. **Commerce:** `Product`, `Bundle`, `BundleItem`, `Purchase`, `PurchaseLine`, `Subscription`, `EntitlementGrant` (user ↔ product, effective dates)  
2. **Food data:** `Food`, `FoodNutrient`, `Nutrient`, `FoodAllergen`, `FoodCategory`, `FoodSourceImport`, `FoodSubstitution`  
3. **Requirements:** `NutrientRequirement`, `RequirementSet`, `RequirementVersion`  
4. **Customer plan:** `BiologicalOsProfile` (or extend `IntakeProfile`), `ActivityEntry`, `ProteinPreference`, `MealStructure`, `FoodMatrix`, `FoodMatrixItem`, `FoodMatrixVersion`, `RedundancyChoice`, `FavouriteFood`, `UnresolvedAllergy`  
5. **Outputs:** `MealPlan`, `Meal`, `Recipe`, `RotationWeek`, `RotationWeekItem`, `GroceryList`, `DeliverableAsset` (PDF storage metadata)  
6. **Coaching:** `CoachingEngagement`, `CoachingSeat`, `CoachNote`, `CoachDeliverable`  
7. **Observations:** `SymptomObservation`, `SymptomPattern` (aggregates, non-diagnostic)  
8. **Health integrations:** `HealthDataProvider`, `HealthDataConnection`, `HealthMetric` (future)  
9. **Tax:** `TaxLine` on purchases or denormalized export view  

**Migration workflow:** Continue `prisma migrate diff` → hand review → `migrate deploy` per `rules.md` §7.

**Data migration:** Map existing `Entitlement` booleans → initial `EntitlementGrant` rows for legacy SKUs.

---

## Professional review gate (launch blockers)

| Domain | Owner | Current state |
|--------|-------|---------------|
| Energy & activity methodology | Nutrition/science reviewer | Placeholder activity factors |
| Screening thresholds | Clinician | `POLICY_VERSION = screening-0.1-UNREVIEWED` |
| Protein custom upper bounds | Clinician | Not implemented |
| Food composition datasets & licensing | Dietitian + legal | Not imported |
| Requirement reference values | Dietitian | Not modeled |
| All customer nutrition copy | Dietitian | Content catalogue empty |
| Health claims / EU 1924/2006 | Legal + dietitian | Process not started in content |
| GDPR DPAs & retention | Legal | Partial technical controls only |
| VAT / Finnish reporting | Accountant + legal | Not in system |

---

## Conflicts: old `plan.md` vs master spec

| Topic | Old plan | Master spec wins |
|-------|----------|------------------|
| Rotation length | 8 authored weeks, honest cycling | True 52-week system; UI must not overclaim |
| Unit system | One system for MVP | Four presentation modes; canonical grams internally |
| Biomarker view | Optional Phase 4 | Still optional; must stay reference-only |
| Localisation | next-intl EN/FI Phase 6 | Not in master spec §48; schedule after core product |
| Intake route | `/portal/intake` | Product-scoped onboarding routes |

---

## Conclusion

The repository is **production-grade infrastructure wrapping the wrong nutritional core**. The path forward is not incremental UI polish on the 13-slot calculator — it is a **layered replacement of the data model and engine** while preserving auth, commerce webhook security, email/cron reliability, tokens, and portal shell patterns.

Next document: `docs/IMPLEMENTATION_PLAN.md`.
