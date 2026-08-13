# Requirement data validation

**Generated:** validation script

## Requirement set used

- **Version:** `efsa-drv-eu-2017-v1`
- **Policy:** `efsa-drv-eu-v1`
- **Source:** EFSA
- **Source version:** 2017-e15121
- **Population scope:** Healthy adults aged 18-49 years without clinical conditions
- **Review status:** APPROVED
- **devOnly:** false

## Counts

| Metric | Value |
|--------|-------|
| Requirement rows | 13 |
| Nutrients in requirement slice | 13 |
| Production USDA foods | 26 |
| Nutrients in food catalog (production slice) | 17 |

## Supported nutrients (requirement + food data)

- `protein`
- `fiber`
- `vitamin_a`
- `vitamin_c`
- `vitamin_d`
- `folate`
- `vitamin_b12`
- `calcium`
- `iron`
- `magnesium`
- `potassium`
- `zinc`
- `omega3`

## Partially supported nutrients

- `vitamin_e`
- `vitamin_k`
- `thiamin`
- `riboflavin`
- `niacin`
- `vitamin_b6`
- `phosphorus`
- `copper`
- `selenium`
- `iodine`

## Missing nutrients (in scope but absent from food slice)

- none in fixture overlap analysis

## Nutrients in Biological OS scope absent from current USDA slice

- `vitamin_e`, `vitamin_k`, `thiamin`, `riboflavin`, `niacin`, `vitamin_b6`, `phosphorus`, `copper`, `selenium`, `iodine`

## Food / nutrient coverage

| Food | Nutrients present |
|------|-------------------|
| Apple, red delicious, raw | calcium, carbohydrate, energy_kcal, fat, fiber, magnesium, potassium, protein, zinc |
| Beef, ground, 90% lean, raw | calcium, energy_kcal, fat, iron, magnesium, potassium, protein, sodium, zinc |
| Bison, ground, raw | calcium, energy_kcal, fat, iron, magnesium, potassium, protein, sodium, zinc |
| Blackberries, raw | calcium, energy_kcal, iron, magnesium, potassium, protein, sodium, vitamin_c, zinc |
| Blueberries, raw | calcium, carbohydrate, energy_kcal, fat, iron, magnesium, potassium, protein, vitamin_c, zinc |
| Bread, whole wheat | calcium, carbohydrate, energy_kcal, fat, fiber, folate, iron, magnesium, potassium, protein, sodium, zinc |
| Broccoli, raw | calcium, carbohydrate, energy_kcal, fat, fiber, folate, iron, magnesium, potassium, protein, sodium, vitamin_a, vitamin_c, zinc |
| Chicken breast, cooked | calcium, energy_kcal, fat, iron, magnesium, omega3, potassium, protein, sodium, vitamin_b12, zinc |
| Chicken breast, raw | calcium, energy_kcal, fat, iron, magnesium, potassium, protein, sodium, zinc |
| Eggs, whole | calcium, carbohydrate, energy_kcal, fat, folate, iron, magnesium, potassium, protein, sodium, vitamin_a, vitamin_b12, vitamin_d, zinc |
| Garlic, raw | carbohydrate, energy_kcal, fat, fiber, protein, vitamin_c |
| Kale, raw | calcium, carbohydrate, energy_kcal, fat, fiber, folate, iron, magnesium, potassium, protein, sodium, vitamin_a, vitamin_c, zinc |
| Kiwifruit, green, raw | calcium, carbohydrate, energy_kcal, fat, fiber, folate, iron, magnesium, potassium, protein, sodium, vitamin_a, vitamin_c, zinc |
| Lamb, ground, raw | calcium, energy_kcal, fat, iron, magnesium, potassium, protein, sodium, zinc |
| Mushrooms, white button | calcium, carbohydrate, energy_kcal, fat, fiber, folate, iron, magnesium, potassium, protein, sodium, vitamin_d, zinc |
| Oats, rolled, old fashioned | calcium, carbohydrate, energy_kcal, fat, folate, iron, magnesium, potassium, protein, sodium, zinc |
| Olive oil, extra virgin | energy_kcal, protein |
| Potato, russet, raw | calcium, carbohydrate, energy_kcal, fat, iron, magnesium, potassium, protein, sodium, vitamin_c, zinc |
| Pumpkin seeds, raw | calcium, carbohydrate, energy_kcal, fat, fiber, iron, magnesium, potassium, protein, zinc |
| Salmon, Atlantic, farm raised, raw | calcium, energy_kcal, fat, iron, magnesium, omega3, potassium, protein, sodium, vitamin_b12, zinc |
| Salmon, sockeye, wild, raw | calcium, energy_kcal, fat, iron, magnesium, omega3, potassium, protein, sodium, vitamin_b12, zinc |
| Sunflower seeds, dry roasted | calcium, carbohydrate, energy_kcal, fat, fiber, folate, iron, magnesium, potassium, protein, sodium, vitamin_a, zinc |
| Sweet potato, raw | calcium, carbohydrate, energy_kcal, fat, iron, magnesium, potassium, protein, vitamin_c, zinc |
| Tomatoes, grape, raw | calcium, carbohydrate, energy_kcal, fat, fiber, folate, iron, magnesium, potassium, protein, sodium, vitamin_c, zinc |
| Turkey, ground, raw | calcium, energy_kcal, fat, iron, magnesium, potassium, protein, sodium, zinc |
| Yogurt, plain, whole milk | calcium, carbohydrate, energy_kcal, fat, magnesium, potassium, protein, sodium, vitamin_d, zinc |

## Production gate

- **Eligible:** yes
- no blocking failures for dev fixture validation

## Unresolved issues

- 26 USDA foods cannot support a complete Biological OS diet.
- Sodium requirement not imported (EFSA evaluation ongoing in 2017 report).
- Energy reference handled via EnergyMethod, not scalar NutrientRequirement rows.
- Carbohydrate and fat AMDR (% energy) not stored as scalar rows.

## Limitations

- The 26-food USDA Foundation slice is a validation slice only, not a complete Biological OS catalog.
- Production requirement set is imported under EFSA 2017 summary report reuse terms.
- Phase 3 engine spike is complete in `src/lib/biological-os/` (31 tests, deterministic). Customer rollout is not complete. `BIOLOGICAL_OS_ENGINE` remains off. Legacy slot calculator remains the customer path.
