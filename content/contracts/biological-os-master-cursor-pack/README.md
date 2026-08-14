# Biological OS Master Cursor Pack

Use `cursor-master-prompt.md` as the implementation prompt.

The JSON schemas define the canonical data contracts. These contracts do not invent scientific values; populate them only from approved source files supplied to the repository.

## Repository wiring

| Contract | Repo implementation |
|----------|---------------------|
| `biological-os-rules.json` | v2 rules aligned with production (`efsa-drv-eu-2017-v2`, USDA v3, 94 nutrients, 57 phytonutrients) |
| `food-record.schema.json` | `src/lib/nutrition-data/schema.ts` + USDA import |
| `requirement-record.schema.json` | `content/requirements/efsa-drv-eu-2017-v2.json` |
| `phytonutrient-record.schema.json` | `content/phytonutrients/phytonutrient-catalog-v2.json` |
| `activity-record.schema.json` | `content/activity/met-reference-v1.json` |
| Zod mirrors | `src/lib/biological-os/contracts/` |
| Energy / MET | `src/lib/biological-os/energy.ts`, `activity-profile.ts` |
| Phytonutrient diversity | `src/lib/biological-os/phytonutrient-diversity.ts` |
| Adequacy / UNKNOWN | `src/lib/biological-os/adequacy.ts` |
