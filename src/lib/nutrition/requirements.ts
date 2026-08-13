export {
  DEFAULT_REFERENCE_TYPE_PRIORITY,
  filterRequirementsByAge,
  filterRequirementsBySex,
  mapDbRequirementRows,
  normalizeRequirementUnit,
  requirementScalarValue,
  resolveDailyRequirements,
  selectRequirementByReferenceType,
  type StoredRequirementRow,
} from "@/lib/nutrition-data/requirements/lookup";

export const REQUIREMENT_ENGINE_VERSION = "requirements-0.2.0";
