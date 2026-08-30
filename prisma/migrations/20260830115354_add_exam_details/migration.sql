-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('INTERNAL', 'FINAL', 'PRACTICAL', 'ASSESSMENT');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'RESULTS_PUBLISHED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "examType" "ExamType" NOT NULL DEFAULT 'FINAL',
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "session" TEXT,
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "status" "ExamStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "year" INTEGER;
