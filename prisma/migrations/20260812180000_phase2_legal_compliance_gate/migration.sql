-- Phase 2 finalization: legal compliance gate fields on FoodDataSource

ALTER TABLE `FoodDataSource`
  ADD COLUMN `retrievedAt` DATETIME(3) NULL,
  ADD COLUMN `licenseName` VARCHAR(191) NULL,
  ADD COLUMN `licenseVersion` VARCHAR(191) NULL,
  ADD COLUMN `termsUrl` TEXT NULL,
  ADD COLUMN `storageAllowed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `transformationAllowed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `customerDisplayAllowed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `licenseVerified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `termsVerifiedAt` DATETIME(3) NULL,
  ADD COLUMN `verifiedBy` VARCHAR(191) NULL,
  ADD COLUMN `verificationMethod` VARCHAR(191) NULL,
  ADD COLUMN `verificationNotes` TEXT NULL,
  ADD COLUMN `attributionText` TEXT NULL;

-- Extend DataSourceStatus enum with REJECTED and FUTURE_OPTION
ALTER TABLE `FoodDataSource`
  MODIFY `status` ENUM(
    'CANDIDATE',
    'REVIEW_REQUIRED',
    'APPROVED',
    'REJECTED',
    'FUTURE_OPTION',
    'RETIRED'
  ) NOT NULL DEFAULT 'CANDIDATE';
