-- Extend intake profile for 7-section setup and adaptive journey models.

-- AlterTable
ALTER TABLE `IntakeProfile` ADD COLUMN `sex` ENUM('female', 'male') NOT NULL DEFAULT 'female',
    ADD COLUMN `lifestyle` JSON NOT NULL DEFAULT ('{}'),
    ADD COLUMN `foodPreferences` JSON NOT NULL DEFAULT ('{}'),
    ADD COLUMN `practical` JSON NOT NULL DEFAULT ('{}'),
    ADD COLUMN `household` JSON NOT NULL DEFAULT ('{}'),
    ADD COLUMN `weeklyBudgetEur` INTEGER NULL;

-- AlterEnum: add SIMPLE to UnitSystem (MySQL stores as ENUM on column)
ALTER TABLE `IntakeProfile` MODIFY `unitSystem` ENUM('METRIC', 'HOUSEHOLD', 'SIMPLE') NOT NULL DEFAULT 'HOUSEHOLD';

-- CreateTable
CREATE TABLE `AdaptationEvent` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `context` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdaptationEvent_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreferenceRecord` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `tier` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PreferenceRecord_userId_key_key`(`userId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeeklyCheckIn` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `weekNumber` INTEGER NOT NULL,
    `cycleYear` INTEGER NOT NULL,
    `energy` INTEGER NOT NULL,
    `hunger` INTEGER NOT NULL,
    `satisfaction` INTEGER NOT NULL,
    `adherence` INTEGER NOT NULL,
    `difficulty` INTEGER NOT NULL,
    `barriers` JSON NOT NULL,
    `weightKg` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WeeklyCheckIn_userId_cycleYear_weekNumber_key`(`userId`, `cycleYear`, `weekNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdaptationEvent` ADD CONSTRAINT `AdaptationEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreferenceRecord` ADD CONSTRAINT `PreferenceRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklyCheckIn` ADD CONSTRAINT `WeeklyCheckIn_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
