-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `discountPercentage` DOUBLE NOT NULL,
    `rating` DOUBLE NOT NULL,
    `stock` INTEGER NOT NULL,
    `tags` JSON NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `weight` INTEGER NOT NULL,
    `dimensions` JSON NOT NULL,
    `warrantyInformation` VARCHAR(191) NOT NULL,
    `shippingInformation` VARCHAR(191) NOT NULL,
    `availabilityStatus` VARCHAR(191) NOT NULL,
    `reviews` JSON NOT NULL,
    `returnPolicy` VARCHAR(191) NOT NULL,
    `minimumOrderQuantity` INTEGER NOT NULL,
    `meta` JSON NOT NULL,
    `images` JSON NOT NULL,
    `thumbnail` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
