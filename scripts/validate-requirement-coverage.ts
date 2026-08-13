import { writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  BIOLOGICAL_OS_NUTRIENT_SCOPE,
  PARTIALLY_SUPPORTED_NUTRIENTS,
  UNSUPPORTED_IN_USDA_SLICE,
  V1_POPULATION_SCOPE,
} from "../src/lib/nutrition-data/requirements/constants";
import { buildRequirementCoverageReport } from "../src/lib/nutrition-data/requirements/coverage-report";
import { evaluateRequirementSetProductionReady } from "../src/lib/nutrition-data/requirements/compliance-gate";
import {
  mapDbRequirementRows,
  resolveDailyRequirements,
} from "../src/lib/nutrition-data/requirements/lookup";
import { totalsForPortions } from "../src/lib/nutrition/contribution";
import type { NutrientContributionRow } from "../src/lib/nutrition-data/types";
import { FIXTURE_REQUIREMENT_SET_VERSION } from "../src/lib/nutrition-data/constants";

function createClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is required");
  const url = new URL(raw);
  const sslAccept = url.searchParams.get("sslaccept");
  const connectionLimitRaw = url.searchParams.get("connection_limit");
  const database = url.pathname.replace(/^\//, "");
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: database || undefined,
    connectionLimit: connectionLimitRaw ? Number(connectionLimitRaw) : 5,
    ssl:
      sslAccept === "strict"
        ? { rejectUnauthorized: true }
        : sslAccept === "accept_invalid_certs"
          ? { rejectUnauthorized: false }
          : undefined,
  });
  return new PrismaClient({ adapter });
}

