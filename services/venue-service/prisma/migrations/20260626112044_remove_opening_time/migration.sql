/*
  Warnings:

  - You are about to drop the column `closingTime` on the `venues` table. All the data in the column will be lost.
  - You are about to drop the column `openingTime` on the `venues` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "venues" DROP COLUMN "closingTime",
DROP COLUMN "openingTime";
