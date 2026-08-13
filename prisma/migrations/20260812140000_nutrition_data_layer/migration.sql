-- Nutrition data layer (Phase 2). Food, nutrient, requirement, and biological category tables.

-- CreateTable
CREATE TABLE `Nutrient` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `unit` ENUM('g', 'mg', 'mcg', 'kcal', 'iu') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Nutrient_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Food` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `sourceVersion` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Food_source_sourceVersion_idx`(`source`, `sourceVersion`),
    UNIQUE INDEX `Food_source_sourceVersion_externalId_key`(`source`, `sourceVersion`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodNutrient` (
    `id` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NOT NULL,
    `nutrientId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `perAmountG` DOUBLE NOT NULL DEFAULT 100,
    `source` VARCHAR(191) NOT NULL,
    `sourceVersion` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `FoodNutrient_foodId_nutrientId_key`(`foodId`, `nutrientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodAllergen` (
    `id` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NOT NULL,
    `allergen` ENUM('egg', 'fish', 'crustaceans', 'molluscs', 'milk', 'soy', 'gluten', 'tree_nuts', 'peanuts', 'sesame', 'celery', 'mustard', 'sulphites', 'lupin') NOT NULL,

    UNIQUE INDEX `FoodAllergen_foodId_allergen_key`(`foodId`, `allergen`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodCategory` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `FoodCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodCategoryMap` (
    `id` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `FoodCategoryMap_foodId_categoryId_key`(`foodId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodSubstitution` (
    `id` VARCHAR(191) NOT NULL,
    `fromFoodId` VARCHAR(191) NOT NULL,
    `toFoodId` VARCHAR(191) NOT NULL,
    `rank` INTEGER NOT NULL DEFAULT 0,
    `reasonTags` JSON NOT NULL,

    INDEX `FoodSubstitution_fromFoodId_rank_idx`(`fromFoodId`, `rank`),
    UNIQUE INDEX `FoodSubstitution_fromFoodId_toFoodId_key`(`fromFoodId`, `toFoodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodSourceImport` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `sourceVersion` VARCHAR(191) NOT NULL,
    `importDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rowCount` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('pending', 'running', 'completed', 'failed') NOT NULL,
    `error` TEXT NULL,

    INDEX `FoodSourceImport_importDate_idx`(`importDate`),
    UNIQUE INDEX `FoodSourceImport_source_sourceVersion_key`(`source`, `sourceVersion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementSet` (
    `id` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `reviewer` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `status` ENUM('draft', 'reviewed', 'approved') NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RequirementSet_version_key`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NutrientRequirement` (
    `id` VARCHAR(191) NOT NULL,
    `setId` VARCHAR(191) NOT NULL,
    `nutrientId` VARCHAR(191) NOT NULL,
    `ageMin` INTEGER NOT NULL,
    `ageMax` INTEGER NOT NULL,
    `sex` ENUM('female', 'male') NULL,
    `value` DOUBLE NOT NULL,
    `unit` ENUM('g', 'mg', 'mcg', 'kcal', 'iu') NOT NULL,

    INDEX `NutrientRequirement_setId_nutrientId_idx`(`setId`, `nutrientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BiologicalCategory` (
    `id` VARCHAR(191) NOT NULL,
    `slug` ENUM('eggs', 'organ_meat', 'small_fish', 'bivalves', 'muscle_meat', 'tubers', 'cruciferous', 'berries', 'olive_oil', 'fermented', 'kiwi', 'mushrooms', 'aromatics') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `BiologicalCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BiologicalCategoryDefault` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NOT NULL,
    `rank` INTEGER NOT NULL DEFAULT 0,

    INDEX `BiologicalCategoryDefault_categoryId_rank_idx`(`categoryId`, `rank`),
    UNIQUE INDEX `BiologicalCategoryDefault_categoryId_foodId_key`(`categoryId`, `foodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FoodNutrient` ADD CONSTRAINT `FoodNutrient_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodNutrient` ADD CONSTRAINT `FoodNutrient_nutrientId_fkey` FOREIGN KEY (`nutrientId`) REFERENCES `Nutrient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodAllergen` ADD CONSTRAINT `FoodAllergen_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodCategoryMap` ADD CONSTRAINT `FoodCategoryMap_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodCategoryMap` ADD CONSTRAINT `FoodCategoryMap_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `FoodCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodSubstitution` ADD CONSTRAINT `FoodSubstitution_fromFoodId_fkey` FOREIGN KEY (`fromFoodId`) REFERENCES `Food`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodSubstitution` ADD CONSTRAINT `FoodSubstitution_toFoodId_fkey` FOREIGN KEY (`toFoodId`) REFERENCES `Food`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NutrientRequirement` ADD CONSTRAINT `NutrientRequirement_setId_fkey` FOREIGN KEY (`setId`) REFERENCES `RequirementSet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NutrientRequirement` ADD CONSTRAINT `NutrientRequirement_nutrientId_fkey` FOREIGN KEY (`nutrientId`) REFERENCES `Nutrient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BiologicalCategoryDefault` ADD CONSTRAINT `BiologicalCategoryDefault_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `BiologicalCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BiologicalCategoryDefault` ADD CONSTRAINT `BiologicalCategoryDefault_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