function renderMarkdown(report: ReturnType<typeof buildRequirementCoverageReport> & {
  policyCode: string | null;
  setSource: string;
  setSourceVersion: string;
  setReviewStatus: string;
  setDevOnly: boolean;
  productionGateEligible: boolean;
  productionGateFailures: string[];
}): string {
  const lines = [
    "# Requirement data validation",
    "",
    "**Generated:** validation script",
    "",
    "## Requirement set used",
    "",
    `- **Version:** \`${report.requirementSetVersion}\``,
    `- **Policy:** \`${report.policyCode ?? "none"}\``,
    `- **Source:** ${report.setSource}`,
    `- **Source version:** ${report.setSourceVersion}`,
    `- **Population scope:** ${V1_POPULATION_SCOPE}`,
    `- **Review status:** ${report.setReviewStatus}`,
    `- **devOnly:** ${report.setDevOnly}`,
    "",
    "## Counts",
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Requirement rows | ${report.requirementRowCount} |`,
    `| Nutrients in requirement slice | ${report.nutrientCount} |`,
    `| Production USDA foods | ${report.productionFoodCount} |`,
    `| Nutrients in food catalog (production slice) | ${report.foodNutrientDefinitions} |`,
    "",
    "## Supported nutrients (requirement + food data)",
    "",
    report.supportedNutrients.length
      ? report.supportedNutrients.map((row) => `- \`${row}\``).join("\n")
      : "- none in this validation slice",
    "",
    "## Partially supported nutrients",
    "",
    report.partialNutrients.length
      ? report.partialNutrients.map((row) => `- \`${row}\``).join("\n")
      : "- none",
    "",
    "## Missing nutrients (in scope but absent from food slice)",
    "",
    report.missingNutrients.length
      ? report.missingNutrients.map((row) => `- \`${row}\``).join("\n")
      : "- none in fixture overlap analysis",
    "",
    "## Nutrients in Biological OS scope absent from current USDA slice",
    "",
    UNSUPPORTED_IN_USDA_SLICE.length
      ? `- ${UNSUPPORTED_IN_USDA_SLICE.map((row) => `\`${row}\``).join(", ")}`
      : "- none",
    "",
    "## Food / nutrient coverage",
    "",
    "| Food | Nutrients present |",
    "|------|-------------------|",
    ...report.foodPresence.map(
      (row) => `| ${row.foodName} | ${row.nutrientCodes.join(", ")} |`,
    ),
    "",
    "## Production gate",
    "",
    `- **Eligible:** ${report.productionGateEligible ? "yes" : "no"}`,
    ...(report.productionGateFailures.length
      ? report.productionGateFailures.map((row) => `- ${row}`)
      : ["- no blocking failures for dev fixture validation"]),
    "",
    "## Unresolved issues",
    "",
    ...(report.unresolvedIssues.length
      ? report.unresolvedIssues.map((row) => `- ${row}`)
      : ["- none"]),
    "",
    "## Limitations",
    "",
    "- USDA Foundation slice cannot support a complete Biological OS diet on its own.",
    !report.setDevOnly && report.setReviewStatus === "APPROVED"
      ? "- Production requirement set is imported under EFSA 2017 summary report reuse terms."
      : "- No approved production requirement set exists.",
    "- Phase 3 engine spike is complete in `src/lib/biological-os/` (31 tests, deterministic). Customer rollout is not complete. `BIOLOGICAL_OS_ENGINE` remains off. Legacy slot calculator remains the customer path.",
    "",
  ];
  return lines.join("\n");
}

async function main() {
  const prisma = createClient();

  const productionSet = await prisma.requirementSet.findFirst({
    where: { devOnly: false, reviewStatus: "APPROVED" },
    include: {
      sourcePolicy: true,
      requirements: {
        include: { nutrient: true },
      },
    },
    orderBy: { importedAt: "desc" },
  });

  const requirementSet =
    productionSet ??
    (await prisma.requirementSet.findUnique({
      where: { version: FIXTURE_REQUIREMENT_SET_VERSION },
      include: {
        sourcePolicy: true,
        requirements: {
          include: { nutrient: true },
        },
      },
    }));

  if (!requirementSet) {
    throw new Error("No requirement set found for validation");
  }

  const productionFoods = await prisma.food.findMany({
    where: { devOnly: false, source: "usda-fdc" },
    include: {
      nutrients: {
        include: { nutrient: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const storedRows = mapDbRequirementRows(requirementSet.requirements);
  const requirements = resolveDailyRequirements({
    profile: { age: 30, sex: "female" },
    rows: storedRows,
  });

  const profiles = new Map<string, NutrientContributionRow[]>();
  const foodPresence = productionFoods.map((food) => {
    const rows: NutrientContributionRow[] = food.nutrients.map((row) => ({
      nutrientCode: row.nutrient.code,
      unit: row.unit,
      amount: row.amount,
      perAmountG: row.perAmountG,
      source: row.source,
      sourceVersion: row.sourceVersion,
    }));
    profiles.set(food.id, rows);
    return {
      foodId: food.id,
      foodName: food.name,
      nutrientCodes: [...new Set(rows.map((row) => row.nutrientCode))].sort(),
    };
  });

  const totals = totalsForPortions({
    portions: productionFoods.map((food) => ({ foodId: food.id, grams: 100 })),
    profiles,
  });

  const unresolvedIssues = productionSet
    ? [
        "USDA Foundation slice cannot support a complete Biological OS diet on its own.",
        "Sodium requirement not imported (EFSA evaluation ongoing in 2017 report).",
        "Chromium has no EFSA scalar DRV row; tracked as monitor-only food composition.",
        "Energy reference handled via EnergyMethod, not scalar NutrientRequirement rows.",
        "Carbohydrate and fat AMDR (% energy) not stored as scalar rows.",
        "Thiamin and niacin requirement rows use mg/day values converted from EFSA mg/MJ PRIs with reference energy 11.2 MJ (male) and 9.0 MJ (female).",
      ]
    : [
        "No APPROVED production RequirementSet exists.",
        "26 USDA foods cannot support a complete Biological OS diet.",
      ];

  const gate = evaluateRequirementSetProductionReady({
    version: requirementSet.version,
    devOnly: requirementSet.devOnly,
    reviewStatus: requirementSet.reviewStatus,
    source: requirementSet.source,
    sourceVersion: requirementSet.sourceVersion,
    sourceUrl: requirementSet.sourceUrl,
    termsUrl: requirementSet.termsUrl,
    jurisdiction: requirementSet.jurisdiction,
    requirements: requirementSet.requirements.map((row) => ({
      nutrientCode: row.nutrient.code,
      reviewStatus: row.reviewStatus,
      devOnly: row.devOnly,
      referenceType: row.referenceType,
      value: row.value,
      valueMin: row.valueMin,
      valueMax: row.valueMax,
      unit: row.unit,
    })),
  });

  const report = buildRequirementCoverageReport({
    requirementSetVersion: requirementSet.version,
    requirements,
    totals,
    foodPresence,
    trackedNutrients: [...BIOLOGICAL_OS_NUTRIENT_SCOPE],
    partialNutrients: [...PARTIALLY_SUPPORTED_NUTRIENTS],
    unresolvedIssues,
  });

  const markdown = renderMarkdown({
    ...report,
    policyCode: requirementSet.sourcePolicy?.code ?? null,
    setSource: requirementSet.source,
    setSourceVersion: requirementSet.sourceVersion,
    setReviewStatus: requirementSet.reviewStatus,
    setDevOnly: requirementSet.devOnly,
    productionGateEligible: gate.eligible,
    productionGateFailures: gate.failures,
  });

  const outPath = path.join(process.cwd(), "docs/REQUIREMENT_DATA_VALIDATION.md");
  writeFileSync(outPath, markdown, "utf8");

  console.log(JSON.stringify({ ...report, productionGateEligible: gate.eligible }, null, 2));
  console.log(`Wrote ${outPath}`);
  console.log(`Tracked scope nutrients missing from USDA slice: ${UNSUPPORTED_IN_USDA_SLICE.join(", ") || "none"}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
