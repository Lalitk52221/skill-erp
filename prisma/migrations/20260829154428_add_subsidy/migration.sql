/*
  Warnings:

  - A unique constraint covering the columns `[feeStructureId]` on the table `Subsidy` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `Subsidy` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubsidyType" AS ENUM ('BPL', 'GOVT_SCHOOL_LETTER', 'OTHER');

-- AlterTable
ALTER TABLE "Subsidy" DROP COLUMN "type",
ADD COLUMN     "type" "SubsidyType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subsidy_feeStructureId_key" ON "Subsidy"("feeStructureId");
