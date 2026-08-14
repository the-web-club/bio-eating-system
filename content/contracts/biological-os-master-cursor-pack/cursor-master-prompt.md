# CURSOR MASTER PROMPT — BIOLOGICAL EATING SYSTEM

Use the JSON contracts in this pack as the implementation source of truth.

## Product objective
Build a deterministic personalized biological eating engine. It must calculate from approved data:
- individual energy needs,
- individual macro targets,
- individual micronutrient requirements,
- food composition,
- phytonutrient composition/diversity where data exists,
- exercise and daily movement,
- allergies/exclusions/preferences,
- favorite foods.

Never invent scientific values. Never treat missing data as zero or as satisfied.

## Food data
Import all supplied datasets into one normalized internal catalog while preserving:
source, source version, original record ID, preparation state, serving basis, nutrient units, license/provenance and review status.

Do not discard records merely because names differ. Deduplicate only when equivalence is demonstrable. Never merge conflicting measurements silently.

Only APPROVED, non-dev-only sources enter the production optimizer.

## Human requirements
Use `efsa-drv-eu-2017-v2` for the approved production requirement set (`efsa-drv-eu-2017-v1` retained for regression) and the repository's existing age/sex/reference-priority lookup.

Support AR, PRI, AI, RI, UL and AMDR. Never average conflicting requirements. If no approved requirement exists, return UNKNOWN.

## Energy and activity
Use Mifflin-St Jeor for BMR.

Exercise rows:
- label: free text, display only
- minutesPerSession: number
- sessionsPerWeek: number
- metCode + metValue: resolved from approved reference data
- source/version
- resolution: exact | category_match | unresolved_pending

Exercise kcal/week = MET * weightKg * (minutes/60) * sessionsPerWeek.
Daily exercise kcal = weekly sum / 7.
TDEE = BMR * baselineOccupationPAL + dailyExerciseKcal.

Do not drive calculations from the legacy sedentary/light/moderate/active enum.

For unknown exercise, never have AI invent a MET. Try approved alias lookup; otherwise ask for closest structured category + intensity. Store original text and resolution. A generic fallback may exist only as an explicit, documented approximate path.

## Food optimization
This is a constrained biological coverage engine, not a random meal generator.

Hard constraints:
- allergies,
- hard exclusions,
- approved source,
- dev-only exclusion,
- required foods,
- existing safety constraints.

Objective order:
1. feasibility,
2. energy/macronutrient coverage,
3. micronutrient coverage,
4. UL safety,
5. nutrient diversity,
6. phytonutrient-family/plant diversity,
7. minimize unnecessary redundancy,
8. user preferences and favorite foods.

“0 redundancy” means zero *unnecessary* redundancy, not zero nutrient overlap. Useful overlap is allowed.

Never silently remove or replace a user-selected food. Add/remove operations must return coverage deltas and ranked alternatives.

After biological adequacy is reached, users may add favorite foods when feasible. Recalculate the plan and explain any resulting gap/excess/redundancy rather than silently deleting the favorite.

## Phytonutrients
Store approved composition values and normalize units. Track compound class/subclass and include available data in diversity scoring.

Do NOT create fake universal daily phytonutrient RDAs. Do NOT make disease-prevention/treatment claims from composition data alone.

Missing phytonutrient data is UNKNOWN, not zero.

## Meal-plan correctness
A plan may be called “biologically complete” only if every required tracked nutrient has:
- an approved requirement,
- sufficient approved composition data,
- calculated contribution,
- applicable coverage achieved.

Otherwise explicitly report incomplete/unknown status.

Expose targets, actuals, coverage %, unresolved nutrients, UL warnings, phytonutrient diversity indicators, selected foods, reasons, user-added foods and data versions.

## Determinism
Identical profile + food universe + requirement version + MET version + algorithm version must produce identical results.

Persist versioned matrix snapshots with food-data version, requirement version, energy calculation version, optimizer version and change reasons.

## Tests before rollout
Add tests for:
requirements by age/sex; protein preference; Mifflin-St Jeor; multiple exercise rows; MET calculations; occupation PAL; no double counting; unknown activity resolution; allergens; required-food preservation; nutrient coverage; ULs; UNKNOWN data; phytonutrient diversity; unnecessary redundancy; favorite-food preservation; add/remove recalculation; deterministic snapshots; compliance; no fabricated values.

Do not enable `BIOLOGICAL_OS_ENGINE` in this task.

## Implementation order
1. Validate supplied datasets and licensing.
2. Normalize/import food data.
3. Canonical nutrient mapping.
4. Requirement resolution.
5. Activity/energy logic.
6. Food contribution/coverage.
7. Phytonutrient diversity.
8. Constrained optimizer.
9. Add/remove/favorite recalculation.
10. Matrix snapshots.
11. Typecheck, tests, build.
12. Report complete, incomplete and REVIEW_REQUIRED items.

Do not bypass compliance to maximize food count. Prefer breadth of approved data, not guessed data.
