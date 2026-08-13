-- Phase 2 completion: production-capable nutrition data foundation.
-- Non-destructive where possible. Fixture rows marked devOnly.

-- ---------------------------------------------------------------------------
-- New tables
-- ---------------------------------------------------------------------------
CREATE TABLE `PreparationState` (
    `id` VARCHAR(191) NOT NULL,
    `slug` ENUM('RAW', 'BOILED', 'STEAMED', 'BAKED', 'ROASTED', 'GRILLED', 'FRIED', 'CANNED', 'FERMENTED', 'DRIED', 'COOKED', 'OTHER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `PreparationState_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `PreparationState` (`id`, `slug`, `name`, `updatedAt`) VALUES
  (UUID(), 'RAW', 'Raw', NOW(3)),
  (UUID(), 'BOILED', 'Boiled', NOW(3)),
  (UUID(), 'STEAMED', 'Steamed', NOW(3)),
  (UUID(), 'BAKED', 'Baked', NOW(3)),
  (UUID(), 'ROASTED', 'Roasted', NOW(3)),
  (UUID(), 'GRILLED', 'Grilled', NOW(3)),
  (UUID(), 'FRIED', 'Fried', NOW(3)),
  (UUID(), 'CANNED', 'Canned', NOW(3)),
  (UUID(), 'FERMENTED', 'Fermented', NOW(3)),
  (UUID(), 'DRIED', 'Dried', NOW(3)),
  (UUID(), 'COOKED', 'Cooked', NOW(3)),
  (UUID(), 'OTHER', 'Other', NOW(3));

CREATE TABLE `FoodDataSource` (
    `id` VARCHAR(191) NOT NULL,
    `sourceKey` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `datasetName` VARCHAR(191) NOT NULL,
    `datasetVersion` VARCHAR(191) NULL,
    `releaseDate` DATETIME(3) NULL,
    `accessMethod` VARCHAR(191) NOT NULL,
    `license` TEXT NOT NULL,
    `licenseUrl` TEXT NULL,
    `commercialUseAllowed` BOOLEAN NOT NULL DEFAULT false,
    `redistributionAllowed` BOOLEAN NOT NULL DEFAULT false,
    `citationRequirement` TEXT NULL,
    `sourceUrl` TEXT NULL,
    `devOnly` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('CANDIDATE', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'CANDIDATE',
    `notes` TEXT NULL,
    `importedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `FoodDataSource_sourceKey_key`(`sourceKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RequirementSourcePolicy` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `authority` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `effectiveDate` DATETIME(3) NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `foodDataSourceId` VARCHAR(191) NULL,
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `conflictResolution` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `RequirementSourcePolicy_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RequirementConflict` (
    `id` VARCHAR(191) NOT NULL,
    `nutrientCode` VARCHAR(191) NOT NULL,
    `primaryPolicyId` VARCHAR(191) NOT NULL,
    `secondaryPolicyId` VARCHAR(191) NOT NULL,
    `primaryValue` DOUBLE NOT NULL,
    `secondaryValue` DOUBLE NOT NULL,
    `unit` ENUM('g', 'mg', 'mcg', 'kcal', 'iu') NOT NULL,
    `resolution` TEXT NULL,
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `RequirementConflict_nutrientCode_idx`(`nutrientCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FoodImportReportRow` (
    `id` VARCHAR(191) NOT NULL,
    `importId` VARCHAR(191) NOT NULL,
    `outcome` ENUM('imported', 'rejected', 'warning') NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `FoodImportReportRow_importId_outcome_idx`(`importId`, `outcome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BiologicalCategoryFood` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `eligibilityStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'IMPORTED',
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `reasonSource` TEXT NULL,
    `notes` TEXT NULL,
    UNIQUE INDEX `BiologicalCategoryFood_categoryId_foodId_key`(`categoryId`, `foodId`),
    INDEX `BiologicalCategoryFood_categoryId_priority_idx`(`categoryId`, `priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserAllergen` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `allergen` ENUM('egg', 'fish', 'crustaceans', 'molluscs', 'milk', 'soy', 'gluten', 'tree_nuts', 'peanuts', 'sesame', 'celery', 'mustard', 'sulphites', 'lupin') NOT NULL,
    `notes` TEXT NULL,
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `UserAllergen_userId_allergen_key`(`userId`, `allergen`),
    INDEX `UserAllergen_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserFoodPreference` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NULL,
    `kind` ENUM('HARD_EXCLUSION', 'HARD_PREFERENCE', 'SOFT_PREFERENCE', 'OPTIMIZATION_PREFERENCE') NOT NULL,
    `notes` TEXT NULL,
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `UserFoodPreference_userId_kind_idx`(`userId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ActivityEntry` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `activityType` VARCHAR(191) NOT NULL,
    `sessionsPerWeek` INTEGER NOT NULL,
    `minutesPerSession` INTEGER NOT NULL,
    `intensity` VARCHAR(191) NOT NULL,
    `distanceKm` DOUBLE NULL,
    `volumeNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `ActivityEntry_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProteinPreference` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `preference` ENUM('g_per_kg_0_7', 'g_per_kg_1_0', 'g_per_kg_1_6', 'g_per_kg_2_2', 'no_preference', 'custom') NOT NULL DEFAULT 'no_preference',
    `customValue` DOUBLE NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'g_per_kg',
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ProteinPreference_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EnergyMethod` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `EnergyMethod_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EnergyEstimate` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `energyMethodId` VARCHAR(191) NOT NULL,
    `profileSnapshot` JSON NOT NULL,
    `activitySnapshot` JSON NOT NULL,
    `resultKcal` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `EnergyEstimate_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FoodMatrixVersion` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'DRAFT',
    `engineVersion` VARCHAR(191) NULL,
    `foodDatasetVersion` VARCHAR(191) NULL,
    `requirementSetVersion` VARCHAR(191) NULL,
    `calculationVersion` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `FoodMatrixVersion_userId_version_key`(`userId`, `version`),
    INDEX `FoodMatrixVersion_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FoodMatrixItem` (
    `id` VARCHAR(191) NOT NULL,
    `matrixVersionId` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NOT NULL,
    `biologicalCategorySlug` ENUM('eggs', 'organ_meat', 'small_fish', 'bivalves', 'muscle_meat', 'tubers', 'cruciferous', 'berries', 'olive_oil', 'fermented', 'kiwi', 'mushrooms', 'aromatics') NULL,
    `portionGrams` DOUBLE NULL,
    `preference` ENUM('HARD_EXCLUSION', 'HARD_PREFERENCE', 'SOFT_PREFERENCE', 'OPTIMIZATION_PREFERENCE') NOT NULL DEFAULT 'SOFT_PREFERENCE',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    UNIQUE INDEX `FoodMatrixItem_matrixVersionId_foodId_key`(`matrixVersionId`, `foodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RedundancyAssessment` (
    `id` VARCHAR(191) NOT NULL,
    `matrixVersionId` VARCHAR(191) NOT NULL,
    `foodAId` VARCHAR(191) NOT NULL,
    `foodBId` VARCHAR(191) NOT NULL,
    `level` ENUM('NONE', 'POTENTIAL', 'INTENTIONAL') NOT NULL DEFAULT 'POTENTIAL',
    `overlapNutrients` JSON NOT NULL,
    `evidence` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `RedundancyAssessment_matrixVersionId_foodAId_foodBId_key`(`matrixVersionId`, `foodAId`, `foodBId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RedundancyChoice` (
    `id` VARCHAR(191) NOT NULL,
    `matrixVersionId` VARCHAR(191) NOT NULL,
    `foodAId` VARCHAR(191) NOT NULL,
    `foodBId` VARCHAR(191) NOT NULL,
    `decision` ENUM('keep_both', 'remove_a', 'remove_b', 'review') NOT NULL,
    `decidedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `RedundancyChoice_matrixVersionId_foodAId_foodBId_key`(`matrixVersionId`, `foodAId`, `foodBId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FoodDiversityRule` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `targetMetric` VARCHAR(191) NOT NULL,
    `evidenceSource` TEXT NULL,
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `version` VARCHAR(191) NOT NULL DEFAULT '1.0.0',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `FoodDiversityRule_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BioavailabilityRule` (
    `id` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NULL,
    `ruleCode` VARCHAR(191) NOT NULL,
    `evidenceSource` TEXT NULL,
    `confidence` VARCHAR(191) NULL,
    `reviewer` VARCHAR(191) NULL,
    `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
    `version` VARCHAR(191) NOT NULL DEFAULT '1.0.0',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Alter Nutrient
ALTER TABLE `Nutrient`
  ADD COLUMN `canonicalName` VARCHAR(191) NULL,
  ADD COLUMN `displayName` VARCHAR(191) NULL,
  ADD COLUMN `nutrientClass` ENUM('ENERGY', 'MACRONUTRIENT', 'FATTY_ACID', 'VITAMIN', 'MINERAL', 'OTHER_NUTRIENT') NOT NULL DEFAULT 'OTHER_NUTRIENT',
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `referenceTypeSupport` JSON NOT NULL DEFAULT (JSON_ARRAY()),
  ADD COLUMN `sourceMappingIdentifiers` JSON NOT NULL DEFAULT (JSON_OBJECT()),
  ADD COLUMN `status` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED';

UPDATE `Nutrient` SET `canonicalName` = `name`, `displayName` = `name` WHERE `canonicalName` IS NULL;
ALTER TABLE `Nutrient` MODIFY `canonicalName` VARCHAR(191) NOT NULL, MODIFY `displayName` VARCHAR(191) NOT NULL;

-- Alter Food
ALTER TABLE `Food`
  ADD COLUMN `canonicalName` VARCHAR(191) NULL,
  ADD COLUMN `displayName` VARCHAR(191) NULL,
  ADD COLUMN `localizedNames` JSON NOT NULL DEFAULT (JSON_OBJECT()),
  ADD COLUMN `aliases` JSON NOT NULL DEFAULT (JSON_ARRAY()),
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `devOnly` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `foodDataSourceId` VARCHAR(191) NULL,
  ADD COLUMN `sourceImportId` VARCHAR(191) NULL,
  ADD COLUMN `preparationStateId` VARCHAR(191) NULL,
  ADD COLUMN `processingState` ENUM('RAW', 'BOILED', 'STEAMED', 'BAKED', 'ROASTED', 'GRILLED', 'FRIED', 'CANNED', 'FERMENTED', 'DRIED', 'COOKED', 'OTHER') NULL,
  ADD COLUMN `biologicalCategoryId` VARCHAR(191) NULL,
  ADD COLUMN `ediblePortionDescription` TEXT NULL,
  ADD COLUMN `defaultServingWeightG` DOUBLE NULL,
  ADD COLUMN `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'IMPORTED',
  ADD COLUMN `approvedAt` DATETIME(3) NULL,
  ADD COLUMN `approvedBy` VARCHAR(191) NULL;

UPDATE `Food` SET `canonicalName` = `name`, `displayName` = `name` WHERE `canonicalName` IS NULL;
UPDATE `Food` SET `devOnly` = true, `reviewStatus` = 'REVIEW_REQUIRED' WHERE `source` = 'fixture-v1';
ALTER TABLE `Food` MODIFY `canonicalName` VARCHAR(191) NOT NULL;

-- Alter FoodNutrient
ALTER TABLE `FoodNutrient`
  ADD COLUMN `unit` ENUM('g', 'mg', 'mcg', 'kcal', 'iu') NOT NULL DEFAULT 'g',
  ADD COLUMN `basisAmount` DOUBLE NOT NULL DEFAULT 100,
  ADD COLUMN `basisUnit` VARCHAR(191) NOT NULL DEFAULT 'g',
  ADD COLUMN `ediblePortionBasis` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `sourceImportId` VARCHAR(191) NULL,
  ADD COLUMN `analyticalMethod` VARCHAR(191) NULL,
  ADD COLUMN `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'IMPORTED';

UPDATE `FoodNutrient` fn
JOIN `Nutrient` n ON n.id = fn.nutrientId
SET fn.unit = n.unit;

UPDATE `FoodNutrient` fn
JOIN `Food` f ON f.id = fn.foodId
SET fn.reviewStatus = 'REVIEW_REQUIRED'
WHERE f.source = 'fixture-v1';

-- Alter FoodAllergen
ALTER TABLE `FoodAllergen`
  ADD COLUMN `source` VARCHAR(191) NULL,
  ADD COLUMN `sourceVersion` VARCHAR(191) NULL,
  ADD COLUMN `confidence` VARCHAR(191) NULL,
  ADD COLUMN `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED';

-- Alter FoodSubstitution
ALTER TABLE `FoodSubstitution`
  ADD COLUMN `nutrientCoverageEvidence` JSON NOT NULL DEFAULT (JSON_OBJECT()),
  ADD COLUMN `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
  ADD COLUMN `sourceVersion` VARCHAR(191) NULL;

-- Alter FoodSourceImport
ALTER TABLE `FoodSourceImport`
  ADD COLUMN `foodDataSourceId` VARCHAR(191) NULL,
  ADD COLUMN `rowsReceived` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `rowsImported` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `rowsRejected` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `rowsWarning` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `checksum` VARCHAR(191) NULL,
  ADD COLUMN `report` JSON NOT NULL DEFAULT (JSON_OBJECT());

-- Alter RequirementSet
ALTER TABLE `RequirementSet`
  ADD COLUMN `sourcePolicyId` VARCHAR(191) NULL,
  ADD COLUMN `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
  ADD COLUMN `devOnly` BOOLEAN NOT NULL DEFAULT false;

UPDATE `RequirementSet` SET `devOnly` = true, `reviewStatus` = 'REVIEW_REQUIRED' WHERE `version` = 'fixture-v1';
UPDATE `RequirementSet` SET `reviewStatus` = 'APPROVED' WHERE `status` = 'approved' AND `version` <> 'fixture-v1';
UPDATE `RequirementSet` SET `reviewStatus` = 'REVIEW_REQUIRED' WHERE `status` IN ('draft', 'reviewed');

ALTER TABLE `RequirementSet` DROP COLUMN `status`;

-- Alter NutrientRequirement
ALTER TABLE `NutrientRequirement`
  ADD COLUMN `lifeStage` VARCHAR(191) NULL,
  ADD COLUMN `referenceType` ENUM('AR', 'PRI', 'AI', 'RI', 'UL', 'AMDR', 'OTHER_REVIEWED_REFERENCE') NOT NULL DEFAULT 'OTHER_REVIEWED_REFERENCE',
  ADD COLUMN `valueMin` DOUBLE NULL,
  ADD COLUMN `valueMax` DOUBLE NULL,
  ADD COLUMN `sourcePolicyCode` VARCHAR(191) NULL,
  ADD COLUMN `sourceVersion` VARCHAR(191) NULL,
  ADD COLUMN `effectiveDate` DATETIME(3) NULL,
  ADD COLUMN `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED';

UPDATE `NutrientRequirement` nr
JOIN `RequirementSet` rs ON rs.id = nr.setId
SET nr.reviewStatus = 'REVIEW_REQUIRED'
WHERE rs.version = 'fixture-v1';

-- Alter BiologicalCategory
ALTER TABLE `BiologicalCategory`
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `version` VARCHAR(191) NOT NULL DEFAULT '1.0.0',
  ADD COLUMN `reviewStatus` ENUM('DRAFT', 'IMPORTED', 'REVIEW_REQUIRED', 'APPROVED', 'RETIRED') NOT NULL DEFAULT 'REVIEW_REQUIRED',
  ADD COLUMN `reviewer` VARCHAR(191) NULL,
  ADD COLUMN `reviewedAt` DATETIME(3) NULL;

-- Migrate BiologicalCategoryDefault -> BiologicalCategoryFood
INSERT INTO `BiologicalCategoryFood` (`id`, `categoryId`, `foodId`, `priority`, `eligibilityStatus`, `reviewStatus`)
SELECT `id`, `categoryId`, `foodId`, `rank`, 'IMPORTED', 'REVIEW_REQUIRED'
FROM `BiologicalCategoryDefault`;

DROP TABLE `BiologicalCategoryDefault`;

-- Foreign keys
ALTER TABLE `RequirementSourcePolicy` ADD CONSTRAINT `RequirementSourcePolicy_foodDataSourceId_fkey` FOREIGN KEY (`foodDataSourceId`) REFERENCES `FoodDataSource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `RequirementConflict` ADD CONSTRAINT `RequirementConflict_primaryPolicyId_fkey` FOREIGN KEY (`primaryPolicyId`) REFERENCES `RequirementSourcePolicy`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RequirementConflict` ADD CONSTRAINT `RequirementConflict_secondaryPolicyId_fkey` FOREIGN KEY (`secondaryPolicyId`) REFERENCES `RequirementSourcePolicy`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Food` ADD CONSTRAINT `Food_foodDataSourceId_fkey` FOREIGN KEY (`foodDataSourceId`) REFERENCES `FoodDataSource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Food` ADD CONSTRAINT `Food_sourceImportId_fkey` FOREIGN KEY (`sourceImportId`) REFERENCES `FoodSourceImport`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Food` ADD CONSTRAINT `Food_preparationStateId_fkey` FOREIGN KEY (`preparationStateId`) REFERENCES `PreparationState`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Food` ADD CONSTRAINT `Food_biologicalCategoryId_fkey` FOREIGN KEY (`biologicalCategoryId`) REFERENCES `BiologicalCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `FoodNutrient` ADD CONSTRAINT `FoodNutrient_sourceImportId_fkey` FOREIGN KEY (`sourceImportId`) REFERENCES `FoodSourceImport`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `FoodSourceImport` ADD CONSTRAINT `FoodSourceImport_foodDataSourceId_fkey` FOREIGN KEY (`foodDataSourceId`) REFERENCES `FoodDataSource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `FoodImportReportRow` ADD CONSTRAINT `FoodImportReportRow_importId_fkey` FOREIGN KEY (`importId`) REFERENCES `FoodSourceImport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RequirementSet` ADD CONSTRAINT `RequirementSet_sourcePolicyId_fkey` FOREIGN KEY (`sourcePolicyId`) REFERENCES `RequirementSourcePolicy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `BiologicalCategoryFood` ADD CONSTRAINT `BiologicalCategoryFood_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `BiologicalCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BiologicalCategoryFood` ADD CONSTRAINT `BiologicalCategoryFood_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserAllergen` ADD CONSTRAINT `UserAllergen_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserFoodPreference` ADD CONSTRAINT `UserFoodPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserFoodPreference` ADD CONSTRAINT `UserFoodPreference_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ActivityEntry` ADD CONSTRAINT `ActivityEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ProteinPreference` ADD CONSTRAINT `ProteinPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EnergyEstimate` ADD CONSTRAINT `EnergyEstimate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EnergyEstimate` ADD CONSTRAINT `EnergyEstimate_energyMethodId_fkey` FOREIGN KEY (`energyMethodId`) REFERENCES `EnergyMethod`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `FoodMatrixVersion` ADD CONSTRAINT `FoodMatrixVersion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `FoodMatrixItem` ADD CONSTRAINT `FoodMatrixItem_matrixVersionId_fkey` FOREIGN KEY (`matrixVersionId`) REFERENCES `FoodMatrixVersion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `FoodMatrixItem` ADD CONSTRAINT `FoodMatrixItem_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RedundancyAssessment` ADD CONSTRAINT `RedundancyAssessment_matrixVersionId_fkey` FOREIGN KEY (`matrixVersionId`) REFERENCES `FoodMatrixVersion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RedundancyChoice` ADD CONSTRAINT `RedundancyChoice_matrixVersionId_fkey` FOREIGN KEY (`matrixVersionId`) REFERENCES `FoodMatrixVersion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX `Food_foodDataSourceId_idx` ON `Food`(`foodDataSourceId`);
CREATE INDEX `Food_reviewStatus_devOnly_idx` ON `Food`(`reviewStatus`, `devOnly`);
