# Requirement source policy

**Repository:** `github.com/the-web-club/bio-eating-system`  
**Status:** Phase 2 complete — production EFSA requirement slice imported  
**Date:** 2026-08-12  

---

## V1 controlling framework

| Field | Value |
|-------|-------|
| **Production framework** | EFSA Dietary Reference Values (EU) |
| **Policy code** | `efsa-drv-eu-v1` |
| **Requirement set version** | `efsa-drv-eu-2017-v2` (production), `efsa-drv-eu-2017-v1` (regression) |
| **Jurisdiction** | `EU` |
| **Population scope** | Healthy adults aged 18-49 years without clinical conditions |
| **Source document** | EFSA supporting publication 2017:e15121 |
| **Source URL** | https://www.efsa.europa.eu/sites/default/files/2017_09_DRVs_summary_report.pdf |
| **Terms URL** | https://www.efsa.europa.eu/en/legalnotice |
| **Status** | **APPROVED** |

---

## Legal / reuse basis

Official document copyright notice (2017 DRV Summary Report):

> © European Food Safety Authority, 2017. **Reproduction is authorised provided the source is acknowledged.**

EFSA website legal notice (Copyright):

> Re-use is authorised, provided that EFSA is acknowledged as the source of the material.

**Verification method:** `official-document-copyright-notice`  
**Verified:** 2026-08-12  
**Attribution required:** yes — EFSA must be acknowledged as source (suggested citation: doi:10.2903/sp.efsa.2017.e15121)

Numeric values are imported only from official summary report tables. No unofficial summaries, scraped sites, or LLM-generated values.

---

## Fallback / reference-only sources

| Policy code | Jurisdiction | Role | Status |
|-------------|--------------|------|--------|
| `nnr2023-nordic-v1` | `NORDIC` | Reference comparison only | `REVIEW_REQUIRED` |
| `us-dri-v1` | `US` | Future US RequirementSet | `REVIEW_REQUIRED` |
| `policy-pending-review` | `INTERNAL` | Placeholder | `REVIEW_REQUIRED`, `devOnly=true` |

NNR2023 and US DRI numeric commercial reuse terms remain unclear. They are **not** imported.

---

## Conflict handling

When authoritative sources disagree:

1. Retain both source values with provenance  
2. Record conflict in `RequirementConflict`  
3. Apply EFSA EU policy as V1 primary  
4. Never auto-average  

---

## Production nutrient scope (imported slice)

**42 requirement rows, 29 nutrients** for adults 18-49 (`efsa-drv-eu-2017-v2`). Version `efsa-drv-eu-2017-v1` (13 nutrients) remains in the repo for regression only.

| Nutrient | Reference types | Sex-specific |
|----------|-----------------|--------------|
| protein | PRI | yes |
| fiber | AI | no |
| omega3 (EPA+DHA) | AI | no |
| calcium | PRI | yes (same value) |
| iron | PRI | yes |
| magnesium | AI | yes |
| potassium | AI | no |
| zinc | PRI | yes |
| phosphorus | AI | no |
| copper | AI | yes |
| selenium | AI | no |
| iodine | AI | no |
| manganese | AI | no |
| molybdenum | AI | no |
| fluoride | AI | yes |
| vitamin_a | PRI | yes |
| vitamin_c | PRI | yes |
| vitamin_d | AI | no |
| vitamin_e | AI | yes |
| vitamin_k | AI | no |
| thiamin | PRI | yes (converted from mg/MJ) |
| riboflavin | PRI | no |
| niacin | PRI | yes (converted from mg NE/MJ) |
| vitamin_b6 | PRI | yes |
| folate | PRI | no |
| vitamin_b12 | AI | no |
| biotin | AI | no |
| pantothenic_acid | AI | no |
| choline | AI | no |

**Not imported (documented gaps):**

| Item | Reason |
|------|--------|
| sodium | EFSA sodium/chloride evaluation ongoing in 2017 report |
| chromium | EFSA considered setting an AI or PRI not appropriate |
| energy_kcal | Handled via versioned `EnergyMethod`, not scalar DRV rows |
| carbohydrate / fat AMDR | Expressed as % energy; not stored as scalar rows in V1 |

---

## Energy (separate from DRV)

`EnergyMethod` placeholder (`pending-energy-method`, `REVIEW_REQUIRED`). Energy remains an **estimate**.

---

## Protein (reference vs preference)

| Layer | Model |
|-------|-------|
| Reference requirement | `NutrientRequirement` from EFSA PRI (g/day from g/kg × reference body weight) |
| User preference | `ProteinPreference` (0.7, 1.0, 1.6, 2.2 g/kg, no preference, custom) |

---

## Production gate

Enforced in `compliance-gate.ts`, `importer.ts`, `production-gate.ts`.

Production paths require:

- Approved `RequirementSourcePolicy` with documented reuse terms  
- Approved `RequirementSet` with `devOnly=false`  
- Approved nutrient rows with provenance  

---

## Phase 3 gate

**Phase 2 requirement foundation: COMPLETE**

**Phase 3 engine spike: COMPLETE** — pure-library pipeline in `src/lib/biological-os/` (31 tests, deterministic).

**Phase 3 customer rollout: NOT READY**

- Customer portal still uses the legacy slot calculator
- DB persistence, API wrapper, remaining engine modules, and UX integration are outstanding
- `BIOLOGICAL_OS_ENGINE` remains `false`
