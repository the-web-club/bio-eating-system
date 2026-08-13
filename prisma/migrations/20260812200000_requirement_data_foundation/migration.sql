-- Phase 2 requirement data foundation: jurisdiction, provenance, and compliance metadata.

-- ---------------------------------------------------------------------------
-- New enum
-- ---------------------------------------------------------------------------
-- Prisma will create RequirementJurisdiction via schema sync; MariaDB enum added below.

-- ---------------------------------------------------------------------------
-- RequirementSourcePolicy compliance + jurisdiction
-- ---------------------------------------------------------------------------
ALTER TABLE `RequirementSourcePolicy`
  ADD COLUMN `jurisdiction` ENUM('GLOBAL', 'INTERNAL', 'EU', 'US', 'NORDIC') NOT NULL DEFAULT 'INTERNAL',
  ADD COLUMN `populationScope` TEXT NULL,
  ADD COLUMN `sourceUrl` TEXT NULL,
  ADD COLUMN `termsUrl` TEXT NULL,
  ADD COLUMN `license` TEXT NULL,
  ADD COLUMN `licenseName` VARCHAR(191) NULL,
  ADD COLUMN `licenseVersion` VARCHAR(191) NULL,
  ADD COLUMN `licenseUrl` TEXT NULL,
  ADD COLUMN `commercialUseAllowed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `storageAllowed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `transformationAllowed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `customerDisplayAllowed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `redistributionAllowed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `licenseVerified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `termsVerifiedAt` DATETIME(3) NULL,
  ADD COLUMN `verifiedBy` VARCHAR(191) NULL,
  ADD COLUMN `verificationMethod` VARCHAR(191) NULL,
  ADD COLUMN `verificationNotes` TEXT NULL,
  ADD COLUMN `attributionText` TEXT NULL,
  ADD COLUMN `citationRequirement` TEXT NULL,
  ADD COLUMN `devOnly` BOOLEAN NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- RequirementSet provenance fields
-- ---------------------------------------------------------------------------
ALTER TABLE `RequirementSet`
  ADD COLUMN `name` VARCHAR(191) NULL,
  ADD COLUMN `jurisdiction` ENUM('GLOBAL', 'INTERNAL', 'EU', 'US', 'NORDIC') NOT NULL DEFAULT 'INTERNAL',
  ADD COLUMN `populationScope` TEXT NULL,
  ADD COLUMN `source` VARCHAR(191) NULL,
  ADD COLUMN `sourceVersion` VARCHAR(191) NULL,
  ADD COLUMN `effectiveDate` DATETIME(3) NULL,
  ADD COLUMN `sourceUrl` TEXT NULL,
  ADD COLUMN `termsUrl` TEXT NULL,
  ADD COLUMN `importedAt` DATETIME(3) NULL;

UPDATE `RequirementSet`
SET
  `name` = COALESCE(`name`, `version`),
  `source` = COALESCE(`source`, 'unknown'),
  `sourceVersion` = COALESCE(`sourceVersion`, `version`)
WHERE `name` IS NULL OR `source` IS NULL OR `sourceVersion` IS NULL;

ALTER TABLE `RequirementSet`
  MODIFY `name` VARCHAR(191) NOT NULL,
  MODIFY `source` VARCHAR(191) NOT NULL,
  MODIFY `sourceVersion` VARCHAR(191) NOT NULL;

UPDATE `RequirementSet`
SET
  `jurisdiction` = 'INTERNAL',
  `populationScope` = 'Development fixture only',
  `devOnly` = true
WHERE `version` = 'fixture-v1';

-- ---------------------------------------------------------------------------
-- NutrientRequirement row metadata
-- ---------------------------------------------------------------------------
ALTER TABLE `NutrientRequirement`
  ADD COLUMN `devOnly` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

UPDATE `NutrientRequirement` nr
JOIN `RequirementSet` rs ON rs.id = nr.setId
SET nr.devOnly = rs.devOnly
WHERE rs.devOnly = true;

-- ---------------------------------------------------------------------------
-- EnergyMethod provenance fields
-- ---------------------------------------------------------------------------
ALTER TABLE `EnergyMethod`
  ADD COLUMN `source` VARCHAR(191) NULL,
  ADD COLUMN `sourceUrl` TEXT NULL,
  ADD COLUMN `termsUrl` TEXT NULL,
  ADD COLUMN `formulaDescription` TEXT NULL,
  ADD COLUMN `assumptions` TEXT NULL;
