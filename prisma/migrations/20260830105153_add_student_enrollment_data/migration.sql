/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,enrollmentNumber]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'ENTREPRENEUR', 'HIGHER_EDUCATION', 'INTERESTED_FOR_JOB', 'NOT_INTERESTED', 'NOT_PLACED', 'OTHER');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "employmentStatus" "EmploymentStatus",
ADD COLUMN     "enrollmentNumber" TEXT,
ADD COLUMN     "session" TEXT,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "aadharNumber" TEXT;

-- CreateIndex
CREATE INDEX "Enrollment_year_idx" ON "Enrollment"("year");

-- CreateIndex
CREATE INDEX "Enrollment_employmentStatus_idx" ON "Enrollment"("employmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_organizationId_enrollmentNumber_key" ON "Enrollment"("organizationId", "enrollmentNumber");

-- CreateIndex
CREATE INDEX "Student_aadharNumber_idx" ON "Student"("aadharNumber");
